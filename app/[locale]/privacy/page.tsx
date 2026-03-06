import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Privacy Policy — ATS Resume Optimizer",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-lg text-blue-600">{tNav("logo")}</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose text-gray-600 space-y-6 text-sm leading-relaxed">
          <p><strong>Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly: your email address (via Google Sign-In), resume content (processed in real-time and not stored permanently), and job posting content you submit for analysis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>We use your information to provide the ATS resume analysis service, maintain your account and usage history, and communicate service-related updates.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Data Storage</h2>
            <p>Your account data is stored securely via Supabase. Analysis results are stored to provide your history dashboard. Resume content is processed via OpenAI's API and is subject to their data policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
            <p>We use Google OAuth for authentication, OpenAI for AI analysis, Supabase for database storage, and LemonSqueezy for payment processing. Each service has their own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Contact</h2>
            <p>For privacy-related questions, please contact us at privacy@atsresumeoptimizer.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
