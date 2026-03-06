"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

type JobInputProps = {
  onTextReady: (text: string) => void;
};

function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export default function JobInput({ onTextReady }: JobInputProps) {
  const t = useTranslations("analyze");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const scrapeUrl = useCallback(
    async (url: string) => {
      setStatus("loading");
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("loaded");
          onTextReady(data.text);
        } else {
          setStatus("error");
          onTextReady("");
        }
      } catch {
        setStatus("error");
        onTextReady("");
      }
    },
    [onTextReady]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    setStatus("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isUrl(val.trim())) {
      debounceRef.current = setTimeout(() => {
        scrapeUrl(val.trim());
      }, 800);
    } else {
      onTextReady(val);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={t("job_input_placeholder")}
        rows={6}
        maxLength={10000}
        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full resize-none text-sm outline-none transition-shadow"
      />

      {/* 상태 인디케이터 */}
      <div className="absolute bottom-3 right-3">
        {status === "loading" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fetching...
          </div>
        )}
        {status === "loaded" && (
          <span className="text-xs text-green-600 font-medium">
            {t("job_loaded")}
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-600">
            {t("job_scrape_failed")}
          </span>
        )}
      </div>
    </div>
  );
}
