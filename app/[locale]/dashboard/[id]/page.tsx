import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import ScoreGauge from "@/components/ScoreGauge";
import KeywordList from "@/components/KeywordList";
import FeedbackCard from "@/components/FeedbackCard";
import CoverLetter from "@/components/CoverLetter";
import InterviewPrep from "@/components/InterviewPrep";
import DownloadButton from "./DownloadButton";
import type { PlanTier } from "@/lib/supabase";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("results");
  const tNav = await getTranslations("nav");
  const tDash = await getTranslations("dashboard");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/analyze`);

  const serviceClient = createServiceClient();
  const [{ data: userRaw }, { data: analysisRaw }] = await Promise.all([
    serviceClient
      .from("users")
      .select("plan_tier")
      .eq("id", user.id)
      .single(),
    serviceClient
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!analysisRaw) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = analysisRaw as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tier = ((userRaw as any)?.plan_tier ?? "free") as PlanTier;
  const isBasicOrAbove = tier === "basic" || tier === "pro" || tier === "unlimited";
  const isProOrAbove = tier === "pro" || tier === "unlimited";

  const createdAt = new Date(analysis.created_at).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">
            {tNav("logo")}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              ← {tDash("title")}
            </Link>
            <Link
              href="/analyze"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              {tDash("new_analysis")}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">{createdAt}</p>
          <h1 className="text-xl font-bold text-gray-900">
            {analysis.company_name || tDash("unknown_company")}
            {analysis.job_title && (
              <span className="text-gray-500 font-normal"> — {analysis.job_title}</span>
            )}
          </h1>
        </div>

        <div className="space-y-4">
          {/* 점수 */}
          <ScoreGauge score={analysis.match_score} grade={analysis.grade} />

          {/* 누락 키워드 */}
          {analysis.missing_keywords?.length > 0 && (
            <KeywordList keywords={analysis.missing_keywords} />
          )}

          {/* 섹션 피드백 */}
          {analysis.section_feedback && (
            <FeedbackCard
              feedback={analysis.section_feedback}
              isBasicOrAbove={isBasicOrAbove}
            />
          )}

          {/* 포맷 경고 */}
          {analysis.format_warnings?.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-sm font-medium text-amber-800 mb-3">
                {t("format_warnings_title")} ({analysis.format_warnings.length})
              </h3>
              <ul className="space-y-1">
                {analysis.format_warnings.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                    ⚠ {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 최적화 이력서 다운로드 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              {t("optimized_resume_title")}
            </h3>
            {isBasicOrAbove && analysis.optimized_resume ? (
              <DownloadButton analysisId={analysis.id} />
            ) : (
              <Link
                href="/pricing"
                className="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg py-3 font-semibold transition-colors"
              >
                🔒 {t("upgrade_to_unlock")}
              </Link>
            )}
          </div>

          {/* 커버레터 */}
          <CoverLetter
            content={analysis.cover_letter ?? null}
            isProOrAbove={isProOrAbove}
            onUpgradeClick={undefined}
          />

          {/* 면접 Q&A */}
          <InterviewPrep
            data={analysis.interview_prep ?? null}
            isProOrAbove={isProOrAbove}
            onUpgradeClick={undefined}
          />
        </div>
      </div>
    </div>
  );
}
