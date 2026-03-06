"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type SectionFeedback = {
  summary: string;
  experience: string;
  skills: string;
};

type SectionKey = keyof SectionFeedback;

type FeedbackCardProps = {
  feedback: SectionFeedback;
  isPro: boolean;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function FeedbackCard({ feedback, isPro }: FeedbackCardProps) {
  const t = useTranslations("results");
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    () => new Set<SectionKey>(["summary"])
  );

  const sections: { key: SectionKey; label: string }[] = [
    { key: "summary", label: t("section_summary") },
    { key: "experience", label: t("section_experience") },
    { key: "skills", label: t("section_skills") },
  ];

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set<SectionKey>(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        {t("section_feedback_title")}
      </h3>

      <div className="space-y-2">
        {sections.map(({ key, label }, index) => {
          const isLocked = !isPro && index > 0;
          const isOpen = openSections.has(key);

          return (
            <div
              key={key}
              className="border border-gray-100 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                onClick={() => !isLocked && toggle(key)}
              >
                <span className="text-sm font-medium text-gray-900">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  {isLocked && <span className="text-xs text-gray-400">🔒</span>}
                  <ChevronIcon open={isOpen && !isLocked} />
                </div>
              </button>

              {isOpen && !isLocked && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feedback[key]}
                  </p>
                </div>
              )}

              {isLocked && (
                <div className="px-4 pb-3 blur-locked">
                  <p className="text-sm text-gray-400">
                    {t("feedback_locked")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isPro && (
        <button className="mt-4 w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700">
          {t("blur_cta")} →
        </button>
      )}
    </div>
  );
}
