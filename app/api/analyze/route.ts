import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient, type UserRow } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";

const FREE_CREDIT_LIMIT = 3;

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

    // 2. 사용자 정보 및 크레딧 확인
    const serviceClient = createServiceClient();
    const { data: userData } = await serviceClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData) {
      // 사용자 레코드가 없으면 생성
      await serviceClient.from("users").insert({
        id: user.id,
        email: user.email!,
        plan: "free",
        credits_used: 0,
      });
    }

    const currentUser: UserRow = userData || {
      id: user.id,
      email: user.email!,
      plan: "free",
      credits_used: 0,
      credits_reset: null,
      ls_customer_id: null,
      ls_subscription_id: null,
      created_at: new Date().toISOString(),
    };

    // 크레딧 소진 확인 (무료 사용자만)
    if (
      currentUser.plan === "free" &&
      currentUser.credits_used >= FREE_CREDIT_LIMIT
    ) {
      return NextResponse.json(
        {
          error: "CREDIT_EXHAUSTED",
          creditsReset: currentUser.credits_reset,
        },
        { status: 403 }
      );
    }

    // 3. FormData 파싱
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("job_description") as string | null;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // PDF 파일 크기 검증 (5MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE" },
        { status: 413 }
      );
    }

    // PDF MIME type 검증
    if (
      resumeFile.type !== "application/pdf" &&
      !resumeFile.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "INVALID_FILE_TYPE" },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한
    const truncatedJob = jobDescription.slice(0, 10000);

    // 4. PDF 텍스트 추출
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let resumeText: string;

    try {
      resumeText = await extractTextFromPdf(buffer);
    } catch {
      return NextResponse.json(
        { error: "PDF_PARSE_FAILED" },
        { status: 422 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "PDF_EMPTY" },
        { status: 422 }
      );
    }

    // 5. GPT 분석
    const isPro = currentUser.plan === "pro";
    const result = await analyzeResume(truncatedJob, resumeText, isPro);

    // 6. 분석 결과 저장
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
        optimized_resume: isPro ? result.optimized_resume : null,
      })
      .select()
      .single();

    // 7. 크레딧 차감 (무료 사용자)
    if (!isPro) {
      await serviceClient
        .from("users")
        .update({ credits_used: currentUser.credits_used + 1 })
        .eq("id", user.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysisId = (analysis as any)?.id;

    return NextResponse.json({
      ...result,
      analysis_id: analysisId,
      // 무료 사용자는 optimized_resume null
      optimized_resume: isPro ? result.optimized_resume : null,
    });
  } catch (err) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
