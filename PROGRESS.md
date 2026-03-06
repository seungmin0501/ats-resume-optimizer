# ATS Resume Optimizer — 개발 진행사항

> 마지막 업데이트: 2026-03-07 (Upstash 활성화)
> 프로젝트 경로: `D:\coding\MP3_ResumeOptimizer`
> GitHub: https://github.com/seungmin0501/ats-resume-optimizer
> 프로덕션: https://ats-resume-optimizer-ten.vercel.app

---

## 프로젝트 개요

- **제품**: AI SaaS — ATS(지원자 추적 시스템) 이력서 최적화
- **스택**: Next.js 16 + TypeScript + Tailwind CSS + Supabase + LemonSqueezy + OpenAI GPT-4o
- **플랜**: Free(3회/월), Pro($12/월 or $99/년, 무제한 + DOCX 다운로드)
- **언어**: 한국어, English, 日本語, Español (next-intl)

---

## 로컬 개발 실행

```bash
cd D:\coding\MP3_ResumeOptimizer
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드 검증
npm run test:e2e   # Playwright E2E (19개 테스트)
```

> GitHub push → Vercel 자동 재배포

---

## 핵심 아키텍처

```
app/
  [locale]/               ← next-intl 라우팅 (en/ko/ja/es)
    page.tsx              ← 랜딩 페이지
    analyze/
      page.tsx            ← 서버 컴포넌트 (유저 데이터 fetch)
      AnalyzeClient.tsx   ← 클라이언트 UI (업로드, 결과, 모달)
    dashboard/page.tsx    ← 분석 히스토리
    pricing/page.tsx      ← 가격 페이지 (월간/연간 버튼)
  api/
    analyze/route.ts      ← PDF → GPT → DB 저장 (인증+크레딧 체크)
    scrape/route.ts       ← 채용공고 URL 스크래핑
    download/route.ts     ← DOCX 생성 (Pro 전용)
    checkout/route.ts     ← LemonSqueezy checkout redirect
    auth/google/          ← Google OAuth 시작
    auth/callback/        ← OAuth 콜백 + users 테이블 upsert
    auth/signout/         ← 로그아웃
    webhooks/lemonsqueezy/← HMAC 검증 + plan 업데이트
lib/
  supabase.ts             ← lazy 클라이언트 + UserRow/AnalysisRow 타입
  supabase-server.ts      ← SSR용 서버 클라이언트
  openai.ts               ← GPT-4o 분석 래퍼
  pdf.ts                  ← pdf-parse 래퍼 (5MB 제한)
  scraper.ts              ← cheerio 스크래퍼 (SSRF 보호)
  lemonsqueezy.ts         ← 웹훅 검증 + getCheckoutUrl()
  ratelimit.ts            ← Upstash rate limiting (미설정 시 passthrough)
proxy.ts                  ← next-intl 미들웨어 (Next.js 16은 middleware.ts 아님)
```

**주요 설계 결정:**
- Next.js 16: `middleware.ts` → `proxy.ts` (next-intl 요구사항)
- Supabase 클라이언트: 빌드타임 env 없음 → lazy 초기화
- `analyses.section_feedback` → jsonb 컬럼 (텍스트 분리 컬럼 아님)
- `users` 컬럼: `ls_customer_id`, `ls_subscription_id` (lemonsqueezy_ 접두사 아님)

---

## Supabase DB 스키마

```sql
-- users 테이블
id uuid (= auth.users.id)
email, plan('free'|'pro'), credits_used, credits_reset(date)
ls_customer_id, ls_subscription_id
created_at, updated_at (트리거 자동 업데이트)

-- analyses 테이블
id uuid, user_id, job_title, company_name
match_score(0-100), grade('A'|'B'|'C'|'D')
missing_keywords text[], section_feedback jsonb, format_warnings text[]
optimized_resume text, created_at
```

---

## 완료된 작업 (Stages 1–5)

