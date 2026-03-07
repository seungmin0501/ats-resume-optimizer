import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Pricing — ATS Resume Optimizer",
  description:
    "One-time pricing. No subscription. Get your ATS match score, optimized resume, cover letter, and interview prep from $5.",
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const tNav = await getTranslations("nav");

  const plans = [
    {
      key: "free",
      name: t("free_plan"),
      price: "$0",
      priceNote: null,
      badge: null,
      highlight: false,
      ctaLabel: t("cta_free"),
      ctaHref: "/analyze",
      ctaStyle: "border border-blue-600 text-blue-600 hover:bg-blue-50",
      features: [
        { label: t("feature_scans_free"), included: true },
        { label: t("feature_score"), included: true },
        { label: t("feature_feedback_free"), included: true },
        { label: t("feature_feedback_basic"), included: false },
        { label: t("feature_docx"), included: false },
        { label: t("feature_cover_letter"), included: false },
        { label: t("feature_interview"), included: false },
        { label: t("feature_multilingual"), included: false },
      ],
    },
    {
      key: "basic",
      name: t("basic_plan"),
      price: "$5",
      priceNote: t("one_time"),
      badge: null,
      highlight: false,
      ctaLabel: t("cta_basic"),
      ctaHref: "/api/checkout?plan=basic",
      ctaStyle: "border border-blue-600 text-blue-600 hover:bg-blue-50",
      features: [
        { label: t("feature_scans_basic"), included: true },
        { label: t("feature_score"), included: true },
        { label: t("feature_feedback_basic"), included: true },
        { label: t("feature_docx"), included: true },
        { label: t("feature_cover_letter"), included: false },
        { label: t("feature_interview"), included: false },
        { label: t("feature_multilingual"), included: false },
      ],
    },
    {
      key: "pro",
      name: t("pro_plan"),
      price: "$15",
      priceNote: t("one_time"),
      badge: t("most_popular"),
      highlight: true,
      ctaLabel: t("cta_pro"),
      ctaHref: "/api/checkout?plan=pro",
      ctaStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      features: [
        { label: t("feature_scans_pro"), included: true },
        { label: t("feature_score"), included: true },
        { label: t("feature_feedback_pro"), included: true },
        { label: t("feature_docx"), included: true },
        { label: t("feature_cover_letter"), included: true },
        { label: t("feature_interview"), included: true },
        { label: t("feature_multilingual"), included: false },
      ],
    },
    {
      key: "unlimited",
      name: t("unlimited_plan"),
      price: "$29",
      priceNote: t("one_time"),
      badge: null,
      highlight: false,
      ctaLabel: t("cta_unlimited"),
      ctaHref: "/api/checkout?plan=unlimited",
      ctaStyle: "border border-purple-600 text-purple-600 hover:bg-purple-50",
      features: [
        { label: t("feature_scans_unlimited"), included: true },
        { label: t("feature_score"), included: true },
        { label: t("feature_feedback_pro"), included: true },
        { label: t("feature_docx"), included: true },
        { label: t("feature_cover_letter"), included: true },
        { label: t("feature_interview"), included: true },
        { label: t("feature_multilingual"), included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">{tNav("logo")}</Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <Link
              href="/analyze"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              {tNav("login")}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">{t("title")}</h1>
        <p className="text-center text-gray-500 mb-12">{t("subtitle")}</p>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl bg-white p-6 flex flex-col relative ${
                plan.highlight
                  ? "border-2 border-blue-600 shadow-lg shadow-blue-100"
                  : "border border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-base font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="text-xs text-gray-400">{plan.priceNote}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className={`flex items-start gap-2 text-sm ${f.included ? "text-gray-700" : "text-gray-300"}`}>
                    {f.included ? <CheckIcon /> : <XIcon />}
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`block text-center rounded-xl py-3 font-semibold text-sm transition-colors ${plan.ctaStyle}`}
              >
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </div>

        {/* No subscription note */}
        <p className="text-center text-sm text-gray-400 mt-8">{t("no_subscription")}</p>

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
