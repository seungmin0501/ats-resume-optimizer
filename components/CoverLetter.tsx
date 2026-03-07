"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type CoverLetterProps = {
  content: string | null;
  isProOrAbove: boolean;
  onUpgradeClick: () => void;
};

export default function CoverLetter({ content, isProOrAbove, onUpgradeClick }: CoverLetterProps) {
  const t = useTranslations("results");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{t("cover_letter_title")}</h3>
        {isProOrAbove && content && (
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {copied ? t("cover_letter_copied") : t("cover_letter_copy")}
          </button>
        )}
      </div>

      {isProOrAbove && content ? (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      ) : (
        <div>
          <div className="text-sm text-gray-300 leading-relaxed select-none blur-sm pointer-events-none line-clamp-4">
            Dear Hiring Manager, I am writing to express my strong interest in the position at your company. With my background in software engineering and proven track record of delivering high-quality solutions, I am confident I would be a valuable addition to your team. My experience aligns closely with the requirements outlined in your job description...
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
