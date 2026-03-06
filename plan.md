# AI Resume Optimizer — 제품 기획서

> **목적**: 이 문서는 Claude Code가 대화 없이 파일만 읽고 개발을 시작할 수 있도록 작성된 완전한 제품 기획서입니다.

---

## 제품 개요

### 한 줄 정의
채용공고와 이력서를 입력받아 ATS(Applicant Tracking System) 통과 가능성을 분석하고, 자연스럽고 설득력 있는 이력서로 최적화해주는 AI SaaS 도구.

### 핵심 철학
- **"점수 올리기"가 아닌 "자연스럽게 설득력 있는 이력서"**
- 키워드 남용(keyword stuffing) 없이 실제 경험을 잘 드러내는 방향으로 최적화
- 완벽을 향한 점진적 접근: MVP보다 처음부터 프로덕션 퀄리티

### 개발자 컨텍스트
- 1인 개발자 (바이브 코딩)
- 기존 제품: VoiceToContent, ContentSplitter (동일 기술 스택 사용 중)
- 결제: LemonSqueezy 기사용
- 다국어: 한국어, 영어, 일본어, 스페인어 지원 예정

---

## 시장 분석

### 경쟁 제품 현황

| 제품 | 가격 | 강점 | 치명적 약점 |
|------|------|------|-------------|
| Jobscan | $49.95/월 | ATS 정확도 최고 | 너무 비싸고 느림. 구직자에게 부담 |
| ResumeWorded | $19/월 | 합리적 가격 | 기능 단순, UI 구식 |
| Rezi.ai | $3/월~ | 저렴함 | ATS 최적화보다 템플릿 빌더에 가까움 |
| Careerflow | 무료~ | 1M+ 사용자 | 기능 너무 많아 복잡 |

### 포지셔닝
```
Rezi ($3) ── 우리 ($12) ── ResumeWorded ($19) ── Jobscan ($49)
              ↑
         스위트 스팟: 합리적 가격 + Jobscan급 품질
```

### 타겟 고객
- 글로벌 B2C 구직자 (취준생, 이직 준비자)
- 특히 영어권 시장 우선 (SEO 트래픽 기반 자연 유입)
- 절박한 고객 = 높은 결제 전환율

---

## 제품 구조

### 전체 흐름
```
[채용공고 단일 입력창]
  ├── http(s):// 로 시작하면 → 서버에서 URL 스크래핑으로 텍스트 추출
  └── 그 외 → 붙여넣기 텍스트 그대로 사용
                              ├──▶ GPT-4o 분석 ──▶ 매칭 점수 + 개선안 출력
[이력서 PDF 업로드]          ──┘
       ↓
  pdf-parse로 텍스트 추출
```

### 채용공고 입력 방식 상세

입력창 하나로 URL과 텍스트를 자동 구분합니다. 사용자는 아무 생각 없이 그냥 붙여넣기만 하면 됩니다.

- **URL 입력 시** (예: `https://linkedin.com/jobs/...`) → 서버에서 `cheerio`로 스크래핑하여 텍스트 추출. 스크래핑 실패 시(로그인 필요 페이지 등) "텍스트를 직접 붙여넣어 주세요" 안내 메시지 표시
- **텍스트 입력 시** → 그대로 GPT에 전달

> **채용공고 복사 제한 걱정 불필요**: LinkedIn, Indeed, 원티드 등 모든 주요 채용 플랫폼은 채용공고 텍스트 복사를 막지 않습니다. 채용공고는 최대한 많은 사람이 읽게 하는 것이 목적인 콘텐츠이기 때문입니다.

### 무료 vs 유료 기능

| 기능 | 무료 (3회/월) | 유료 |
|------|--------------|------|
| 매칭 점수 (0~100) | ✅ | ✅ |
| 누락 키워드 목록 | ✅ | ✅ |
| 섹션별 피드백 | 일부 공개 | ✅ 전체 |
| 최적화된 이력서 DOCX 다운로드 | ❌ | ✅ ← 핵심 전환 포인트 |
| 무제한 분석 | ❌ | ✅ |

---

## 디자인 시스템

