# ATS Resume Optimizer — 개발 진행사항

> 마지막 업데이트: 2026-03-10 (법적 문서 정비 + UX 개선 + 다국어 완성)
> 프로젝트 경로: `D:\coding\MP3_ResumeOptimizer`
> GitHub: https://github.com/seungmin0501/ats-resume-optimizer
> 프로덕션: https://ats-resume-optimizer-ten.vercel.app

---

## 프로젝트 개요

- **제품**: AI SaaS — ATS(지원자 추적 시스템) 이력서 최적화
- **스택**: Next.js 16 + TypeScript + Tailwind CSS + Supabase + LemonSqueezy + OpenAI GPT-4o
- **결제 모델**: 일회성 크레딧 팩 (Free 1회 / Basic $5 3회 / Pro $15 10회 / Unlimited $29 90일)
- **언어**: 한국어, English, 日本語, Español, 中文 (next-intl, 5개 언어)

---

## 로컬 개발 실행

```bash
cd D:\coding\MP3_ResumeOptimizer
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드 검증
```

> GitHub push → Vercel 자동 재배포

---

## 핵심 아키텍처

```
app/
  [locale]/               ← next-intl 라우팅 (en/ko/ja/es/zh-CN)
    page.tsx              ← 랜딩 페이지 (비교 테이블 + 단일 CTA)
    analyze/
      page.tsx            ← 서버 컴포넌트 (유저 데이터 fetch)
      AnalyzeClient.tsx   ← 클라이언트 UI (업로드, 결과, 모달, 로딩 메시지)
    dashboard/
      page.tsx            ← 분석 히스토리 (페이지네이션 20개씩)
      [id]/page.tsx       ← 분석 상세 보기
      [id]/DownloadButton.tsx ← DOCX 다운로드 클라이언트 컴포넌트
    pricing/page.tsx      ← 4-tier 가격 페이지
  api/
    analyze/route.ts      ← PDF → GPT → DB 저장 (maxDuration=60, 크레딧 복구)
    scrape/route.ts       ← 채용공고 URL 스크래핑
    download/route.ts     ← DOCX 생성 (Basic+, 언어별 템플릿)
    checkout/route.ts     ← LemonSqueezy checkout redirect (successUrl 포함)
    auth/google/          ← Google OAuth 시작 (next 쿼리 파라미터 지원)
    auth/callback/        ← OAuth 콜백 (auth_next 쿠키로 원래 페이지 복귀)
    auth/signout/         ← 로그아웃
    webhooks/lemonsqueezy/← order_created 처리 (크레딧 누적, 다운그레이드 버그 수정)
lib/
  supabase.ts             ← lazy 클라이언트 + PlanTier/UserRow/AnalysisRow 타입
  supabase-server.ts      ← SSR용 서버 클라이언트
  openai.ts               ← GPT-4o 분석 래퍼 (언어 자동 감지)
  pdf.ts                  ← pdf-parse 래퍼 (5MB 제한)
  scraper.ts              ← cheerio 스크래퍼 (SSRF 보호)
  lemonsqueezy.ts         ← 웹훅 검증 + getCheckoutUrl() (successUrl 포함)
  credits.ts              ← deductCredit() 유틸리티
  ratelimit.ts            ← Upstash rate limiting (미설정 시 passthrough)
components/
  ScoreGauge.tsx          ← 원형 게이지 (등급 안에, 점수/100 오른쪽)
  FeedbackCard.tsx        ← 섹션 피드백 아코디언
  CoverLetter.tsx         ← 커버레터 (Pro+, onUpgradeClick 선택적)
  InterviewPrep.tsx       ← 면접 Q&A (Pro+, onUpgradeClick 선택적)
  JobInput.tsx / UploadZone.tsx / LocaleSwitcher.tsx / KeywordList.tsx
proxy.ts                  ← next-intl 미들웨어 (Next.js 16은 middleware.ts 아님)
messages/
  en.json / ko.json / ja.json / es.json / zh-CN.json
```

