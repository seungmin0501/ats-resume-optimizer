import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient, type UserRow } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { deductCredit } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting
    const rl = await checkRateLimit(req);
    if (!rl.success) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    // 1. 인증 확인
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    // 3. 크레딧 차감 시도
    try {
      await deductCredit(serviceClient, currentUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "NO_CREDITS";
      return NextResponse.json(
        { error: msg },
        { status: 403 }
      );
    }

    // 4. FormData 파싱
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("job_description") as string | null;
    const targetLanguage = (formData.get("target_language") as string) || "en";

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

    const truncatedJob = jobDescription.slice(0, 10000);

    // 5. PDF 텍스트 추출
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

    // 6. 플랜별 기능 범위 결정
    const tier = currentUser.plan_tier;
    const isBasicOrAbove = tier === "basic" || tier === "pro" || tier === "unlimited";
    const isProOrAbove = tier === "pro" || tier === "unlimited";
    const isUnlimited = tier === "unlimited";

    // 7. GPT 분석
    const result = await analyzeResume(
      truncatedJob,
      resumeText,
      isBasicOrAbove,
      isProOrAbove,
      isUnlimited ? targetLanguage : "en"
    );

    // 8. 분석 결과 저장
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
        target_language: isUnlimited ? targetLanguage : "en",
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
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