### 색상 팔레트
```
Primary     : #2563EB (Blue-600) — 버튼, 강조, 링크
Success     : #16A34A (Green-600) — 높은 점수, 완료 상태
Warning     : #D97706 (Amber-600) — 중간 점수, 경고
Danger      : #DC2626 (Red-600) — 낮은 점수, 오류
Background  : #F9FAFB (Gray-50) — 페이지 배경
Surface     : #FFFFFF — 카드 배경
Text Main   : #111827 (Gray-900)
Text Sub    : #6B7280 (Gray-500)
Border      : #E5E7EB (Gray-200)
```

### 점수별 색상 규칙
```
80~100점 → Success (#16A34A) — "통과 가능성 높음"
60~79점  → Warning (#D97706) — "개선 필요"
0~59점   → Danger  (#DC2626) — "통과 어려움"
```

### 폰트
```
영문 : Inter (Google Fonts)
한국어: Noto Sans KR (Google Fonts)
코드 : JetBrains Mono
```

### 공통 컴포넌트 스타일 원칙
- 카드: `rounded-xl shadow-sm border border-gray-200 bg-white p-6`
- 기본 버튼: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold`
- 입력창: `border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 w-full`
- blur 처리 (무료 제한): `filter blur-sm select-none pointer-events-none`

---

## 페이지별 UI 상세 명세

### 1. 랜딩 페이지 (`/`)

**목적**: 방문자를 분석 페이지로 전환시키는 것. 설명보다 행동 유도 우선.

**섹션 구성 (위→아래)**:
```
[Hero]
  - 헤드라인: "Beat the ATS. Land the Interview."
  - 서브: "Paste your resume and job posting. Get an instant match score and optimized resume in seconds."
  - CTA 버튼 (크게): "Analyze My Resume — It's Free"
  - 신뢰 지표: "Trusted by 10,000+ job seekers" (출시 후 실수치로 교체)

[How It Works — 3단계]
  1. Upload your resume (PDF)
  2. Paste job posting URL or text
  3. Get your score + optimized resume

[결과 미리보기 — 스크린샷/목업]
  - 실제 결과 화면 캡처 이미지로 신뢰도 확보

[Pricing 요약]
  - Free / Pro 카드 2개
  - "Start Free" CTA

[Footer]
  - Privacy Policy / Terms of Service / 언어 선택
```

---

### 2. 분석 페이지 (`/analyze`)

**목적**: 핵심 기능 페이지. 입력 → 결과까지 한 페이지에서 처리.

**레이아웃**:
```
┌─────────────────────────────────────────────────────┐
│  상단: 네비게이션 (로고 | 크레딧 잔여: 2회 | 로그인) │
├──────────────────────┬──────────────────────────────┤
│  왼쪽 패널 (입력)    │  오른쪽 패널 (결과)          │
│                      │                              │
│  [채용공고 입력창]   │  ← 분석 전: 빈 상태 안내    │
│  URL 또는 텍스트     │  ← 분석 후: 결과 카드들     │
│                      │                              │
│  [이력서 업로드존]   │                              │
│  PDF 드래그앤드롭    │                              │
│                      │                              │
│  [분석하기 버튼]     │                              │
└──────────────────────┴──────────────────────────────┘
```

**입력 패널 상세**:
- 채용공고 입력창: placeholder = "Paste job URL (LinkedIn, Indeed...) or job description text"
  - URL 감지 시 입력창 우측에 작은 스피너 표시 후 "Job posting loaded ✓" 표시
  - 스크래핑 실패 시 "Couldn't fetch URL. Please paste the text directly." 인라인 에러
- 이력서 업로드존:
  - 드래그앤드롭 영역 (점선 테두리)
  - "Drop your resume PDF here, or click to browse"
  - 업로드 완료 시 파일명 + "✓ Resume loaded" 표시
  - PDF만 허용, 최대 5MB
- 분석하기 버튼: 두 입력이 모두 완료되어야 활성화

**결과 패널 상세 (분석 완료 후)**:

```
┌─────────────────────────────┐
│  Match Score                │
│  ████████░░  78 / 100       │ ← 원형 게이지 또는 프로그레스바
│  Grade: B  "Good match"     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Missing Keywords (5)       │
│  [project management] [SQL] │ ← 태그 형태
│  [stakeholder] [agile] ...  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Section Feedback           │
│  Summary    ▼               │ ← 아코디언
│  Experience ▼               │
│  Skills     ▼               │
│  (무료: 첫 1개만, 나머지 blur)│
└─────────────────────────────┘

