import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export const metadata: Metadata = {
  title: "Dashboard — ATS Resume Optimizer",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700"
    : score >= 60 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score}
    </span>
  );
}

type AnalysisItem = {
  id: string;
  job_title: string | null;
  company_name: string | null;
  match_score: number;
  grade: string;
  created_at: string;
};

type UserData = {
  plan: "free" | "pro";
  credits_used: number;
  credits_reset: string | null;
  email: string;
};

function DashboardView({
  user,
  analyses,
  isPro,
  creditsRemaining,
}: {
  user: UserData | null;
  analyses: AnalysisItem[];
  isPro: boolean;
  creditsRemaining: number | null;
}) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">{tNav("logo")}</Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {isPro && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Pro</span>
            )}
            <Link href="/analyze" className="text-sm text-gray-700 hover:text-gray-900">{t("new_analysis")}</Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">{tNav("logout")}</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs text-gray-500 mb-1">{t("plan_label")}</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{user?.plan || "Free"}</p>
          </div>
          {!isPro && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs text-gray-500 mb-1">{t("credits_label")}</p>
              <p className="text-xl font-bold text-gray-900">{creditsRemaining} / 3</p>
            </div>
          )}
          {!isPro && user?.credits_reset && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs text-gray-500 mb-1">{t("resets_label")}</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date(user.credits_reset).toLocaleDateString()}
              </p>
            </div>
          )}
          {!isPro && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 flex flex-col justify-between">
              <p className="text-xs text-blue-600 font-medium mb-2">{t("upgrade_title")}</p>
              <p className="text-sm text-gray-600 mb-4">{t("upgrade_desc")}</p>
              <Link href="/pricing" className="text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold">
                {t("upgrade_cta")}
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t("history_title")}</h2>
          </div>
          {analyses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p className="text-sm">{t("history_empty")}</p>
              <Link href="/analyze" className="mt-4 inline-block text-blue-600 font-medium text-sm hover:underline">
                {t("new_analysis")} →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {analysis.company_name || t("unknown_company")}
                      {analysis.job_title && (
                        <span className="text-gray-500 font-normal"> — {analysis.job_title}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={analysis.match_score} />
                    <span className="text-xs text-gray-400">{t("grade_prefix")} {analysis.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/analyze`);

  const serviceClient = createServiceClient();
  const [{ data: userRaw }, { data: analysesRaw }] = await Promise.all([
    serviceClient.from("users").select("plan, credits_used, credits_reset, email").eq("id", user.id).single(),
    serviceClient.from("analyses").select("id, job_title, company_name, match_score, grade, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = userRaw as any as UserData | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analyses = (analysesRaw as any[] | null) as AnalysisItem[] | null;

  const isPro = userData?.plan === "pro";
  const creditsRemaining = isPro ? null : Math.max(0, 3 - (userData?.credits_used || 0));

  return <DashboardView user={userData} analyses={analyses || []} isPro={isPro} creditsRemaining={creditsRemaining} />;
}
