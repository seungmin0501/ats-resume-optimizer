import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const translations: Record<string, { title1: string; title2: string; subtitle: string; free: string; powered: string; languages: string }> = {
  en: {
    title1: "Beat the ATS.",
    title2: "Land More Interviews.",
    subtitle: "Upload your resume · Paste a job posting · Get your match score in seconds.",
    free: "Free",
    powered: "powered",
    languages: "languages",
  },
  ko: {
    title1: "ATS를 뚫어라.",
    title2: "더 많은 면접 기회를.",
    subtitle: "이력서 업로드 · 채용공고 붙여넣기 · 매칭 점수를 즉시 확인.",
    free: "무료",
    powered: "AI 분석",
    languages: "지원 언어",
  },
  ja: {
    title1: "ATSを突破せよ。",
    title2: "面接チャンスを増やそう。",
    subtitle: "履歴書をアップロード · 求人票を貼り付け · マッチスコアを即確認。",
    free: "無料",
    powered: "AI分析",
    languages: "対応言語",
  },
  es: {
    title1: "Supera el ATS.",
    title2: "Consigue más entrevistas.",
    subtitle: "Sube tu CV · Pega la oferta · Obtén tu puntuación al instante.",
    free: "Gratis",
    powered: "con IA",
    languages: "idiomas",
  },
  "zh-CN": {
    title1: "突破ATS筛选。",
    title2: "获得更多面试机会。",
    subtitle: "上传简历 · 粘贴职位描述 · 立即获取匹配分数。",
    free: "免费",
    powered: "AI驱动",
    languages: "支持语言",
  },
};

export default function OGImage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? "en";
  const t = translations[locale] ?? translations.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.2)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(99, 102, 241, 0.3)",
            border: "1px solid rgba(165, 180, 252, 0.4)",
            borderRadius: "999px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#a5b4fc", fontSize: "18px", fontWeight: 600 }}>
            ✦ AI-Powered Resume Optimization
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {t.title1}
          </span>
          <span
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "#818cf8",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {t.title2}
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "22px",
            color: "#c7d2fe",
            textAlign: "center",
            maxWidth: "750px",
            lineHeight: 1.5,
            margin: "0 0 48px 0",
          }}
        >
          {t.subtitle}
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { value: t.free, label: "to start" },
            { value: "GPT-4o", label: t.powered },
            { value: "5", label: t.languages },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "30px", fontWeight: 700, color: "#ffffff" }}>
                {stat.value}
              </span>
              <span style={{ fontSize: "16px", color: "#a5b4fc" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "#6366f1",
            fontSize: "18px",
          }}
        >
          ats-resume-optimizer-ten.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
