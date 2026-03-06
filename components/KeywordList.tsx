"use client";

import { useTranslations } from "next-intl";

type KeywordListProps = {
  keywords: string[];
};

export default function KeywordList({ keywords }: KeywordListProps) {
  const t = useTranslations("results");

  if (keywords.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        {t("missing_keywords_title")}{" "}
        <span className="text-gray-900 font-semibold">({keywords.length})</span>
      </h3>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