┌─────────────────────────────┐
│  Format Warnings (2)        │
│  ⚠ Tables detected          │
│  ⚠ Special characters found │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🔒 Optimized Resume        │ ← 유료 전용
│  [Download .docx]           │
│  "Upgrade to Pro to unlock" │
└─────────────────────────────┘
```

---

### 3. 가격 페이지 (`/pricing`)

```
┌──────────────┐  ┌──────────────┐
│     FREE     │  │   PRO ★      │
│     $0       │  │  $12/월      │
│              │  │  $99/년      │
│ 3 scans/mo   │  │  Unlimited   │
│ Match score  │  │  + DOCX      │
│ Keywords     │  │  + Full      │
│              │  │    feedback  │
│ [Start Free] │  │ [Get Pro]    │
└──────────────┘  └──────────────┘
연간 플랜 선택 시 "Save 17%" 배지 표시
```

---

### 4. 대시보드 (`/dashboard`)

로그인 사용자 전용.

```
[크레딧 현황]
  - 플랜: Free / Pro
  - 잔여 분석 횟수 (무료일 때만 표시)
  - 다음 리셋 날짜

[분석 히스토리]
  - 날짜 | 회사명(채용공고에서 추출) | 점수 | 다시보기 버튼
  - 최대 10개 저장 (무료), 무제한 (유료)

[플랜 관리]
  - 현재 플랜 표시
  - 업그레이드 / 취소 버튼 (LemonSqueezy 고객 포털 링크)
```

---

## 사용자 플로우

### 플로우 A: 비로그인 사용자
```
랜딩 페이지 →  분석 페이지 → 입력 완료 → 분석하기 클릭
→ "로그인이 필요합니다" 모달 (Google 로그인 버튼)
→ 로그인 완료 → 분석 자동 재실행 → 결과 표시 (무료 3회 차감)
```

### 플로우 B: 무료 사용자 (크레딧 있음)
```
분석 페이지 → 입력 → 분석하기 → 결과 표시
→ 섹션 피드백 blur 영역 클릭 → "Upgrade to Pro" 모달
→ DOCX 다운로드 클릭 → "Upgrade to Pro" 모달
```

### 플로우 C: 무료 사용자 (크레딧 소진)
```
분석하기 클릭 → "You've used all 3 free scans this month" 모달
→ [Upgrade to Pro] 또는 [다음 달까지 기다리기] 선택
```

### 플로우 D: 유료 사용자
```
분석 페이지 → 입력 → 분석하기 → 결과 전체 공개
→ DOCX 다운로드 → 파일 즉시 다운로드
```

### 플로우 E: 결제 플로우
```
"Upgrade to Pro" 모달 → [월간 $12] or [연간 $99] 선택
→ LemonSqueezy Checkout 페이지 (새 탭)
→ 결제 완료 → Webhook 수신 → Supabase 플랜 업데이트
→ 사용자 화면: "You're now Pro! 🎉" 토스트 메시지
```

---

## DB 스키마 (Supabase)

### users 테이블
```sql
id            uuid PRIMARY KEY  -- Supabase Auth UID와 동일
email         text NOT NULL
plan          text DEFAULT 'free'  -- 'free' | 'pro'
credits_used  int  DEFAULT 0       -- 이번 달 사용 횟수 (무료 플랜)
credits_reset date                 -- 다음 리셋 날짜
ls_customer_id text               -- LemonSqueezy customer ID
ls_subscription_id text           -- LemonSqueezy subscription ID
created_at    timestamptz DEFAULT now()
```

### analyses 테이블
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES users(id)
job_title       text       -- 채용공고에서 GPT가 추출
company_name    text       -- 채용공고에서 GPT가 추출
match_score     int
grade           text       -- 'A' | 'B' | 'C' | 'D'
missing_keywords text[]
section_feedback jsonb
format_warnings  text[]
optimized_resume text      -- 유료 사용자만 저장
created_at      timestamptz DEFAULT now()
```

### RLS (Row Level Security) 정책
```sql
-- users: 본인 데이터만 읽기/쓰기
-- analyses: 본인 데이터만 읽기/쓰기
```

---

## API 엔드포인트 상세

### POST `/api/scrape`
채용공고 URL → 텍스트 추출