---

## DB 스키마 (Supabase v2)

```sql
-- users 테이블
id uuid (= auth.users.id)
email, plan_tier('free'|'basic'|'pro'|'unlimited')
credits_remaining (default 1), unlimited_expires_at
ls_customer_id, ls_order_id
created_at, updated_at

-- analyses 테이블
id uuid, user_id, job_title, company_name
match_score(0-100), grade('A'|'B'|'C'|'D')
missing_keywords text[], section_feedback jsonb, format_warnings text[]
optimized_resume text, cover_letter text, interview_prep jsonb
target_language (default 'en'), created_at
```

---

## 완료된 작업

### Stages 1–5: 핵심 기능 ✅
- GPT-4o 분석, PDF 파싱, URL 스크래핑, i18n 4개 언어
- ScoreGauge, FeedbackCard(blur), JobInput, UploadZone, LocaleSwitcher
- Google OAuth, LemonSqueezy 웹훅, 크레딧 시스템
- Supabase 스키마, Vercel 배포

### Stage 6: 결제 플로우 버그 수정 ✅
- LemonSqueezy 웹훅 서명 검증 안정화
- pricing/page.tsx Next.js 16 호환성 수정

### Stage 7: 일회성 결제 모델 전환 ✅
- 구독 → 일회성 크레딧 팩 (Free/Basic $5/Pro $15/Unlimited $29)
- 커버레터 + 면접 Q&A (Pro+ 기능)
- zh-CN 5번째 언어 추가
- 4-tier pricing 페이지
- Supabase schema.sql v2 재설정
- LemonSqueezy Test Mode 상품 생성 + 웹훅 등록

### Stage 8: LemonSqueezy 결제 테스트 + UX 개선 ✅

#### 결제 플로우
- ✅ LemonSqueezy Test Mode 결제 동작 확인
- ✅ 결제 후 `/analyze` 페이지로 자동 리다이렉트 (successUrl 추가)
- ✅ Unlimited → Pro 다운그레이드 시 크레딧 누적 버그 수정 (999+10=1009 → 리셋으로 변경)

#### 인증 개선
- ✅ 로그인 후 원래 페이지로 복귀 (`auth_next` httpOnly 쿠키, 5분 만료)
- ✅ 랜딩 페이지 로그인 버튼: `/api/auth/google?next=/`

#### 랜딩 페이지
- ✅ 구 pricing 섹션(Free + Pro $12/month) → 비교 테이블 + "View All Plans" 단일 CTA
- ✅ `pricing_cta` 번역 키 5개 언어 추가

#### DOCX 다운로드
- ✅ 컬럼명 버그 수정: `"plan"` → `"plan_tier"`
- ✅ 플랜 체크 버그 수정: `plan === "pro"` → Basic+ 모두 허용
- ✅ 언어별 DOCX 템플릿 구현:
  - `detectLanguage()`: Unicode 문자 빈도로 ko/ja/zh/es/en 감지
  - 언어별 폰트: Malgun Gothic(ko), Yu Gothic(ja), Microsoft YaHei(zh), Calibri(en/es)
  - 이름 줄: 크고 중앙 정렬, 연락처: 작고 회색, 섹션 헤딩: 굵고 밑줄, 불릿: 들여쓰기

#### 분석 결과 UI
- ✅ ScoreGauge: 원 안에 등급(A/B/C/D), 오른쪽에 점수/100 표시로 변경

#### 분석 히스토리
- ✅ 대시보드: 분석별 "View →" 링크 추가
- ✅ 페이지네이션: PAGE_SIZE=20, URL 기반 (Prev/Next)
- ✅ `/dashboard/[id]` 상세 페이지: 점수, 키워드, 피드백, DOCX, 커버레터, 면접 Q&A

#### 언어 처리
- ✅ 언어 선택 UI 제거 (Unlimited 전용이었던 기능 삭제)
- ✅ GPT 언어 자동 감지: 채용공고 언어로 모든 출력 작성

