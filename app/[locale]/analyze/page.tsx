import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import AnalyzeClient from "./AnalyzeClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Analyze Your Resume — ATS Resume Optimizer",
  description:
    "Upload your resume and paste a job posting to get your ATS match score and optimization tips in seconds.",
};

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;

  if (user) {
    const serviceClient = createServiceClient();
    const { data } = await serviceClient
      .from("users")
      .select("plan, credits_used, credits_reset, email")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;

    if (row) {
      userData = {
        email: row.email as string,
        plan: row.plan as "free" | "pro",
        creditsUsed: row.credits_used as number,
        creditsReset: row.credits_reset as string | null,
        name: (user.user_metadata?.full_name || user.user_metadata?.name || null) as string | null,
        avatarUrl: (user.user_metadata?.avatar_url || null) as string | null,
      };
    }
  }

  return (
    <ErrorBoundary>
      <AnalyzeClient user={userData} />
    </ErrorBoundary>
  );
}