### Stage 1: Core Engine ✅
- GPT-4o 분석, PDF 파싱, URL 스크래핑, 분석/스크래핑/다운로드 API

### Stage 2: UI/UX ✅
- ScoreGauge, FeedbackCard(blur), JobInput, UploadZone, LocaleSwitcher, AnalyzeClient

### Stage 3: 프로덕션 기반 ✅
- i18n 4개 언어, SEO 메타데이터, 보안 헤더, vercel.json, Supabase 스키마

### Stage 4: 인증 + 결제 ✅
- Google OAuth, LemonSqueezy 웹훅, checkout API(월간/연간), 크레딧 시스템

### Stage 5: QA + Launch ✅
- Playwright E2E 19/19 통과
- Supabase schema.sql + reset-credits.sql 실행 완료
- LemonSqueezy 제품(월간 $12 / 연간 $99) 생성 + 웹훅 등록 완료
- Vercel 배포 + Google OAuth redirect URI 업데이트 완료

### Stage 6: 결제 플로우 코드 점검 + 버그 수정 ✅
- `lib/lemonsqueezy.ts`: `verifyWebhookSignature` try-catch 추가 (timingSafeEqual 길이 불일치 시 500 → 401 정상 처리)
- `app/[locale]/pricing/page.tsx`: async params + `getTranslations` 마이그레이션 (Next.js 16 호환)
- `app/api/analyze/route.ts`: 첫 스캔 시 `credits_reset` 자동 설정 (null 표시 버그 수정)

---

## 환경 변수 현황

| 변수 | 로컬 `.env.local` | Vercel | 비고 |
|------|:-----------------:|:------:|------|
| `OPENAI_API_KEY` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | |
| `LEMONSQUEEZY_API_KEY` | ✅ | ✅ | |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ✅ | ✅ | |
| `LEMONSQUEEZY_STORE_ID` | ✅ | ✅ | |
| `LEMONSQUEEZY_PRO_VARIANT_MONTHLY` | ✅ | ✅ | |
| `LEMONSQUEEZY_PRO_VARIANT_YEARLY` | ✅ | ✅ | |
| `UPSTASH_REDIS_REST_URL` | ⬜ | ⬜ | 선택적 — 미설정 시 rate limit 없이 동작 |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ | ⬜ | 선택적 |

---

## 남은 작업 (선택적)

### 우선순위 높음
- [ ] **결제 플로우 실제 테스트**
  - LemonSqueezy test mode에서 구독 생성
  - 웹훅 수신 확인 → Supabase `users.plan = 'pro'` 변경되는지 확인
  - Pro 유저로 DOCX 다운로드 동작 확인
  - 구독 취소 → `plan = 'free'` 복귀 확인

### 우선순위 중간
- [x] **Upstash Redis rate limiting 활성화** ✅
  - `.env.local` + Vercel 환경변수 추가 완료
  - `/api/analyze` IP당 분당 10회 제한 적용 중

### 우선순위 낮음
- [ ] **커스텀 도메인 연결** (도메인 구매 후 진행)
  - Vercel Dashboard → 프로젝트 → Settings → Domains → Add Domain
  - DNS: A 레코드 `@` → `76.76.21.21` (루트) 또는 CNAME `www` → `cname.vercel-dns.com`
  - Supabase → Authentication → URL Configuration → Site URL + Redirect URLs 업데이트
  - Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs 업데이트

---

## 주요 URL

```
프로덕션: https://ats-resume-optimizer-ten.vercel.app

/[locale]/analyze    → 메인 분석 페이지
/[locale]/dashboard  → 분석 히스토리
/[locale]/pricing    → 가격 (월간/연간 버튼 → /api/checkout?plan=monthly|yearly)
/api/analyze         → POST: 이력서 분석
/api/checkout        → GET: LemonSqueezy checkout redirect
/api/webhooks/lemonsqueezy → LemonSqueezy 웹훅 수신
```
