import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Terms of Service — ATS Resume Optimizer",
  description: "Terms and conditions for using ATS Resume Optimizer.",
};

const CONTACT_EMAIL = "seungminbuilds@gmail.com";
const LAST_UPDATED = "March 10, 2026";

const HEADINGS: Record<string, string[]> = {
  en: [
    "1. Acceptance of Terms", "2. Eligibility", "3. Description of Service",
    "4. Account Registration", "5. Pricing and Credits", "6. Payments and Refunds",
    "7. AI-Generated Content — Important Disclaimer", "8. Your Content and License", "9. Acceptable Use",
    "10. Intellectual Property", "11. Service Availability", "12. Disclaimer of Warranties",
    "13. Limitation of Liability", "14. Indemnification", "15. Governing Law and Disputes",
    "16. Changes to These Terms", "17. Contact",
  ],
  ko: [
    "1. 약관 동의", "2. 이용 자격", "3. 서비스 설명",
    "4. 계정 등록", "5. 가격 및 크레딧", "6. 결제 및 환불",
    "7. AI 생성 콘텐츠 — 중요 면책 조항", "8. 귀하의 콘텐츠 및 라이선스", "9. 허용 가능한 사용",
    "10. 지식재산권", "11. 서비스 가용성", "12. 보증 부인",
    "13. 책임 제한", "14. 면책", "15. 준거법 및 분쟁",
    "16. 약관 변경", "17. 문의",
  ],
  ja: [
    "1. 利用規約への同意", "2. 利用資格", "3. サービスの説明",
    "4. アカウント登録", "5. 料金とクレジット", "6. 支払いと返金",
    "7. AI生成コンテンツ — 免責事項", "8. お客様のコンテンツとライセンス", "9. 許容される使用",
    "10. 知的財産権", "11. サービスの可用性", "12. 保証の否認",
    "13. 責任の制限", "14. 補償", "15. 準拠法と紛争",
    "16. 規約の変更", "17. お問い合わせ",
  ],
  es: [
    "1. Aceptación de Términos", "2. Elegibilidad", "3. Descripción del Servicio",
    "4. Registro de Cuenta", "5. Precios y Créditos", "6. Pagos y Reembolsos",
    "7. Contenido Generado por IA — Aviso Importante", "8. Su Contenido y Licencia", "9. Uso Aceptable",
    "10. Propiedad Intelectual", "11. Disponibilidad del Servicio", "12. Renuncia de Garantías",
    "13. Limitación de Responsabilidad", "14. Indemnización", "15. Ley Aplicable y Disputas",
    "16. Cambios en Estos Términos", "17. Contacto",
  ],
  "zh-CN": [
    "1. 接受条款", "2. 资格要求", "3. 服务描述",
    "4. 账户注册", "5. 定价与积分", "6. 付款与退款",
    "7. AI生成内容 — 重要免责声明", "8. 您的内容与许可", "9. 可接受的使用",
    "10. 知识产权", "11. 服务可用性", "12. 免责声明",
    "13. 责任限制", "14. 赔偿", "15. 适用法律与争议",
    "16. 条款变更", "17. 联系方式",
  ],
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tLegal = await getTranslations("legal");

  const h = HEADINGS[locale] ?? HEADINGS.en;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600 hover:text-blue-700">
            {tNav("logo")}
          </Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">
                  {tNav("dashboard")}
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
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tLegal("terms_title")}</h1>
        <p className="text-sm text-gray-400 mb-4">{tLegal("last_updated", { date: LAST_UPDATED })}</p>
        {locale !== "en" && (
          <p className="text-xs text-gray-400 bg-gray-100 rounded-lg px-4 py-3 mb-10">
            {tLegal("english_governs")}
          </p>
        )}

        <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[0]}</h2>
            <p>
              By accessing or using ATS Resume Optimizer (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally binding agreement between you and the operator of ATS Resume Optimizer.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[1]}</h2>
            <p>
              You must be at least 18 years old to use the Service. By using the Service, you represent that you meet this requirement and that you have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[2]}</h2>
            <p>
              ATS Resume Optimizer is an AI-powered web application that analyzes your resume against a job posting to provide a match score, missing keywords, section feedback, an optimized resume, cover letter, and interview preparation content. The Service uses OpenAI&apos;s GPT-4o model to generate analysis results.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[3]}</h2>
            <p>
              You must sign in with a Google account to use the Service. You are responsible for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[4]}</h2>
            <p className="mb-3">The Service is available on a one-time credit pack basis. There are no subscriptions or recurring charges.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Plan</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Price</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Credits / Access</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-200">Free</td>
                    <td className="p-2 border border-gray-200">$0</td>
                    <td className="p-2 border border-gray-200">1 analysis</td>
                    <td className="p-2 border border-gray-200">Never</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200">Basic</td>
                    <td className="p-2 border border-gray-200">$5 (one-time)</td>
                    <td className="p-2 border border-gray-200">3 analyses</td>
                    <td className="p-2 border border-gray-200">Never</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-200">Pro</td>
                    <td className="p-2 border border-gray-200">$15 (one-time)</td>
                    <td className="p-2 border border-gray-200">10 analyses</td>
                    <td className="p-2 border border-gray-200">Never</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200">Unlimited</td>
                    <td className="p-2 border border-gray-200">$29 (one-time)</td>
                    <td className="p-2 border border-gray-200">Unlimited analyses</td>
                    <td className="p-2 border border-gray-200">90 days from purchase</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">Credits from multiple purchases accumulate. Basic and Pro credits do not expire. Unused Unlimited access expires 90 days after the date of purchase.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[5]}</h2>
            <p className="mb-2">
              All payments are processed by LemonSqueezy. By completing a purchase, you authorize LemonSqueezy to charge the applicable amount to your payment method.
            </p>
            <p className="mb-2">
              <strong>No Refunds After Use:</strong> Because credits are digital goods delivered and made available immediately upon purchase, all sales are final once any credit has been consumed.
            </p>
            <p>
              <strong>Technical Error Exception:</strong> If a technical failure on our end caused a credit to be deducted without a successful analysis being delivered, or prevented you from accessing a feature you paid for, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a> within 7 days of the incident. We will investigate and, at our discretion, either restore the credit or issue a refund for unused credits.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[6]}</h2>
            <p className="mb-2">
              All analysis results, optimized resumes, cover letters, and interview preparation content are generated by an AI model (OpenAI GPT-4o). By using the Service, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>AI-generated content is provided <strong>for informational and guidance purposes only</strong>. It does not constitute professional career advice, legal advice, or a guarantee of any employment outcome.</li>
              <li>The match score is an AI estimate and may not reflect the scoring logic of any specific employer&apos;s ATS system.</li>
              <li><strong>We do not guarantee that using our Service will result in a job interview, offer, or any employment outcome.</strong></li>
              <li>You are solely responsible for reviewing all AI-generated content before using it in any job application. Do not include information in your resume that is inaccurate or fabricated.</li>
              <li>AI systems can produce errors, inaccuracies, or biased outputs. Always apply your own judgment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[7]}</h2>
            <p className="mb-2">
              You retain all ownership rights to the resume and job posting content you submit. By submitting content, you grant us a limited, non-exclusive license to process that content solely for the purpose of providing the Service to you.
            </p>
            <p>
              You represent that you have the right to submit the content you provide and that doing so does not violate any third-party rights or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[8]}</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Use the Service to generate content that is false, misleading, or fraudulent for job applications.</li>
              <li>Attempt to circumvent credit limits, rate limits, or any access controls.</li>
              <li>Reverse engineer, scrape, or probe the Service&apos;s APIs without authorization.</li>
              <li>Use the Service in any manner that violates applicable laws or regulations.</li>
              <li>Share your account credentials or allow others to use your account.</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these rules, without refund.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[9]}</h2>
            <p>
              The Service, including its design, code, branding, and non-user-generated content, is owned by the operator of ATS Resume Optimizer. You may not copy, modify, distribute, or create derivative works of the Service without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[10]}</h2>
            <p>
              We strive to keep the Service available but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time. We will make reasonable efforts to notify users of significant changes. Unused credits at the time of a permanent service shutdown will be eligible for a refund upon request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[11]}</h2>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT AI-GENERATED RESULTS WILL BE ACCURATE OR SUITABLE FOR YOUR NEEDS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[12]}</h2>
            <p className="mb-2">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR EMPLOYMENT OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $29.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[13]}</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[14]}</h2>
            <p>
              These Terms are governed by the laws of the Republic of Korea, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the Republic of Korea. If you are a consumer in a jurisdiction where this choice of law is not enforceable, your local mandatory consumer protection laws may apply.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[15]}</h2>
            <p>
              We reserve the right to update these Terms at any time. Material changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[16]}</h2>
            <p>
              For any questions about these Terms, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
