"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import JobInput from "@/components/JobInput";
import UploadZone from "@/components/UploadZone";
import ScoreGauge from "@/components/ScoreGauge";
import KeywordList from "@/components/KeywordList";
import FeedbackCard from "@/components/FeedbackCard";
import CoverLetter from "@/components/CoverLetter";
import InterviewPrep from "@/components/InterviewPrep";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import type { AnalysisResult } from "@/lib/openai";

type PlanTier = "free" | "basic" | "pro" | "unlimited";

type UserData = {
  email: string;
  planTier: PlanTier;
  creditsRemaining: number;
  unlimitedExpiresAt: string | null;
  name: string | null;
  avatarUrl: string | null;
} | null;

type AnalysisResponse = AnalysisResult & { analysis_id?: string };

type UpgradeTarget = "basic" | "pro" | null;

type Props = { user: UserData };

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-4/5" />
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  unlimited: "Unlimited",
};

const PLAN_COLORS: Record<PlanTier, string> = {
  free: "text-gray-500 bg-gray-100",
  basic: "text-green-700 bg-green-50",
  pro: "text-blue-700 bg-blue-50",
  unlimited: "text-purple-700 bg-purple-50",
};

export default function AnalyzeClient({ user }: Props) {
  const t = useTranslations("analyze");
  const tResults = useTranslations("results");
  const tErrors = useTranslations("errors");
  const tCredits = useTranslations("credits");
  const tNav = useTranslations("nav");
  const tDash = useTranslations("dashboard");

  const [jobText, setJobText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<UpgradeTarget>(null);

  const canAnalyze = jobText.trim().length > 0 && resumeFile !== null;

  const planTier = user?.planTier ?? "free";
  const isBasicOrAbove = planTier === "basic" || planTier === "pro" || planTier === "unlimited";
  const isProOrAbove = planTier === "pro" || planTier === "unlimited";

  const isUnlimitedActive =
    planTier === "unlimited" &&
    user?.unlimitedExpiresAt != null &&
    new Date(user.unlimitedExpiresAt) > new Date();

  const hasCredits =
    isUnlimitedActive ||
    (planTier !== "unlimited" && (user?.creditsRemaining ?? 0) > 0);

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    if (!user) { setShowLoginModal(true); return; }
    if (!hasCredits) { setShowCreditModal(true); return; }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobText);
      formData.append("resume", resumeFile!);
      if (isUnlimitedActive) formData.append("target_language", targetLanguage);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) { setShowCreditModal(true); return; }
        if (res.status === 401) { setShowLoginModal(true); return; }
        throw new Error(data.error || "UNKNOWN");
      }
      setResult(data);
    } catch (err) {
      setError(tErrors("generic"));
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [canAnalyze, user, hasCredits, jobText, resumeFile, tErrors]);

  const handleDownload = useCallback(async () => {
    if (!result?.analysis_id) return;
    if (!isBasicOrAbove) { setUpgradeTarget("basic"); return; }

    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis_id: result.analysis_id }),
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.docx";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, isBasicOrAbove]);

  const creditsDisplay = isUnlimitedActive
    ? null
    : (user?.creditsRemaining ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">{tNav("logo")}</Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {user ? (
              <>
                {creditsDisplay !== null && (
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {tNav("credits_remaining", { count: creditsDisplay })}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block ${PLAN_COLORS[planTier]}`}>
                  {PLAN_LABELS[planTier]}
                </span>
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900 hidden sm:block">
                  {tNav("dashboard")}
                </Link>
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.name && (
                    <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                  )}
                  <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                      {tNav("logout")}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <a
                href="/api/auth/google"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                {tNav("login")}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 패널 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("job_input_label")}</label>
              <JobInput onTextReady={setJobText} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("resume_input_label")}</label>
              <UploadZone onFileLoaded={setResumeFile} fileName={resumeFile?.name} />
            </div>
            {isUnlimitedActive && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Language
                  <span className="ml-2 text-xs font-normal text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Unlimited</span>
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                  <option value="zh-CN">中文</option>
                </select>
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || analyzing}
              className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${
                canAnalyze && !analyzing
                  ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("analyzing")}
                </span>
              ) : t("analyze_button")}
            </button>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </div>

          {/* 결과 패널 */}
          <div>
            {analyzing ? (
              <div className="space-y-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="fade-in-up fade-in-up-delay-1">
                  <ScoreGauge score={result.match_score} grade={result.grade} />
                </div>
                {result.missing_keywords?.length > 0 && (
                  <div className="fade-in-up fade-in-up-delay-2">
                    <KeywordList keywords={result.missing_keywords} />
                  </div>
                )}
                {result.section_feedback && (
                  <div className="fade-in-up fade-in-up-delay-3">
                    <FeedbackCard
                      feedback={result.section_feedback}
                      isBasicOrAbove={isBasicOrAbove}
                    />
                    {!isBasicOrAbove && (
                      <button
                        onClick={() => setUpgradeTarget("basic")}
                        className="mt-2 w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700"
                      >
                        {tResults("blur_cta_basic")} →
                      </button>
                    )}
                  </div>
                )}
                {result.format_warnings?.length > 0 && (
                  <div className="fade-in-up fade-in-up-delay-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <h3 className="text-sm font-medium text-amber-800 mb-3">
                      {tResults("format_warnings_title")} ({result.format_warnings.length})
                    </h3>
                    <ul className="space-y-1">
                      {result.format_warnings.map((w, i) => (
                        <li key={i} className="text-sm text-amber-700 flex items-center gap-2">⚠ {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="fade-in-up fade-in-up-delay-5 rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{tResults("optimized_resume_title")}</h3>
                  {isBasicOrAbove && result.optimized_resume ? (
                    <button
                      onClick={handleDownload}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {tResults("download_docx")}
                    </button>
                  ) : (
                    <button
                      onClick={() => setUpgradeTarget("basic")}
                      className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg py-3 font-semibold transition-colors"
                    >
                      🔒 {tResults("upgrade_to_unlock")}
                    </button>
                  )}
                </div>
                <div className="fade-in-up">
                  <CoverLetter
                    content={result.cover_letter ?? null}
                    isProOrAbove={isProOrAbove}
                    onUpgradeClick={() => setUpgradeTarget("pro")}
                  />
                </div>
                <div className="fade-in-up">
                  <InterviewPrep
                    data={result.interview_prep ?? null}
                    isProOrAbove={isProOrAbove}
                    onUpgradeClick={() => setUpgradeTarget("pro")}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">{t("empty_state")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal onClose={() => setShowLoginModal(false)}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("login_required_title")}</h2>
            <p className="text-gray-500 text-sm mb-6">{t("login_required_desc")}</p>
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("login_with_google")}
            </a>
          </div>
        </Modal>
      )}

      {/* No Credits Modal */}
      {showCreditModal && (
        <Modal onClose={() => setShowCreditModal(false)}>
          <div className="text-center">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{tCredits("no_credits_title")}</h2>
            <p className="text-gray-500 text-sm mb-6">{tCredits("no_credits_desc")}</p>
            <div className="space-y-3">
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold"
                onClick={() => setShowCreditModal(false)}
              >
                <span>Basic</span><span>$5 · 3 scans</span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-3 font-semibold"
                onClick={() => setShowCreditModal(false)}
              >
                <span>Pro</span><span>$15 · 10 scans</span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-3 font-semibold"
                onClick={() => setShowCreditModal(false)}
              >
                <span>Unlimited</span><span>$29 · 90 days</span>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Upgrade Modal (feature-specific) */}
      {upgradeTarget && (
        <Modal onClose={() => setUpgradeTarget(null)}>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {upgradeTarget === "basic"
                ? tResults("upgrade_modal_basic_title")
                : tResults("upgrade_modal_pro_title")}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {upgradeTarget === "basic"
                ? tResults("upgrade_modal_basic_desc")
                : tResults("upgrade_modal_pro_desc")}
            </p>
            <a
              href={`/api/checkout?plan=${upgradeTarget}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-center"
            >
              {upgradeTarget === "basic"
                ? tResults("upgrade_to_pro_cta")
                : tResults("upgrade_to_pro_cta_pro")}
            </a>
            <button
              onClick={() => setUpgradeTarget(null)}
              className="mt-3 block w-full text-gray-400 text-sm hover:text-gray-600"
            >
              {tDash("new_analysis")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
