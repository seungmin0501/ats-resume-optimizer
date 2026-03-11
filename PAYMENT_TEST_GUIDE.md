# 결제 플로우 테스트 가이드 (LemonSqueezy Test Mode)

> 실제 돈 필요 없음. Test Mode는 가짜 카드로 전체 결제 플로우를 시뮬레이션합니다.

---

## 현재 환경변수 현황

```
LEMONSQUEEZY_STORE_ID=871301
LEMONSQUEEZY_BASIC_VARIANT_ID=1372172
LEMONSQUEEZY_PRO_VARIANT_ID=1376576
LEMONSQUEEZY_UNLIMITED_VARIANT_ID=1376577
```

---

## 사전 준비 — ngrok 설치

로컬 서버(localhost:3000)가 LemonSqueezy webhook을 받으려면 외부에서 접근 가능한 URL이 필요합니다. ngrok이 이 역할을 합니다.

### Windows에서 ngrok 설치 방법 (3가지 중 택1)

**방법 A: 공식 사이트에서 다운로드 (가장 간단)**
1. https://ngrok.com/download 에서 Windows용 ZIP 다운로드
2. ZIP 압축 해제 → `ngrok.exe` 파일 추출
3. `ngrok.exe`를 프로젝트 폴더(`D:\coding\MP3_ResumeOptimizer`)에 복사하거나, `C:\Windows\System32`에 복사 (전역 사용)

**방법 B: Chocolatey로 설치**
```powershell
choco install ngrok
```

**방법 C: npm 패키지로 설치**
```bash
npm install -g ngrok
```

### ngrok 계정 등록 (무료, 필수)
1. https://dashboard.ngrok.com/signup 에서 무료 계정 생성
2. 로그인 후 https://dashboard.ngrok.com/get-started/your-authtoken 에서 authtoken 복사
3. 아래 명령어 실행:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

---

## Step 1 — LemonSqueezy Test Mode API Key 발급

현재 `.env.local`의 `LEMONSQUEEZY_API_KEY`는 **Live Mode 키**입니다.
Test Mode에서는 별도의 API Key가 필요합니다.

1. https://app.lemonsqueezy.com 로그인
2. 좌측 하단 프로필 영역 클릭 → **"Test Mode"** 토글 ON
   (화면 상단에 주황색 "TEST MODE" 배너가 표시되면 성공)
3. 우측 상단 프로필 클릭 → **Settings → API**
4. **"Create new API key"** 클릭 → 이름 입력 (예: "test-key") → 복사

---

## Step 2 — 로컬 환경변수 임시 변경

`.env.local` 파일을 열어 아래 항목을 Test Mode 값으로 변경합니다.
**원본 값을 주석으로 백업해두세요.**

```bash
# LEMONSQUEEZY_API_KEY=기존_라이브_키  ← 백업
LEMONSQUEEZY_API_KEY=테스트모드_API_키

# Webhook Secret은 Test Mode에서도 동일하게 사용됩니다.
# Store ID, Variant ID도 동일하게 유지합니다.
```

> Variant ID는 Live/Test 모드 구분 없이 동일한 값을 사용합니다.

---

## Step 3 — LemonSqueezy Webhook URL 설정

### 3-1. Test Mode에서 Webhook 등록

1. LemonSqueezy Dashboard (Test Mode ON 상태)
2. 좌측 메뉴 **Settings → Webhooks**
3. **"Add webhook"** 클릭
4. URL: 일단 빈칸 (ngrok URL을 얻은 뒤 입력)
5. 이벤트: **"order_created"** 체크
6. Signing Secret: `.env.local`의 `LEMONSQUEEZY_WEBHOOK_SECRET` 값 동일하게 입력

---

## Step 4 — 로컬 서버 + ngrok 실행

터미널 2개를 열어 각각 실행합니다.

**터미널 1 — Next.js 개발 서버**
```bash
cd D:\coding\MP3_ResumeOptimizer
npm run dev
```
`http://localhost:3000` 에서 실행되면 OK.

**터미널 2 — ngrok 터널**
```bash
ngrok http 3000
```

실행하면 아래와 같은 출력이 나타납니다:
```
Forwarding  https://xxxx-xx-xx-xxx.ngrok-free.app -> http://localhost:3000
```

이 `https://xxxx-xx-xx-xxx.ngrok-free.app` URL을 복사합니다.

---

## Step 5 — Webhook URL 업데이트

Step 3에서 만든 Webhook 항목으로 돌아가서:

```
URL: https://xxxx-xx-xx-xxx.ngrok-free.app/api/webhooks/lemonsqueezy
```

저장합니다.

---