**Request**:
```json
{ "url": "https://linkedin.com/jobs/view/..." }
```
**Response (성공)**:
```json
{ "success": true, "text": "We are looking for a..." }
```
**Response (실패)**:
```json
{ "success": false, "error": "SCRAPE_FAILED" }
```

---

### POST `/api/analyze`
핵심 분석 API. 인증 필요.

**Request**:
```json
{
  "job_description": "We are looking for...",
  "resume_text": "John Doe, Software Engineer..."
}
```
**Response**:
```json
{
  "match_score": 78,
  "grade": "B",
  "job_title": "Software Engineer",
  "company_name": "Acme Corp",
  "missing_keywords": ["agile", "stakeholder management"],
  "section_feedback": {
    "summary": "Add a brief mention of your leadership experience...",
    "experience": "Quantify achievements. e.g. 'Reduced load time by 40%'",
    "skills": "Add SQL and project management tools explicitly."
  },
  "format_warnings": ["Table detected in experience section"],
  "optimized_resume": "John Doe..."  // 유료 사용자만, 무료는 null
}
```
**에러 케이스**:
- `401` 비로그인
- `403` 크레딧 소진
- `413` PDF 파일 5MB 초과
- `500` GPT API 오류

---

### POST `/api/download`
최적화된 이력서 DOCX 생성. 유료 사용자만.

**Request**:
```json
{ "analysis_id": "uuid" }
```
**Response**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (파일 스트림)

---

### POST `/api/webhooks/lemonsqueezy`
LemonSqueezy 구독 이벤트 수신.

**처리할 이벤트**:
- `subscription_created` → users.plan = 'pro'
- `subscription_cancelled` → users.plan = 'free' (기간 만료 후)
- `subscription_resumed` → users.plan = 'pro'

---

## GPT 프롬프트 설계

```
You are a senior HR professional and ATS (Applicant Tracking System) expert with 10 years of experience.
Your goal is to help job seekers present their REAL experience more effectively — never encourage keyword stuffing.
Integrate keywords naturally into existing sentences. Do not fabricate experience.

[Job Posting]:
{job_description}

[Resume]:
{resume_text}

Analyze and return ONLY valid JSON with no additional text:

{
  "match_score": <integer 0-100>,
  "grade": <"A" | "B" | "C" | "D">,
  "job_title": <extracted job title from posting>,
  "company_name": <extracted company name from posting>,
  "missing_keywords": [<string>, ...],
  "section_feedback": {
    "summary": <string>,
    "experience": <string>,
    "skills": <string>
  },
  "format_warnings": [<string>, ...],
  "optimized_resume": <full rewritten resume as string, or null if not needed>
}
```

**점수 산정 기준 (GPT에게 명시)**:
- 하드 스킬 키워드 매칭: 40%
- 직무 경험 관련성: 30%
- 포맷 ATS 호환성: 15%
- 소프트 스킬 / 톤: 15%

---

## 기술 스택

기존 제품(VoiceToContent, ContentSplitter)과 동일 스택 유지.

```
Frontend   : Next.js 15 (App Router) + TypeScript + Tailwind CSS
Backend    : Next.js API Routes (Serverless)
Database   : Supabase (사용자, 크레딧, 사용 로그)
Auth       : Supabase Auth (Google 소셜 로그인)
Payment    : LemonSqueezy (기존 사용 중)
AI         : OpenAI GPT-4o
PDF 파싱   : pdf-parse (신규)
URL 스크래핑: cheerio (신규)
배포       : Vercel
다국어     : next-intl (한국어, 영어, 일본어, 스페인어)
```

> **핵심**: 기존 스택에서 `pdf-parse`, `cheerio` 두 가지만 추가됨.

---

## 가격 모델

| 플랜 | 가격 | 분석 횟수 | 비고 |
|------|------|-----------|------|
| Free | $0 | 3회/월 | 결과 일부만 공개 |
| Pro | $12/월 | 무제한 | DOCX 다운로드 포함 |
| Pro Annual | $99/년 | 무제한 | 월 $8.25 환산, 17% 할인 |

---

## 개발 로드맵 (5단계)

