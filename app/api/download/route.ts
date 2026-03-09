import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

function buildDocx(resumeText: string): Promise<Uint8Array> {
  const lines = resumeText.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "" }));
      continue;
    }

    // 간단한 헤딩 감지: 전체 대문자이거나 짧고 마침표 없는 줄
    const isHeading =
      trimmed === trimmed.toUpperCase() && trimmed.length < 50 && !trimmed.includes(".");

    if (isHeading) {
      paragraphs.push(
        new Paragraph({
          text: trimmed,
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 24 })],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBuffer(doc).then((buf) => new Uint8Array(buf));
}

export async function POST(req: NextRequest) {
  try {
    // 1. 인증
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2. 유료 사용자 확인 (DB에서 직접 확인, 프론트 상태 불신)
    const serviceClient = createServiceClient();
    const { data: userData } = await serviceClient
      .from("users")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tier = (userData as any)?.plan_tier;
    if (!tier || tier === "free") {
      return NextResponse.json({ error: "BASIC_REQUIRED" }, { status: 403 });
    }

    // 3. 분석 데이터 조회
    const { analysis_id } = await req.json();

    const { data: analysis } = await serviceClient
      .from("analyses")
      .select("optimized_resume, company_name, job_title")
      .eq("id", analysis_id)
      .eq("user_id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysisData = analysis as any;

    if (!analysisData || !analysisData.optimized_resume) {
      return NextResponse.json(
        { error: "ANALYSIS_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 4. DOCX 생성
    const docBuffer = await buildDocx(analysisData.optimized_resume as string);

    const filename = `resume-${(analysisData.company_name as string) || "optimized"}.docx`
      .replace(/[^a-zA-Z0-9-_.]/g, "-")
      .toLowerCase();

    return new NextResponse(docBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[download] error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