#### API 안정성
- ✅ `maxDuration = 60` (Vercel Hobby: 최대 60초)
- ✅ FormData/PDF 검증 → 크레딧 차감 순서 수정 (유효한 입력에만 차감)
- ✅ GPT/DB 실패 시 크레딧 자동 복구 (race-condition 안전: DB에서 fresh 값 읽어 +1)

#### UX: 로딩 메시지
- ✅ 분석 중 6개 메시지를 5초씩 순환 표시 (~30초 대기 UX)
- ✅ 5개 언어 번역 완료 (en/ko/ja/es/zh-CN)

### Stage 9: 법적 문서 정비 + UX 개선 + 다국어 완성 ✅

#### 법적 문서
- ✅ Privacy Policy 전면 재작성 (GDPR/CCPA/PIPA 준수, 실제 코드와 일치)
- ✅ Terms of Service 전면 재작성 (일회성 결제 모델, AI 면책 조항, 환불 정책)
- ✅ 연락처 이메일 seungminbuilds@gmail.com 으로 통일
- ✅ 한국어 PIPA 전용 섹션 추가 (locale === "ko" 조건부 렌더링)
- ✅ 비영어 로케일에 "English version governs" 안내 문구 추가
- ✅ 저작권 문구: `© 2026 ATS Resume Optimizer, operated by NOH SEUNGMIN` (5개 언어 통일)

#### 계정 삭제
- ✅ `DELETE /api/account/delete` — analyses → users → Supabase Auth 순차 삭제
- ✅ `DeleteAccountButton.tsx` — 확인 모달 (복구 불가 경고 포함)
- ✅ 대시보드 하단 "Danger Zone" 섹션에 배치

#### 쿠키 안내 배너
- ✅ `CookieNotice.tsx` 신규 구현 (localStorage 기반 dismiss, fixed bottom bar)
- ✅ 5개 언어 번역 완성 (en/ko/ja/es/zh-CN messages에 `"cookie"` 섹션 추가)
- ✅ `NextIntlClientProvider` 내부로 이동 (context 오류 수정)

#### Privacy/Terms 페이지 네비게이션
- ✅ 랜딩 페이지와 동일한 상단 네비게이션 적용 (LocaleSwitcher + 로그인/대시보드 버튼)
- ✅ 페이지 제목 (`Privacy Policy` / `Terms of Service`) 5개 언어 번역
- ✅ `legal` 번역 네임스페이스 추가 (privacy_title, terms_title, last_updated, english_governs)

#### 랜딩 페이지 UX
- ✅ 가격 섹션: HTML 테이블 → 4-tier 카드 (체크 아이콘 정렬, 가격 직접 표시)
- ✅ 구매 버튼 → `/api/checkout?plan=xxx` 직접 연결 (중간 pricing 페이지 거치지 않음)
- ✅ 비인증 사용자 결제 클릭 시 → Google 로그인 후 checkout으로 복귀
- ✅ FAQ 5개 (랜딩 푸터로 이동, pricing 페이지에서 제거)
- ✅ "Trusted by 10,000+" 허위 문구 제거
- ✅ hero subtitle `lg:whitespace-nowrap` — 데스크톱에서 한 줄 표시

---

## 환경 변수 현황

| 변수 | 로컬 `.env.local` | Vercel | 비고 |
|------|:-----------------:|:------:|------|
| `OPENAI_API_KEY` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | |
| `LEMONSQUEEZY_API_KEY` | ✅ | ✅ | Test Mode |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ✅ | ✅ | Test Mode |
| `LEMONSQUEEZY_STORE_ID` | ✅ | ✅ | |
| `LEMONSQUEEZY_BASIC_VARIANT_ID` | ✅ | ✅ | Test Mode 상품 |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | ✅ | ✅ | Test Mode 상품 |
| `LEMONSQUEEZY_UNLIMITED_VARIANT_ID` | ✅ | ✅ | Test Mode 상품 |
| `UPSTASH_REDIS_REST_URL` | ✅ | ✅ | IP당 분당 10회 |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | ✅ | |