### 1단계 — 핵심 엔진
- [ ] 채용공고 단일 입력창 구현 (URL/텍스트 자동 감지)
- [ ] URL 입력 시 `cheerio`로 서버 스크래핑 → 텍스트 추출
- [ ] 스크래핑 실패 시 사용자 안내 메시지 처리
- [ ] 이력서 PDF 업로드 → `pdf-parse`로 텍스트 추출
- [ ] GPT-4o 분석 API Route 구현
- [ ] JSON 응답 파싱 및 결과 화면 출력
- [ ] 로딩/에러 상태 처리

### 2단계 — UI/UX
- [ ] 매칭 점수 시각적 게이지 컴포넌트
- [ ] 누락 키워드 목록 카드
- [ ] 섹션별 피드백 카드 (무료: blur 처리, 유료: 전체 공개)
- [ ] 포맷 경고 표시
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)

### 3단계 — 프로덕션 필수
- [ ] 다국어 지원 (한국어, 영어, 일본어, 스페인어) — next-intl
- [ ] SEO 메타태그 (페이지별 title, description, OG)
- [ ] Schema.org SoftwareApplication 마크업
- [ ] Core Web Vitals 최적화

### 4단계 — 인증 + 결제
- [ ] Supabase Auth Google 소셜 로그인
- [ ] 크레딧 시스템 (무료 3회, 유료 무제한)
- [ ] LemonSqueezy 구독 플랜 연동
- [ ] Webhook 처리 (구독 상태 → Supabase 업데이트)
- [ ] 유료 전용 기능: 최적화된 이력서 DOCX 다운로드

### 5단계 — QA + 출시
- [ ] E2E 테스트 (Playwright) — 전체 결제/분석 플로우
- [ ] 보안 점검 (CORS, XSS, Rate Limiting, 환경변수 노출 여부)
- [ ] 개인정보 처리방침 / 이용약관 페이지
- [ ] Vercel 프로덕션 배포
- [ ] ProductHunt 런칭 준비

---

## 파일/폴더 구조 (권장)

```
/app
  /[locale]               ← next-intl 다국어 라우팅
    /page.tsx             ← 랜딩 페이지
    /analyze/page.tsx     ← 분석 메인 페이지
    /dashboard/page.tsx   ← 사용자 대시보드 (크레딧, 히스토리)
    /pricing/page.tsx     ← 가격 페이지
/app/api
  /analyze/route.ts       ← PDF 파싱 + GPT 분석 핵심 API
  /scrape/route.ts        ← 채용공고 URL 스크래핑 (cheerio)
  /download/route.ts      ← 최적화 이력서 DOCX 생성 (유료)
  /webhooks/route.ts      ← LemonSqueezy Webhook 처리
/components
  /JobInput.tsx           ← 채용공고 단일 입력창 (URL/텍스트 자동 감지)
  /ScoreGauge.tsx         ← 매칭 점수 게이지
  /KeywordList.tsx        ← 누락 키워드 목록
  /FeedbackCard.tsx       ← 섹션별 피드백
  /UploadZone.tsx         ← PDF 드래그앤드롭 업로드
/messages
  /ko.json / en.json / ja.json / es.json
/lib
  /openai.ts              ← GPT 호출 wrapper
  /pdf.ts                 ← pdf-parse wrapper
  /scraper.ts             ← cheerio URL 스크래핑 wrapper
  /supabase.ts            ← DB 클라이언트
  /lemonsqueezy.ts        ← 결제 유틸
```

---

## 환경변수 목록

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=
```

---

## SEO 전략

### 타겟 키워드
```
1순위 (검색량 높음, 경쟁 높음)
  - "ATS resume checker"
  - "resume optimizer"
  - "ATS resume scanner free"

2순위 (검색량 중간, 경쟁 낮음) ← 초기 집중 타겟
  - "free ATS resume checker online"
  - "resume keyword optimizer"
  - "how to beat ATS resume"
  - "LinkedIn job resume match"

롱테일 (경쟁 거의 없음, 전환율 높음)
  - "how to optimize resume for [company] ATS"
  - "ATS resume checker for software engineer"
  - "resume match score free"
```

### 페이지별 메타태그

**랜딩 페이지**:
```
title: "Free ATS Resume Checker & Optimizer — Beat the Bots, Land Interviews"
description: "Instantly check how well your resume matches any job posting. Get a match score, missing keywords, and an AI-optimized resume. Free to start."
```

**분석 페이지**:
```
title: "Analyze Your Resume — ATS Resume Optimizer"
description: "Upload your resume and paste a job posting to get your ATS match score and optimization tips in seconds."
```

**가격 페이지**:
```
title: "Pricing — ATS Resume Optimizer"
description: "Start free with 3 scans/month. Upgrade to Pro for $12/month for unlimited scans and AI-optimized resume downloads."
```

### Schema.org 마크업
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ATS Resume Optimizer",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free plan available"
  }
}
```

