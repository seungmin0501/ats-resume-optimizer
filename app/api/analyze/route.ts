import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient, type UserRow } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { deductCredit } from "@/lib/credits";

// Vercel 서버리스 함수 최대 실행 시간 60초로 설정
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 0. Rate limiting
  const rl = await checkRateLimit(req);
  if (!rl.success) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  // 1. 인증 확인
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // 2. 사용자 정보 조회 (없으면 생성)
  const serviceClient = createServiceClient();
  const { data: userData } = await serviceClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userData) {
    await serviceClient.from("users").insert({
      id: user.id,
      email: user.email!,
      plan_tier: "free",
      credits_remaining: 1,
    });
  }

  const currentUser: UserRow = userData || {
    id: user.id,
    email: user.email!,
    plan_tier: "free",
    credits_remaining: 1,
    unlimited_expires_at: null,
    ls_customer_id: null,
    ls_order_id: null,
    created_at: new Date().toISOString(),
  };

  // 3. FormData 파싱 + 입력 검증 (크레딧 차감 전)
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const resumeFile = formData.get("resume") as File | null;
  const jobDescription = formData.get("job_description") as string | null;

  if (!resumeFile || !jobDescription) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (resumeFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }
  if (
    resumeFile.type !== "application/pdf" &&
    !resumeFile.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
  }

  // 4. PDF 텍스트 추출 (크레딧 차감 전)
  const arrayBuffer = await resumeFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let resumeText: string;
  try {
    resumeText = await extractTextFromPdf(buffer);
  } catch {
    return NextResponse.json({ error: "PDF_PARSE_FAILED" }, { status: 422 });
  }
  if (!resumeText.trim()) {
    return NextResponse.json({ error: "PDF_EMPTY" }, { status: 422 });
  }

  const truncatedJob = jobDescription.slice(0, 10000);

  // 5. 크레딧 차감 (입력이 유효할 때만)
  const isUnlimitedUser = currentUser.plan_tier === "unlimited";
  try {
    await deductCredit(serviceClient, currentUser);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "NO_CREDITS";
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  // 6. GPT 분석 + DB 저장 (실패 시 크레딧 복구)
  try {
    const tier = currentUser.plan_tier;
    const isBasicOrAbove = tier === "basic" || tier === "pro" || tier === "unlimited";
    const isProOrAbove = tier === "pro" || tier === "unlimited";

    const result = await analyzeResume(
      truncatedJob,
      resumeText,
      isBasicOrAbove,
      isProOrAbove,
    );

    const { data: analysis } = await serviceClient
      .from("analyses")
      .insert({
        user_id: user.id,
        job_title: result.job_title,
        company_name: result.company_name,
        match_score: result.match_score,
        grade: result.grade,
        missing_keywords: result.missing_keywords,
        section_feedback: result.section_feedback,
        format_warnings: result.format_warnings,
        optimized_resume: isBasicOrAbove ? result.optimized_resume : null,
        cover_letter: isProOrAbove ? result.cover_letter : null,
        interview_prep: isProOrAbove ? result.interview_prep : null,
      })
      .select()
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysisId = (analysis as any)?.id;

    return NextResponse.json({
      ...result,
      analysis_id: analysisId,
      optimized_resume: isBasicOrAbove ? result.optimized_resume : null,
      cover_letter: isProOrAbove ? result.cover_letter : null,
      interview_prep: isProOrAbove ? result.interview_prep : null,
    });

  } catch (err) {
    console.error("[analyze] error:", err);

    // 크레딧 복구 (Unlimited 제외 — 차감 자체를 안 했으므로)
    if (!isUnlimitedUser) {
      try {
        // 레이스 컨디션 방지: 현재 DB 값에서 +1 증가
        const { data: fresh } = await serviceClient
          .from("users")
          .select("credits_remaining")
          .eq("id", user.id)
          .single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const current = (fresh as any)?.credits_remaining ?? 0;
        await serviceClient
          .from("users")
          .update({ credits_remaining: current + 1 })
          .eq("id", user.id);
        console.log("[analyze] credit refunded for user:", user.id);
      } catch (refundErr) {
        console.error("[analyze] credit refund failed:", refundErr);
      }
    }

    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
