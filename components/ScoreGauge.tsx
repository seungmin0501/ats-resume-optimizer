"use client";

import { useTranslations } from "next-intl";

type ScoreGaugeProps = {
  score: number;
  grade: "A" | "B" | "C" | "D";
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#16A34A"; // success
  if (score >= 60) return "#D97706"; // warning
  return "#DC2626"; // danger
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export default function ScoreGauge({ score, grade }: ScoreGaugeProps) {
  const t = useTranslations("results");

  const gradeDescMap: Record<string, string> = {
    A: t("grade_a_desc"),
    B: t("grade_b_desc"),
    C: t("grade_c_desc"),
    D: t("grade_d_desc"),
  };

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 54; // radius=54
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-xl border p-6 ${getBgColor(score)}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-4">
        {t("match_score_label")}
      </h3>

      <div className="flex items-center gap-6">
        {/* 원형 게이지 */}
        <div className="relative">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* 배경 원 */}
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
            />
            {/* 점수 원 */}
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreLabel(score)}`}>
              {grade}
            </span>
          </div>
        </div>

        {/* 점수 및 설명 */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-5xl font-bold ${getScoreLabel(score)}`}>
              {score}
            </span>
            <span className="text-gray-400 text-lg">/ 100</span>
          </div>
          <p className={`text-base font-medium ${getScoreLabel(score)}`}>
            {gradeDescMap[grade]}
          </p>
        </div>
      </div>

      {/* 프로그레스바 */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
