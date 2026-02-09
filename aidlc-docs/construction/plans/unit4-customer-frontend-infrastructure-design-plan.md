# Infrastructure Design Plan - Unit 4: Customer Frontend

## 개요
Unit 4 (Customer Frontend) React.js 애플리케이션의 로컬 개발 환경 인프라 및 배포 구성을 설계합니다.

## 실행 단계

- [x] Step 1: 설계 산출물 분석 완료
- [x] Step 2: 인프라 질문 생성 및 사용자 답변 수집
- [x] Step 3: 답변 분석 및 모호성 검토
- [x] Step 4: Infrastructure Design 산출물 생성
- [x] Step 5: Deployment Architecture 산출물 생성
- [x] Step 6: 사용자 승인 요청

---

## 인프라 설계 질문

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

---

## Question 1
Customer Frontend 개발 서버 포트를 어떻게 설정하시겠습니까? (Backend는 8000, Admin Frontend는 3001 예정)

A) 3000 (React 기본 포트) 
B) 5173 (Vite 기본 포트)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Backend API 프록시 설정을 어떻게 하시겠습니까? (CORS 처리 방식)

A) Vite proxy 설정 (vite.config.js에서 /api → localhost:8000 프록시)
B) Backend CORS 설정에 의존 (프론트엔드에서 직접 localhost:8000 호출)
C) Other (please describe after [Answer]: tag below)

[Answer]:  A

---

## Question 3
Node.js 버전 관리를 어떻게 하시겠습니까?

A) Node.js 20 LTS (안정적, 장기 지원)
B) Node.js 22 LTS (최신 LTS)
C) 버전 제한 없음 (package.json engines 미설정)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4
패키지 매니저를 어떤 것으로 사용하시겠습니까?

A) npm (Node.js 기본 내장)
B) yarn (빠른 설치, 워크스페이스 지원)
C) pnpm (디스크 효율적, 엄격한 의존성 관리)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