### URL 구조 (다국어)
```
/          → 영어 기본 (가장 중요, SEO 트래픽)
/ko        → 한국어
/ja        → 일본어
/es        → 스페인어
```
> 영어 루트(`/`)를 기본으로 설정. 한국어가 기본이면 영어권 SEO 손해.

---

## 다국어 번역 키 (i18n)

### 구조 원칙
- 언어 파일: `/messages/en.json`, `ko.json`, `ja.json`, `es.json`
- 영어(en)를 기준으로 작성 후 나머지 번역

### 번역 키 전체 목록

```json
{
  "nav": {
    "logo": "ATS Resume Optimizer",
    "credits_remaining": "{{count}} scans left",
    "login": "Sign in",
    "dashboard": "Dashboard",
    "logout": "Sign out"
  },
  "landing": {
    "hero_title": "Beat the ATS. Land the Interview.",
    "hero_sub": "Paste your resume and job posting. Get an instant match score and optimized resume in seconds.",
    "cta_primary": "Analyze My Resume — It's Free",
    "how_it_works_title": "How It Works",
    "step1_title": "Upload Resume",
    "step1_desc": "Upload your resume as a PDF",
    "step2_title": "Paste Job Posting",
    "step2_desc": "URL or text — we handle both",
    "step3_title": "Get Your Score",
    "step3_desc": "Instant match score + optimized resume"
  },
  "analyze": {
    "job_input_placeholder": "Paste job URL (LinkedIn, Indeed...) or job description text",
    "job_loaded": "Job posting loaded ✓",
    "job_scrape_failed": "Couldn't fetch URL. Please paste the text directly.",
    "resume_upload_label": "Drop your resume PDF here, or click to browse",
    "resume_loaded": "Resume loaded ✓",
    "resume_size_error": "File too large. Max 5MB.",
    "resume_type_error": "PDF files only.",
    "analyze_button": "Analyze Resume",
    "analyzing": "Analyzing...",
    "login_required_title": "Sign in to continue",
    "login_required_desc": "Create a free account to get your analysis results.",
    "login_with_google": "Continue with Google"
  },
  "results": {
    "match_score_label": "Match Score",
    "grade_label": "Grade",
    "grade_a_desc": "Excellent match",
    "grade_b_desc": "Good match",
    "grade_c_desc": "Needs improvement",
    "grade_d_desc": "Poor match",
    "missing_keywords_title": "Missing Keywords",
    "section_feedback_title": "Section Feedback",
    "section_summary": "Summary",
    "section_experience": "Experience",
    "section_skills": "Skills",
    "format_warnings_title": "Format Warnings",
    "optimized_resume_title": "Optimized Resume",
    "download_docx": "Download .docx",
    "upgrade_to_unlock": "Upgrade to Pro to unlock",
    "blur_cta": "See full feedback — Upgrade to Pro"
  },
  "credits": {
    "no_credits_title": "You've used all 3 free scans this month",
    "no_credits_desc": "Upgrade to Pro for unlimited scans.",
    "resets_on": "Free scans reset on {{date}}"
  },
  "pricing": {
    "title": "Simple, Transparent Pricing",
    "free_plan": "Free",
    "pro_plan": "Pro",
    "per_month": "/month",
    "per_year": "/year",
    "save_badge": "Save 17%",
    "cta_free": "Start Free",
    "cta_pro": "Get Pro",
    "monthly": "Monthly",
    "annual": "Annual",
    "feature_scans_free": "3 scans / month",
    "feature_scans_pro": "Unlimited scans",
    "feature_score": "Match score & keywords",
    "feature_feedback_free": "Partial section feedback",
    "feature_feedback_pro": "Full section feedback",
    "feature_docx": "Optimized resume download (.docx)",
    "feature_history": "Analysis history"
  },
  "dashboard": {
    "title": "Dashboard",
    "plan_label": "Your Plan",
    "credits_label": "Scans Remaining",
    "resets_label": "Resets On",
    "history_title": "Analysis History",
    "history_empty": "No analyses yet. Go analyze your first resume!",
    "history_date": "Date",
    "history_company": "Company",
    "history_score": "Score",
    "history_view": "View",
    "manage_plan": "Manage Plan"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "api_error": "AI service temporarily unavailable. Please try again in a moment.",
    "auth_error": "Authentication failed. Please sign in again."
  }
}
```

