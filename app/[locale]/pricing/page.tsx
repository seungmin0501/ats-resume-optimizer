import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Pricing — ATS Resume Optimizer",
  description:
    "Start free with 3 scans/month. Upgrade to Pro for $12/month for unlimited scans and AI-optimized resume downloads.",
};

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">{tNav("logo")}</Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link href="/analyze" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              {tNav("login")}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">
          {t("title")}
        </h1>
        <p className="text-center text-gray-500 mb-12">{t("subtitle")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t("free_plan")}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">{t("per_month")}</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[t("feature_scans_free"), t("feature_score"), t("feature_feedback_free")].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckIcon /> {f}
                </li>
              ))}
              {[t("feature_docx"), t("feature_feedback_pro")].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-400 line-through">
                  <XIcon /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/analyze"
              className="block text-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl py-3 font-semibold transition-colors"
            >
              {t("cta_free")}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 relative shadow-lg shadow-blue-100">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              {t("badge_best")}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t("pro_plan")}</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-gray-900">$12</span>
              <span className="text-gray-500">{t("per_month")}</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              or $99{t("per_year")} <span className="text-green-600 font-semibold">{t("save_badge")}</span>
            </p>
            <ul className="space-y-4 mb-8">
              {[t("feature_scans_pro"), t("feature_score"), t("feature_feedback_pro"), t("feature_docx"), t("feature_history")].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <a
                href="/api/checkout?plan=monthly"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-colors"
              >
                {t("cta_pro")}
              </a>
              <a
                href="/api/checkout?plan=yearly"
                className="block text-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                {t("cta_pro_yearly")}
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("faq_title")}</h2>
          <div className="space-y-6">
            {[
              { q: t("faq_1_q"), a: t("faq_1_a") },
              { q: t("faq_2_q"), a: t("faq_2_a") },
              { q: t("faq_3_q"), a: t("faq_3_a") },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
