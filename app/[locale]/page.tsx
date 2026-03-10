import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Optimizer — Beat the Bots, Land Interviews",
  description:
    "Instantly check how well your resume matches any job posting. Get a match score, missing keywords, and an AI-optimized resume. Free to start.",
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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tNav = await getTranslations("nav");
  const tPricing = await getTranslations("pricing");

  // 로그인 상태 확인
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-lg text-blue-600">{tNav("logo")}</span>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/analyze" className="text-sm text-gray-700 hover:text-gray-900">
                  {tNav("dashboard").replace("대시보드", "대시보드") && tNav("dashboard")}
                </Link>
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name || ""} className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                      {(name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {name && <span className="text-sm font-medium text-gray-700 hidden md:block">{name}</span>}
                  <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                      {tNav("logout")}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <a
                href="/api/auth/google?next=/"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                {tNav("login")}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          <span className="block">{t("hero_title_1")}</span>
          <span className="block">{t("hero_title_2")}</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 lg:whitespace-nowrap">
          {t("hero_sub")}
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 text-lg font-semibold transition-colors shadow-lg shadow-blue-200"
        >
          {t("cta_primary")}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t("how_it_works_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: t("step1_title"), desc: t("step1_desc"), icon: "📄" },
            { title: t("step2_title"), desc: t("step2_desc"), icon: "📋" },
            { title: t("step3_title"), desc: t("step3_desc"), icon: "🎯" },
          ].map(({ title, desc, icon }, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center mb-4">
                {icon}
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-t border-gray-200 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            {t("pricing_title")}
          </h2>
          <p className="text-center text-gray-500 mb-12">{tPricing("subtitle")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 flex flex-col">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$0</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">1 scan</p>
              <ul className="space-y-3 flex-1 text-sm">
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_score")}</li>
                <li className="flex items-center gap-2 text-gray-400"><XIcon />{tPricing("feature_feedback_basic")}</li>
                <li className="flex items-center gap-2 text-gray-400"><XIcon />{tPricing("feature_docx")}</li>
                <li className="flex items-center gap-2 text-gray-400"><XIcon />{tPricing("feature_cover_letter")}</li>
              </ul>
              <Link href="/analyze" className="mt-6 block text-center rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 text-sm transition-colors">
                {tPricing("cta_free")}
              </Link>
            </div>

            {/* Basic */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$5</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">3 scans · {tPricing("one_time")}</p>
              <ul className="space-y-3 flex-1 text-sm">
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_score")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_feedback_basic")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_docx")}</li>
                <li className="flex items-center gap-2 text-gray-400"><XIcon />{tPricing("feature_cover_letter")}</li>
              </ul>
              <a href="/api/checkout?plan=basic" className="mt-6 block text-center rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 text-sm transition-colors">
                {tPricing("cta_basic")}
              </a>
            </div>

            {/* Pro — Most Popular */}
            <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 flex flex-col relative shadow-lg shadow-blue-100">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {tPricing("most_popular")}
              </span>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$15</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">10 scans · {tPricing("one_time")}</p>
              <ul className="space-y-3 flex-1 text-sm">
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_score")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_feedback_basic")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_docx")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_cover_letter")}</li>
              </ul>
              <a href="/api/checkout?plan=pro" className="mt-6 block text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm transition-colors">
                {tPricing("cta_pro")}
              </a>
            </div>

            {/* Unlimited */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 flex flex-col">
              <p className="text-sm font-semibold text-purple-500 uppercase tracking-wide mb-3">Unlimited</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">$29</span>
              </div>
              <p className="text-sm text-purple-400 mb-6">90 days · {tPricing("one_time")}</p>
              <ul className="space-y-3 flex-1 text-sm">
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_score")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_feedback_basic")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_docx")}</li>
                <li className="flex items-center gap-2 text-gray-700"><CheckIcon />{tPricing("feature_cover_letter")}</li>
              </ul>
              <a href="/api/checkout?plan=unlimited" className="mt-6 block text-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 text-sm transition-colors">
                {tPricing("cta_unlimited")}
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ + Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">{tPricing("faq_title")}</h3>
          <div className="space-y-6">
            {[
              { q: tPricing("faq_1_q"), a: tPricing("faq_1_a") },
              { q: tPricing("faq_2_q"), a: tPricing("faq_2_a") },
              { q: tPricing("faq_3_q"), a: tPricing("faq_3_a") },
              { q: tPricing("faq_4_q"), a: tPricing("faq_4_a") },
              { q: tPricing("faq_5_q"), a: tPricing("faq_5_a") },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>{t("copyright")}</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700">{t("privacy_policy")}</Link>
            <Link href="/terms" className="hover:text-gray-700">{t("terms_of_service")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