---

## 보안 & Rate Limiting

### Rate Limiting 규칙
```
/api/scrape   → IP당 20회/시간 (스크래핑 어뷰징 방지)
/api/analyze  → 계정당 크레딧 시스템으로 제어 (별도 rate limit 불필요)
/api/webhooks → LemonSqueezy IP 화이트리스트 + 서명 검증
```

### 구현 방법
Vercel Edge Middleware + `@upstash/ratelimit` (Redis 기반, Vercel과 궁합 좋음)

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
})
```

### 보안 체크리스트
```
인증/인가
  - [ ] 모든 /api/* 라우트에서 Supabase session 검증
  - [ ] /api/download: 유료 사용자 여부 DB에서 확인 (프론트 상태 믿지 않기)
  - [ ] Webhook: X-Signature 헤더로 LemonSqueezy 서명 검증

입력 검증
  - [ ] PDF 파일: MIME type + 확장자 이중 검증, 최대 5MB
  - [ ] URL 입력: http(s):// 스키마만 허용, 내부 IP(localhost 등) 차단 (SSRF 방지)
  - [ ] 텍스트 입력: 최대 10,000자 제한

GPT 비용 보호
  - [ ] job_description 최대 5,000자로 자르기
  - [ ] resume_text 최대 5,000자로 자르기
  - [ ] GPT 응답 timeout 30초 설정

환경변수
  - [ ] 모든 API 키 환경변수로만 관리 (코드에 하드코딩 절대 금지)
  - [ ] NEXT_PUBLIC_ 접두사는 공개 키만 (Supabase anon key만 해당)
```

---

## 에러 처리 & UX 원칙

### 에러 상황별 사용자 메시지

| 상황 | 사용자에게 보여줄 메시지 | 처리 방법 |
|------|------------------------|-----------|
| URL 스크래핑 실패 | "Couldn't fetch that URL. Please paste the job text directly." | 입력창 포커스 이동 |
| PDF 파싱 실패 | "Couldn't read your PDF. Try saving it as a simple PDF (not scanned image)." | 재업로드 유도 |
| GPT API 오류 | "AI service is busy. Please try again in a moment." | 재시도 버튼 표시 |
| 크레딧 소진 | "You've used all 3 free scans this month." | 업그레이드 모달 |
| 파일 5MB 초과 | "File too large. Max size is 5MB." | 인라인 에러 |
| 로그인 필요 | "Sign in to see your results." | 로그인 모달 |
| 네트워크 오류 | "Connection error. Check your internet and try again." | 재시도 버튼 |

### 로딩 상태 UX
```
분석하기 버튼 클릭 후:
1. 버튼 → "Analyzing..." + 스피너 (비활성화)
2. 결과 패널: 스켈레톤 UI (회색 블록들이 shimmer 효과)
3. 완료 시: 결과 카드들이 위→아래로 순차 fade-in
예상 소요 시간: 10~20초 (GPT-4o 기준)
```

---

## 월간 크레딧 리셋 로직

무료 사용자의 3회 크레딧은 매월 1일 자동 리셋.

```sql
-- Supabase Cron (pg_cron) — 매월 1일 00:00 UTC 실행
UPDATE users
SET credits_used = 0,
    credits_reset = date_trunc('month', now()) + interval '1 month'
WHERE plan = 'free';
```

> Supabase 대시보드 → Database → Extensions → pg_cron 활성화 후 설정.

---

## 핵심 비즈니스 지표 (출시 후 추적)

| 지표 | 목표 (3개월) |
|------|-------------|
| 월간 방문자 (UV) | 5,000 |
| Free → Paid 전환율 | 3~5% |
| MRR | $500+ |
| Churn Rate | 10% 이하 |

---

*최종 업데이트: 2026-03-05 (v4 — SEO 전략, i18n 번역 키, 보안/Rate Limiting, 에러 처리, 크레딧 리셋 로직 추가)*
*작성: 승민 + Claude 기획 세션*
