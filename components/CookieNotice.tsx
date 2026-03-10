"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookie");

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie_notice_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem("cookie_notice_dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-lg">
      <p className="text-gray-300 leading-snug">
        {t("notice")}{" "}
        <Link href="/privacy" className="underline text-blue-400 hover:text-blue-300">
          {t("privacy_link")}
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 bg-white text-gray-900 font-semibold text-xs px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