---

## 남은 작업

### ✅ 완료
- ✅ LemonSqueezy Test Mode 결제 테스트 (Basic/Pro/Unlimited)
- ✅ LemonSqueezy Live Mode 전환 + 환경변수 교체

### 🚀 다음 할 일 (런칭 준비)

#### 1. 데모 영상 제작 + 랜딩 삽입
- [ ] 화면 녹화: PDF 업로드 → 채용공고 붙여넣기 → 분석 클릭 → 결과 (30~60초)
  - 추천 도구: OBS (녹화) → CapCut (편집) → Handbrake (압축, 목표 5MB 이하)
- [ ] Cloudflare R2 또는 `/public` 폴더에 mp4 업로드
- [ ] 랜딩 페이지 히어로 섹션 아래 `<video>` 태그로 삽입
- 전환율에 직접적인 영향. 가장 우선순위 높음.

#### 2. Sitemap + robots.txt (SEO 필수)
- [ ] `app/sitemap.ts` — 다국어 URL 5개 × 4페이지 자동 생성
- [ ] `app/robots.ts` — 크롤러 허용 + sitemap URL 명시
- Google이 사이트를 색인하려면 필수. 현재 없음.

#### 3. OG 이미지 제작
- [ ] `public/og-image.png` (1200×630) 제작
- 현재 OG 메타태그는 있지만 실제 이미지 파일이 없음 → SNS 공유 시 빈 미리보기

#### 4. Vercel Analytics 연동
- [ ] `@vercel/analytics` 패키지 추가 + `layout.tsx`에 `<Analytics />` 삽입
- 코드 1줄, 무료. 방문자/전환율 추적 없이는 개선 불가.

#### 5. Google Search Console 등록
- [ ] Sitemap 완성 후 Search Console에 제출
- [ ] `https://ats-resume-optimizer-ten.vercel.app`로 속성 등록

#### 6. ProductHunt 런칭 준비
- [ ] 태그라인, 설명 문구 작성
- [ ] 스크린샷 5장 준비 (결과 화면 포함)
- [ ] 화요일~목요일 런칭 권장 (트래픽 최대)

### 인프라 (보류)
- [ ] **커스텀 도메인 연결** (미루기로 함)
  - Vercel Dashboard → Settings → Domains
  - DNS: A 레코드 `@` → `76.76.21.21` 또는 CNAME `www` → `cname.vercel-dns.com`
  - Supabase → Authentication → URL Configuration 업데이트
  - Google Cloud Console → OAuth redirect URIs 업데이트

---

## SEO 타겟 키워드 (참고)

```
2순위 (초기 집중 — 경쟁 낮음)
  "free ATS resume checker online"
  "resume keyword optimizer"
  "how to beat ATS resume"
  "LinkedIn job resume match"

롱테일 (전환율 높음)
  "ATS resume checker for software engineer"
  "resume match score free"
```

---

## 핵심 비즈니스 지표 목표 (3개월)

| 지표 | 목표 |
|------|------|
| 월간 방문자 (UV) | 5,000 |
| Free → 유료 전환율 | 5~8% |
| 평균 객단가 | $12 |
| 월 매출 | $500+ |

---

## 주요 URL

```
프로덕션: https://ats-resume-optimizer-ten.vercel.app

/[locale]/analyze         → 메인 분석 페이지
/[locale]/dashboard       → 분석 히스토리 (페이지네이션)
/[locale]/dashboard/[id]  → 분석 상세 보기
/[locale]/pricing         → 4-tier 가격 페이지
/api/analyze              → POST: 이력서 분석 (maxDuration=60)
/api/checkout             → GET: LemonSqueezy checkout redirect
/api/download             → POST: DOCX 생성 (Basic+)
/api/webhooks/lemonsqueezy → LemonSqueezy order_created 웹훅
```
