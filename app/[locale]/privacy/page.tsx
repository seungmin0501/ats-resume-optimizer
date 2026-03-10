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
  title: "Privacy Policy — ATS Resume Optimizer",
  description: "How ATS Resume Optimizer collects, uses, and protects your personal data.",
};

const CONTACT_EMAIL = "seungminbuilds@gmail.com";
const LAST_UPDATED = "March 10, 2026";

const HEADINGS: Record<string, string[]> = {
  en: [
    "1. Who We Are", "2. Data We Collect", "3. How We Use Your Data",
    "4. AI Processing — OpenAI", "5. Third-Party Service Providers", "6. Data Retention",
    "7. Your Rights", "8. Cookies & Tracking", "9. Security",
    "10. Children's Privacy", "11. Changes to This Policy", "12. Contact Us",
  ],
  ko: [
    "1. 운영자 정보", "2. 수집하는 개인정보", "3. 개인정보 이용 목적",
    "4. AI 처리 — OpenAI", "5. 제3자 서비스 제공자", "6. 개인정보 보유 기간",
    "7. 이용자의 권리", "8. 쿠키 및 추적", "9. 보안",
    "10. 아동 개인정보", "11. 방침 변경", "12. 문의",
  ],
  ja: [
    "1. 運営者について", "2. 収集する個人情報", "3. 個人情報の利用目的",
    "4. AI処理 — OpenAI", "5. 第三者サービスプロバイダー", "6. 個人情報の保存期間",
    "7. お客様の権利", "8. Cookieとトラッキング", "9. セキュリティ",
    "10. 子どものプライバシー", "11. ポリシーの変更", "12. お問い合わせ",
  ],
  es: [
    "1. Quiénes Somos", "2. Datos que Recopilamos", "3. Cómo Usamos sus Datos",
    "4. Procesamiento de IA — OpenAI", "5. Proveedores de Servicios de Terceros", "6. Retención de Datos",
    "7. Sus Derechos", "8. Cookies y Seguimiento", "9. Seguridad",
    "10. Privacidad de Menores", "11. Cambios en Esta Política", "12. Contáctenos",
  ],
  "zh-CN": [
    "1. 关于我们", "2. 我们收集的数据", "3. 数据使用方式",
    "4. AI处理 — OpenAI", "5. 第三方服务提供商", "6. 数据保留",
    "7. 您的权利", "8. Cookie与跟踪", "9. 安全",
    "10. 儿童隐私", "11. 政策变更", "12. 联系我们",
  ],
};

