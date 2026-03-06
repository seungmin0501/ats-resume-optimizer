# ATS Resume Optimizer — 개발 진행사항

> 마지막 업데이트: 2026-03-06

---

## 완료된 작업 (Stages 1–4)

### Stage 1: Core Engine ✅
- `lib/openai.ts` — GPT-4o 분석 (JSON 응답 포맷, 30초 타임아웃, 5000자 트런케이션)
- `lib/pdf.ts` — pdf-parse 래퍼 (5MB 제한)
- `lib/scraper.ts` — cheerio URL 스크래퍼 (SSRF 보호)
- `app/api/analyze/route.ts` — 메인 분석 API (인증 → 크레딧 → PDF → GPT → DB 저장)
- `app/api/scrape/route.ts` — 채용공고 URL 스크래핑
- `app/api/download/route.ts` — DOCX 생성 (Pro 전용)

### Stage 2: UI/UX ✅
- `components/ScoreGauge.tsx` — SVG 원형 점수 게이지
- `components/FeedbackCard.tsx` — 아코디언 섹션 피드백 (Pro 아닌 경우 blur)
- `components/JobInput.tsx` — URL/텍스트 자동 감지 + 스크래핑
- `components/UploadZone.tsx` — PDF 드래그&드롭 업로드
- `components/LocaleSwitcher.tsx` — EN/한/日/ES 언어 전환
- `app/[locale]/analyze/AnalyzeClient.tsx` — 메인 분석 UI (모달 포함)

### Stage 3: 프로덕션 기반 ✅
- i18n: 4개 언어 (en/ko/ja/es), 모든 UI 문자열 번역 완료
- SEO: 페이지별 메타데이터, Landing 페이지 최적화
- 보안 헤더: `next.config.ts` (X-Frame-Options, CSP, Referrer-Policy 등)
- `vercel.json`: 배포 설정 + 함수 타임아웃 (analyze 60s, download 30s)
- `supabase/schema.sql`: 전체 DB 스키마 (RLS 정책, 인덱스, 트리거)
- `supabase/reset-credits.sql`: pg_cron 월별 크레딧 리셋

### Stage 4: 인증 + 결제 ✅
- Google OAuth via Supabase Auth
- `app/api/auth/google/route.ts` — OAuth 시작
- `app/api/auth/callback/route.ts` — 코드 교환 + 사용자 upsert
- `app/api/auth/signout/route.ts` — 로그아웃
- `app/api/webhooks/lemonsqueezy/route.ts` — HMAC 서명 검증 + 구독 상태 업데이트
- 크레딧 시스템: 무료 3회/월, 소진 시 업그레이드 모달

---

## 진행 중 / 남은 작업 (Stage 5)

### 즉시 필요
- [x] `generateStaticParams` — 모든 locale 페이지 + layout에 추가
- [x] Rate limiting — `lib/ratelimit.ts` (Upstash 미설정 시 graceful passthrough)
- [x] Error boundary — `components/ErrorBoundary.tsx`, analyze 페이지에 적용

### 테스트 & 검증
- [x] Playwright E2E 테스트 작성 (`e2e/landing.spec.ts`, `analyze.spec.ts`, `security.spec.ts`)
- [x] Playwright 브라우저 설치 및 테스트 실행 (19/19 all passed)
  - 수정: `e2e/landing.spec.ts` locale switcher 테스트 — `.first()` 추가 (Next.js Dev Tools 버튼 중복 매칭 이슈)
- [ ] **[다음 세션 시작점]** PDF 분석 플로우 실제 테스트 (이력서 PDF 업로드 → 점수 확인 → 히스토리 저장)
- [ ] 크레딧 소진 시 모달 흐름 테스트
- [ ] Pro 업그레이드 후 DOCX 다운로드 테스트

### Supabase 설정 (아직 미실행)
- [ ] **Supabase SQL 에디터에서 실행 필요:**
  1. `supabase/schema.sql` 전체 실행 → users, analyses 테이블 생성
  2. `supabase/reset-credits.sql` 실행 → 월별 크레딧 리셋 cron 등록
  - URL: https://supabase.com/dashboard → 프로젝트 선택 → SQL Editor

### 결제 연동 (LemonSqueezy)
- [x] `lib/lemonsqueezy.ts` — `user_id` custom_data 추가 (웹훅에서 사용자 식별)
- [x] `app/api/checkout/route.ts` — 인증 확인 후 checkout URL redirect
- [x] pricing 페이지 "Get Pro" 버튼 → `/api/checkout` 연결
- [ ] LemonSqueezy 계정에서 제품 생성 후 `.env.local` 채우기:
  ```
  LEMONSQUEEZY_API_KEY=
  LEMONSQUEEZY_WEBHOOK_SECRET=
  LEMONSQUEEZY_STORE_ID=
  LEMONSQUEEZY_PRO_VARIANT_ID=
  ```
- [ ] 웹훅 URL 등록 (배포 후): `https://[도메인]/api/webhooks/lemonsqueezy`

### Rate Limiting (Upstash — 선택적)
- [ ] Upstash 계정 생성 → Redis DB 생성
- [ ] `.env.local` 채우기:
  ```
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=
  ```
  → 설정하면 자동으로 분당 10회 제한 적용 (미설정 시 제한 없음)

### Vercel 배포
- [ ] Vercel 프로젝트 생성 (GitHub 연동 권장)
- [ ] 환경 변수 등록 (`.env.local` 내용 전부)
- [ ] 도메인 연결
- [ ] 배포 후 Google OAuth Redirect URI 업데이트:
  - Supabase Dashboard → Authentication → URL Configuration
  - Site URL: `https://[실제도메인]`
  - Redirect URL 추가: `https://[실제도메인]/api/auth/callback`

---

## 환경 변수 체크리스트

| 변수 | 상태 | 비고 |
|------|------|------|
| `OPENAI_API_KEY` | ✅ 설정됨 | |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ 설정됨 | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ 설정됨 | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ 설정됨 | |
| `LEMONSQUEEZY_API_KEY` | ⬜ 미설정 | 결제 연동 시 필요 |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ⬜ 미설정 | 결제 연동 시 필요 |
| `UPSTASH_REDIS_REST_URL` | ⬜ 미설정 | rate limiting용 |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ 미설정 | rate limiting용 |

---

## 주요 URL 구조

```
/              → /en (기본 로케일, SEO 최적화)
/ko, /ja, /es  → 각 언어 랜딩 페이지
/[locale]/analyze    → 메인 분석 페이지
/[locale]/dashboard  → 분석 히스토리
/[locale]/pricing    → 가격 정책
/[locale]/privacy    → 개인정보 처리방침
/[locale]/terms      → 이용약관
/api/analyze         → POST: 이력서 분석
/api/scrape          → POST: 채용공고 URL 스크래핑
/api/download        → POST: DOCX 생성 (Pro)
/api/auth/google     → Google OAuth 시작
/api/auth/callback   → OAuth 콜백
/api/auth/signout    → 로그아웃
/api/webhooks/lemonsqueezy → LemonSqueezy 웹훅
```
