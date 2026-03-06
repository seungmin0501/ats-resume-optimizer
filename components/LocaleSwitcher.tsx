"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

const localeLabels: Record<string, string> = {
  en: "EN",
  ko: "한",
  ja: "日",
  es: "ES",
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1">
      {Object.entries(localeLabels).map(([loc, label]) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          disabled={isPending}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === loc
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