export default async function PrivacyPage({
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tLegal("privacy_title")}</h1>
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
              ATS Resume Optimizer (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an AI-powered web application that analyzes resumes against job postings to help job seekers improve their chances with Applicant Tracking Systems. We are operated by an individual developer. For any privacy-related questions, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[1]}</h2>
            <p className="mb-3">We collect only what is necessary to provide the service:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Account data:</strong> Your email address, display name, and profile photo URL — received from Google when you sign in with Google OAuth.</li>
              <li><strong>Resume content:</strong> The text extracted from the PDF resume you upload. This is processed in real time and sent to OpenAI for analysis. The AI-generated optimized resume, cover letter, and interview preparation content derived from your resume are stored in our database.</li>
              <li><strong>Job posting content:</strong> The job description text or URL you submit. Raw job posting text is not stored; only the analysis results derived from it are stored.</li>
              <li><strong>Payment metadata:</strong> We receive a LemonSqueezy customer ID and order ID after a successful purchase. We do not store your credit card number, billing address, or other payment details — these are handled entirely by LemonSqueezy.</li>
              <li><strong>Usage data:</strong> Your current plan tier, credits remaining, and analysis history are stored to operate the service.</li>
              <li><strong>IP addresses:</strong> Temporarily processed by our rate-limiting system (Upstash Redis) to prevent abuse. IP addresses are not stored persistently.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[2]}</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>To provide, operate, and improve the resume analysis service.</li>
              <li>To authenticate your account and maintain your session.</li>
              <li>To track your credit balance and analysis history.</li>
              <li>To process payments and fulfill purchases through LemonSqueezy.</li>
              <li>To prevent abuse and enforce our usage limits.</li>
            </ul>
            <p className="mt-3">We do not use your resume or personal data for advertising, profiling, or any purpose unrelated to operating the service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[3]}</h2>
            <p className="mb-2">
              Your resume text and the job posting text are sent to <strong>OpenAI&apos;s API</strong> to generate the analysis, optimized resume, cover letter, and interview preparation content.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>OpenAI does <strong>not</strong> use API inputs to train or improve their models (per their <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">API Data Usage Policy</a>).</li>
              <li>OpenAI retains API inputs and outputs for up to 30 days for abuse and safety monitoring, after which they are deleted.</li>
              <li>Your resume may contain personally identifiable information (name, contact details, work history). By using this service, you consent to this data being transmitted to OpenAI under the conditions described above.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[4]}</h2>
            <p className="mb-3">We share data with the following sub-processors solely to operate the service:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Provider</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-200">Supabase (AWS us-east-1)</td>
                    <td className="p-2 border border-gray-200">Database &amp; authentication</td>
                    <td className="p-2 border border-gray-200">Email, name, analysis results</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200">OpenAI</td>
                    <td className="p-2 border border-gray-200">AI analysis</td>
                    <td className="p-2 border border-gray-200">Resume text, job posting text</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-200">LemonSqueezy</td>
                    <td className="p-2 border border-gray-200">Payment processing</td>
                    <td className="p-2 border border-gray-200">Email, purchase amount</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200">Google (OAuth)</td>
                    <td className="p-2 border border-gray-200">Sign-in authentication</td>
                    <td className="p-2 border border-gray-200">Profile info you authorize</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-200">Upstash Redis</td>
                    <td className="p-2 border border-gray-200">Rate limiting</td>
                    <td className="p-2 border border-gray-200">IP address (transient)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200">Vercel</td>
                    <td className="p-2 border border-gray-200">Hosting &amp; deployment</td>
                    <td className="p-2 border border-gray-200">Server logs (IP, request metadata)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">We do not sell, rent, or disclose your personal data to any other third party.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[5]}</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Account data</strong> is retained for as long as your account is active. When you delete your account, all account data and analysis results are permanently deleted from our systems.</li>
              <li><strong>Analysis results</strong> (optimized resume, cover letter, interview prep) are stored indefinitely to power your history dashboard, unless you delete your account or request deletion.</li>
              <li><strong>Payment identifiers:</strong> We store only a LemonSqueezy customer ID and order ID. These are deleted when you delete your account. Actual payment transaction records (card details, invoices) are retained by LemonSqueezy as the payment processor and merchant of record, under their own data retention obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[6]}</h2>
            <p className="mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Ask us to correct inaccurate data.</li>
              <li><strong>Erasure (&ldquo;right to be forgotten&rdquo;):</strong> Delete your account via the Dashboard to permanently remove all your account data and analysis history. Actual payment transaction records held by LemonSqueezy are subject to their own retention policies.</li>
              <li><strong>Portability:</strong> Receive your analysis data in a machine-readable format.</li>
              <li><strong>Objection / Restriction:</strong> Object to or request restriction of certain processing activities.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>. We will respond within 30 days.
            </p>
            <p className="mt-2 text-gray-500">
              <strong>EU/EEA users (GDPR):</strong> You have the right to lodge a complaint with your local supervisory authority if you believe your data is not being handled lawfully.
            </p>
            <p className="mt-2 text-gray-500">
              <strong>California users (CCPA):</strong> We do not sell personal information. You have the right to know what data we collect and to request its deletion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[7]}</h2>
            <p>
              We use only a short-lived session cookie for authentication (managed by Supabase Auth) and a temporary redirect cookie used during the Google sign-in flow. We do not use advertising cookies, cross-site tracking, or analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[8]}</h2>
            <p>
              We implement reasonable technical measures to protect your data, including encrypted connections (HTTPS/TLS), Row Level Security (RLS) policies in Supabase so each user can only access their own data, and environment-variable management of all secret keys. No system is 100% secure. In the event of a personal data breach, we will assess the risk and notify affected users and relevant supervisory authorities as required by applicable law (including within 72 hours where required by GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[9]}</h2>
            <p>
              This service is not directed to children under 16. We do not knowingly collect personal data from anyone under 16. If you believe a child has provided us personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[10]}</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the service after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">{h[11]}</h2>
            <p>
              For any privacy questions, data access requests, or deletion requests, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

          {/* 한국어 사용자 전용: 개인정보보호법(PIPA) 고지 */}
          {locale === "ko" && (
            <section className="mt-10 pt-10 border-t-2 border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">개인정보처리방침 (한국 개인정보보호법)</h2>
              <p className="text-xs text-gray-400 mb-6">본 섹션은 대한민국 개인정보보호법(PIPA)에 따라 한국 이용자를 위해 작성되었습니다.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. 개인정보처리자 명칭 및 연락처</h3>
                  <p>개인정보처리자: ATS Resume Optimizer 운영자</p>
                  <p>이메일: <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a></p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. 개인정보의 처리 목적</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>회원 식별 및 서비스 이용 관리 (이메일, 이름)</li>
                    <li>AI 이력서 분석 서비스 제공 (이력서 텍스트, 채용공고 텍스트)</li>
                    <li>분석 히스토리 제공 (분석 결과 저장)</li>
                    <li>결제 처리 및 크레딧 관리</li>
                    <li>서비스 남용 방지 (IP 주소, 일시적 처리)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. 수집하는 개인정보의 항목</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>필수:</strong> 이메일 주소, 이름, 프로필 사진 URL (Google 로그인 시 제공)</li>
                    <li><strong>서비스 이용 중 생성:</strong> AI 최적화 이력서, 커버레터, 면접 준비 자료</li>
                    <li><strong>결제 시:</strong> LemonSqueezy 고객 ID, 주문 ID (카드 정보는 LemonSqueezy가 처리)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">4. 개인정보의 보유 및 이용 기간</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>계정 데이터 및 분석 기록: 회원 탈퇴 시 즉시 삭제</li>
                    <li>결제 식별자(고객 ID, 주문 ID): 회원 탈퇴 시 당사 시스템에서 삭제. 실제 결제 기록(카드 정보, 영수증 등)은 결제 처리업체인 LemonSqueezy가 자체 법적 의무에 따라 보관합니다.</li>
                    <li>기타 법령이 특정 기간 보존을 요구하는 경우 해당 법령에 따릅니다.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">5. 개인정보의 제3자 제공</h3>
                  <p className="mb-2">서비스 운영을 위해 아래 업체에 개인정보를 제공합니다:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-2 border border-gray-200">제공받는 자</th>
                          <th className="text-left p-2 border border-gray-200">제공 목적</th>
                          <th className="text-left p-2 border border-gray-200">제공 항목</th>
                          <th className="text-left p-2 border border-gray-200">보유 기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border border-gray-200">OpenAI (미국)</td>
                          <td className="p-2 border border-gray-200">AI 분석 처리</td>
                          <td className="p-2 border border-gray-200">이력서 텍스트, 채용공고 텍스트</td>
                          <td className="p-2 border border-gray-200">30일 후 삭제</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2 border border-gray-200">Supabase (미국)</td>
                          <td className="p-2 border border-gray-200">데이터베이스 및 인증</td>
                          <td className="p-2 border border-gray-200">이메일, 이름, 분석 결과</td>
                          <td className="p-2 border border-gray-200">회원 탈퇴 시까지</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-gray-200">LemonSqueezy (미국)</td>
                          <td className="p-2 border border-gray-200">결제 처리</td>
                          <td className="p-2 border border-gray-200">이메일, 결제 금액</td>
                          <td className="p-2 border border-gray-200">7년</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-gray-500">위 업체들은 국외(미국)에 위치합니다. 해당 국외 이전은 이용자와의 서비스 제공 계약 이행에 필수적으로 필요하며, 이용자는 본 개인정보처리방침에 동의함으로써 위 국외 이전에 명시적으로 동의하게 됩니다(개인정보보호법 제28조의8).</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">6. 정보주체의 권리 및 행사 방법</h3>
                  <p className="mb-2">이용자는 아래 권리를 행사할 수 있습니다:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>개인정보 열람 요청</li>
                    <li>개인정보 정정·삭제 요청</li>
                    <li>개인정보 처리 정지 요청</li>
                    <li>개인정보 이동 요청</li>
                  </ul>
                  <p className="mt-2">권리 행사는 <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>로 이메일 요청 또는 대시보드 내 &ldquo;계정 삭제&rdquo; 기능을 이용하시기 바랍니다. 요청 접수 후 10일 이내에 처리합니다.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">7. 개인정보 보호 책임자</h3>
                  <p>성명: ATS Resume Optimizer 운영자</p>
                  <p>이메일: <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a></p>
                  <p className="mt-2 text-gray-500">개인정보 관련 불만·피해 신고는 아래 기관에도 하실 수 있습니다:<br />
                    개인정보보호위원회 (www.pipc.go.kr) / 개인정보침해신고센터 (privacy.kisa.or.kr, 국번없이 118)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">8. 쿠키 사용</h3>
                  <p>본 서비스는 로그인 세션 유지를 위한 필수 쿠키만을 사용합니다. 광고, 행동 추적 쿠키는 사용하지 않습니다.</p>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
