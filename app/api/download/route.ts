import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";

// ─── 언어 감지 ────────────────────────────────────────────────
type Lang = "ko" | "ja" | "zh" | "es" | "en";

function detectLanguage(text: string): Lang {
  const ko = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const ja = (text.match(/[\u3040-\u30FF]/g) || []).length;
  const zh = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  const es = (text.match(/[áéíóúüñÁÉÍÓÚÜÑ¿¡]/g) || []).length;
  if (ko > 10) return "ko";
  if (ja > 10) return "ja";
  if (zh > 10) return "zh";
  if (es > 5) return "es";
  return "en";
}

// ─── 언어별 템플릿 설정 ─────────────────────────────────────
type Template = {
  font: string;
  headingColor: string;
  bodySize: number;       // half-points
  headingSize: number;
  sectionKeywords: string[];
};

const TEMPLATES: Record<Lang, Template> = {
  en: {
    font: "Calibri",
    headingColor: "1D4ED8",
    bodySize: 22,
    headingSize: 26,
    sectionKeywords: [
      "EXPERIENCE", "WORK EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY",
      "OBJECTIVE", "CERTIFICATIONS", "PROJECTS", "AWARDS", "LANGUAGES",
      "REFERENCES", "PUBLICATIONS", "VOLUNTEER",
    ],
  },
  es: {
    font: "Calibri",
    headingColor: "1D4ED8",
    bodySize: 22,
    headingSize: 26,
    sectionKeywords: [
      "EXPERIENCIA", "EDUCACIÓN", "HABILIDADES", "RESUMEN", "OBJETIVO",
      "CERTIFICACIONES", "PROYECTOS", "IDIOMAS", "REFERENCIAS",
      "EXPERIENCE", "EDUCATION", "SKILLS",
    ],
  },
  ko: {
    font: "Malgun Gothic",
    headingColor: "1E3A8A",
    bodySize: 22,
    headingSize: 26,
    sectionKeywords: [
      "경력", "학력", "기술", "자기소개", "자격증", "수상", "프로젝트",
      "인적사항", "연락처", "어학", "교육", "보유기술", "주요성과",
      "EXPERIENCE", "EDUCATION", "SKILLS",
    ],
  },
  ja: {
    font: "Yu Gothic",
    headingColor: "1E3A5F",
    bodySize: 22,
    headingSize: 26,
    sectionKeywords: [
      "職歴", "学歴", "スキル", "自己PR", "資格", "氏名", "経験",
      "プロジェクト", "受賞", "語学",
    ],
  },
  zh: {
    font: "Microsoft YaHei",
    headingColor: "1D4ED8",
    bodySize: 22,
    headingSize: 26,
    sectionKeywords: [
      "工作经历", "教育背景", "技能", "个人信息", "项目经验", "获奖",
      "语言能力", "证书", "自我评价",
    ],
  },
};

// ─── 섹션 헤딩 감지 ─────────────────────────────────────────
function isSectionHeading(line: string, keywords: string[]): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return false;

  // 명시적 키워드 매칭 (대소문자 무시)
  const upper = trimmed.toUpperCase();
  if (keywords.some((k) => upper === k.toUpperCase() || upper.startsWith(k.toUpperCase() + " "))) {
    return true;
  }
  // 영문 전체 대문자 + 짧은 줄 (마침표/쉼표 없음)
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length < 40 &&
    /[A-Z]/.test(trimmed) &&
    !trimmed.includes(".") &&
    !trimmed.includes(",")
  ) {
    return true;
  }
  // 줄 끝 콜론으로 끝나는 짧은 줄
  if (trimmed.endsWith(":") && trimmed.length < 30) return true;

  return false;
}

// ─── DOCX 빌드 ───────────────────────────────────────────────
function buildDocx(resumeText: string): Promise<Uint8Array> {
  const lang = detectLanguage(resumeText);
  const tmpl = TEMPLATES[lang];
  const lines = resumeText.split("\n");
  const paragraphs: Paragraph[] = [];

  // 첫 줄은 이름으로 간주 (있을 경우)
  let firstContentLine = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      continue;
    }

    // 첫 번째 내용 줄 → 이름 (크게, 중앙 정렬)
    if (firstContentLine) {
      firstContentLine = false;
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: trimmed,
              font: tmpl.font,
              size: 36,
              bold: true,
              color: tmpl.headingColor,
            }),
          ],
        })
      );
      continue;
    }

    // 이메일/전화/링크가 포함된 줄 → 연락처 (중앙, 작게)
    const isContact =
      trimmed.includes("@") ||
      /\+?\d[\d\s\-().]{7,}/.test(trimmed) ||
      trimmed.toLowerCase().includes("linkedin") ||
      trimmed.toLowerCase().includes("github");

    if (isContact) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              font: tmpl.font,
              size: 18,
              color: "6B7280",
            }),
          ],
        })
      );
      continue;
    }

    // 섹션 헤딩
    if (isSectionHeading(trimmed, tmpl.sectionKeywords)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          border: {
            bottom: {
              color: tmpl.headingColor,
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          children: [
            new TextRun({
              text: trimmed.replace(/:$/, ""),
              font: tmpl.font,
              size: tmpl.headingSize,
              bold: true,
              color: tmpl.headingColor,
            }),
          ],
        })
      );
      continue;
    }

    // 불릿 포인트 (•, -, *)
    const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)/);
    if (bulletMatch) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.25) },
          children: [
            new TextRun({ text: "•  ", font: tmpl.font, size: tmpl.bodySize, color: tmpl.headingColor }),
            new TextRun({ text: bulletMatch[2], font: tmpl.font, size: tmpl.bodySize }),
          ],
        })
      );
      continue;
    }

    // 날짜/기간이 포함된 줄 (직책/직위 라인) → 볼드
    const isJobTitle =
      /\d{4}/.test(trimmed) &&
      trimmed.length < 80 &&
      !trimmed.includes("  ");

    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: trimmed,
            font: tmpl.font,
            size: tmpl.bodySize,
            bold: isJobTitle,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc).then((buf) => new Uint8Array(buf));
}

// ─── API 핸들러 ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

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

    const { analysis_id } = await req.json();

    const { data: analysis } = await serviceClient
      .from("analyses")
      .select("optimized_resume, company_name, job_title")
      .eq("id", analysis_id)
      .eq("user_id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysisData = analysis as any;

    if (!analysisData?.optimized_resume) {
      return NextResponse.json({ error: "ANALYSIS_NOT_FOUND" }, { status: 404 });
    }

    const docBuffer = await buildDocx(analysisData.optimized_resume as string);

    const filename = `resume-${(analysisData.company_name as string) || "optimized"}.docx`
      .replace(/[^a-zA-Z0-9-_.]/g, "-")
      .toLowerCase();

    return new NextResponse(docBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[download] error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
