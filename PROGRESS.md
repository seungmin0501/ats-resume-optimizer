# ATS Resume Optimizer — 개발 진행사항

> 마지막 업데이트: 2026-03-06

---

## ✅ 완료된 작업 (Stages 1–5)

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
- `app/api/checkout/route.ts` — 월간/연간 variant 분기 checkout redirect
- 크레딧 시스템: 무료 3회/월, 소진 시 업그레이드 모달

### Stage 5: QA + Launch ✅
- generateStaticParams (모든 locale 페이지)
- Rate limiting (`lib/ratelimit.ts`, Upstash graceful fallback)
- ErrorBoundary (`components/ErrorBoundary.tsx`)
- Playwright E2E 19/19 통과
- Supabase schema.sql + reset-credits.sql 실행 완료
- LemonSqueezy 제품(월간/연간) 생성 + 웹훅 등록 완료
- Vercel 배포 완료: https://ats-resume-optimizer-ten.vercel.app
- Google OAuth redirect URI 업데이트 완료

---

## 환경 변수 체크리스트

| 변수 | 로컬 | Vercel | 비고 |
|------|------|--------|------|
| `OPENAI_API_KEY` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | |
| `LEMONSQUEEZY_API_KEY` | ✅ | ✅ | |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ✅ | ✅ | |
| `LEMONSQUEEZY_STORE_ID` | ✅ | ✅ | |
| `LEMONSQUEEZY_PRO_VARIANT_MONTHLY` | ✅ | ✅ | |
| `LEMONSQUEEZY_PRO_VARIANT_YEARLY` | ✅ | ✅ | |
| `UPSTASH_REDIS_REST_URL` | ⬜ | ⬜ | 선택적 (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ | ⬜ | 선택적 (rate limiting) |

---

## 주요 URL 구조

```
https://ats-resume-optimizer-ten.vercel.app

/              → /en (기본 로케일, SEO 최적화)
/ko, /ja, /es  → 각 언어 랜딩 페이지
/[locale]/analyze    → 메인 분석 페이지
/[locale]/dashboard  → 분석 히스토리
/[locale]/pricing    → 가격 정책 (월간/연간 checkout 버튼)
/[locale]/privacy    → 개인정보 처리방침
/[locale]/terms      → 이용약관
/api/analyze         → POST: 이력서 분석
/api/scrape          → POST: 채용공고 URL 스크래핑
/api/download        → POST: DOCX 생성 (Pro)
/api/checkout        → GET: LemonSqueezy checkout redirect (?plan=monthly|yearly)
/api/auth/google     → Google OAuth 시작
/api/auth/callback   → OAuth 콜백
/api/auth/signout    → 로그아웃
/api/webhooks/lemonsqueezy → LemonSqueezy 웹훅
```

---

## 남은 선택적 작업

- [ ] Upstash Redis 설정 (rate limiting 활성화, 현재 제한 없이 동작 중)
- [ ] 커스텀 도메인 연결 (현재 vercel.app 도메인 사용 중)
- [ ] LemonSqueezy 웹훅 실제 결제 테스트 (test mode로 구독 생성 → DB plan 업데이트 확인)
