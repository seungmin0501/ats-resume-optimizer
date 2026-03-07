"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type InterviewQuestion = {
  question: string;
  model_answer: string;
  keywords: string[];
};

type InterviewPrepProps = {
  data: { questions: InterviewQuestion[] } | null;
  isProOrAbove: boolean;
  onUpgradeClick: () => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function InterviewPrep({ data, isProOrAbove, onUpgradeClick }: InterviewPrepProps) {
  const t = useTranslations("results");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{t("interview_prep_title")}</h3>

      {isProOrAbove && data?.questions?.length ? (
        <div className="space-y-2">
          {data.questions.map((q, i) => (
            <div key={i} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggle(i)}
              >
                <span className="text-sm font-medium text-gray-900 pr-2">
                  Q{i + 1}. {q.question}
                </span>
                <ChevronIcon open={openIndex === i} />
              </button>

              {openIndex === i && (
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {t("interview_answer_label")}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{q.model_answer}</p>
                  </div>
                  {q.keywords?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        {t("interview_keywords_label")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {q.keywords.map((kw, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="space-y-2 blur-sm select-none pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-100 rounded-lg px-4 py-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
          <button
            onClick={onUpgradeClick}
            className="mt-4 w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            {t("blur_cta_pro")} →
          </button>
        </div>
      )}
    </div>
  );
}
