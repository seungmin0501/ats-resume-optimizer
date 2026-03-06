import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Terms of Service — ATS Resume Optimizer",
};

export default async function TermsPage({
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose text-gray-600 space-y-6 text-sm leading-relaxed">
          <p><strong>Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By using ATS Resume Optimizer, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Use of Service</h2>
            <p>You may use this service for personal, non-commercial job search purposes. You agree not to misuse the service, attempt to circumvent usage limits, or use the service to generate harmful content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Free Plan Limitations</h2>
            <p>Free accounts are limited to 3 resume analyses per calendar month. Limits reset on the 1st of each month.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Pro Subscription</h2>
            <p>Pro subscriptions are billed monthly ($12) or annually ($99). You may cancel at any time. Access continues until the end of the billing period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Accuracy Disclaimer</h2>
            <p>AI-generated analysis is provided for guidance only. We do not guarantee job application outcomes. Always review AI suggestions before applying them to your resume.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Contact</h2>
            <p>For questions, contact us at support@atsresumeoptimizer.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