## Step 6 — 실제 테스트

### 테스트 카드 정보
```
카드 번호: 4242 4242 4242 4242
만료일:    12/34  (미래 날짜면 아무거나)
CVC:       123
이름:      아무 이름
우편번호:  아무 값 (예: 12345)
이메일:    본인 이메일 (Supabase 로그인 이메일)
```

### Basic $5 테스트 순서

1. 브라우저에서 `http://localhost:3000/ko/pricing` 접속
2. Google 계정으로 로그인 (오른쪽 상단)
3. **Basic $5 "Get Basic"** 버튼 클릭
4. LemonSqueezy Checkout 페이지로 이동됨
   (상단에 주황색 **"Test mode"** 배너 확인 — 없으면 Test Mode가 아닌 것)
5. 위의 테스트 카드 정보 입력
6. **"Pay $5.00"** 클릭

### 결과 확인

**터미널 1 (npm run dev)** 에서 로그 확인:
```
[webhook] order_created received
```

**Supabase Dashboard에서 확인:**
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 → **Table Editor → users**
3. 본인 이메일 행에서:
   - `plan_tier`: `basic` 으로 변경됐는지 확인
   - `credits_remaining`: `1 → 4` (기존 1 + 구매 3)로 변경됐는지 확인

---

## Step 7 — Pro / Unlimited 테스트

같은 방식으로 반복합니다.

**Pro $15 테스트 확인 항목:**
- `plan_tier` → `pro`
- `credits_remaining` → 기존값 + 10
- 분석 결과 페이지에서 커버레터, 면접 Q&A 섹션이 잠금 해제되는지 확인

**Unlimited $29 테스트 확인 항목:**
- `plan_tier` → `unlimited`
- `credits_remaining` → 999
- `unlimited_expires_at` → 현재 날짜 + 90일 설정됐는지 확인

---

## Step 8 — 분석 기능 통합 테스트

결제 완료 후 실제 분석을 돌려봅니다.

1. `/analyze` 페이지에서 PDF 업로드 + 채용공고 입력 후 분석
2. **Basic 계정**: Section Feedback 전체 공개 + DOCX 다운로드 가능한지 확인
3. **Pro 계정**: 커버레터 + 면접 Q&A 카드가 표시되는지 확인
4. **Unlimited 계정**: 언어 선택 드롭다운이 활성화되는지 확인

---

## Step 9 — 크레딧 소진 테스트

1. Free 계정(credits_remaining=0)으로 로그인
2. 분석 시도 시 "You've used your free scan" 모달이 뜨는지 확인
3. 모달에서 플랜 선택 버튼이 정상 동작하는지 확인

Supabase에서 직접 크레딧을 0으로 설정해서 테스트할 수 있습니다:
```sql
-- Supabase SQL Editor에서 실행
UPDATE users SET credits_remaining = 0 WHERE email = '본인이메일@gmail.com';
```

---

## 테스트 완료 후 정리 (필수!)

### 1. `.env.local` 원복
```bash
# Test Mode 키 삭제하고 Live Mode 키 복원
LEMONSQUEEZY_API_KEY=원래_라이브_키
```

### 2. LemonSqueezy Test Mode Webhook 삭제 또는 비활성화
- LemonSqueezy Dashboard → Settings → Webhooks
- Test Mode에서 만든 ngrok webhook 삭제

### 3. ngrok 종료
터미널 2에서 `Ctrl+C`

### 4. Supabase에서 테스트 데이터 정리 (선택)
```sql
-- 테스트 계정 리셋
UPDATE users
SET plan_tier = 'free', credits_remaining = 1, unlimited_expires_at = NULL
WHERE email = '테스트계정이메일@gmail.com';
```

---

## 문제 발생 시 체크리스트

| 증상 | 원인 | 해결 |
|------|------|------|
| Checkout에 "Test mode" 배너 없음 | Live Mode로 접속 중 | LemonSqueezy에서 Test Mode 토글 확인 |
| Webhook 수신 안 됨 | ngrok URL 틀림 | ngrok 재실행 후 URL 다시 등록 |
| `invalid signature` 오류 | Webhook Secret 불일치 | LS Dashboard Webhook Secret = `.env.local` 값 일치 확인 |
| `unknown variant_id` 로그 | Test Mode variant ID 다름 | Test Mode에서 상품/variant ID 재확인 |
| `credits_remaining` 변경 안 됨 | `custom_data.user_id` 미전달 | checkout URL에 `?checkout[custom][user_id]=...` 포함됐는지 확인 |
| ngrok "session expired" | 무료 플랜 2시간 제한 | ngrok 재실행 후 webhook URL 재등록 |
