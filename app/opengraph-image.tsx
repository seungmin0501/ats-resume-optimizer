import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Free ATS Resume Checker & Optimizer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        {/* Background decoration */}
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
              fontSize: "64px",
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Beat the ATS.
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#818cf8",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Land More Interviews.
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "#c7d2fe",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.5,
            margin: "0 0 48px 0",
          }}
        >
          Upload your resume · Paste a job posting · Get your match score & optimized resume in seconds.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { value: "Free", label: "to start" },
            { value: "GPT-4o", label: "powered" },
            { value: "5", label: "languages" },
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
              <span style={{ fontSize: "32px", fontWeight: 700, color: "#ffffff" }}>
                {stat.value}
              </span>
              <span style={{ fontSize: "16px", color: "#a5b4fc" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
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
