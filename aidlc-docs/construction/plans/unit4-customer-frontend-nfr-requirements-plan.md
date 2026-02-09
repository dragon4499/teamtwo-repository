# NFR Requirements Plan - Unit 4: Customer Frontend

## 개요
Unit 4 (Customer Frontend) React.js 애플리케이션의 비기능 요구사항 및 기술 스택을 결정합니다.

## 실행 단계

- [x] Step 1: 기능 설계 분석 완료
- [x] Step 2: NFR 질문 생성 및 사용자 답변 수집
- [x] Step 3: 답변 분석 및 모호성 검토
- [x] Step 4: NFR Requirements 산출물 생성
- [x] Step 5: Tech Stack Decisions 산출물 생성
- [x] Step 6: 사용자 승인 요청

---

## NFR 질문

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

---

## Question 1
React.js 프로젝트 생성 도구를 어떤 것으로 사용하시겠습니까?

A) Vite (빠른 빌드, HMR, 경량 번들러)
B) Create React App (CRA, 전통적 React 프로젝트 도구)
C) Next.js (SSR/SSG 지원, 풀스택 프레임워크)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
CSS 스타일링 방식을 어떤 것으로 사용하시겠습니까?

A) CSS Modules (컴포넌트별 스코프 CSS, 별도 .module.css 파일)
B) Tailwind CSS (유틸리티 퍼스트 CSS 프레임워크)
C) styled-components (CSS-in-JS, 런타임 스타일링)
D) 일반 CSS 파일 (글로벌 CSS, 단순한 구조)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
프론트엔드 테스트 프레임워크를 어떤 것으로 사용하시겠습니까?

A) Vitest + React Testing Library (Vite 네이티브, 빠른 실행)
B) Jest + React Testing Library (전통적, 풍부한 생태계)
C) Vitest + React Testing Library + Playwright (단위 + E2E 테스트)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
HTTP 클라이언트 라이브러리를 어떤 것으로 사용하시겠습니까?

A) fetch API (브라우저 내장, 추가 의존성 없음)
B) Axios (인터셉터, 자동 JSON 변환, 요청 취소 지원)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
라우팅 라이브러리를 어떤 것으로 사용하시겠습니까?

A) React Router v6 (표준 SPA 라우팅, 가장 널리 사용)
B) TanStack Router (타입 안전, 파일 기반 라우팅)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
페이지 로딩 성능 목표를 어떻게 설정하시겠습니까? (초기 페이지 로드 기준)

A) 빠른 로딩 (초기 로드 2초 이내, 페이지 전환 500ms 이내 - 코드 스플리팅, 이미지 최적화 적용)
B) 표준 로딩 (초기 로드 3초 이내, 페이지 전환 1초 이내 - 기본 번들링)
C) MVP 수준 (성능 최적화 최소화, 기능 구현에 집중)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
반응형 디자인 및 디바이스 지원 범위를 어떻게 설정하시겠습니까?

A) 태블릿 전용 (768px~1024px, 테이블오더 태블릿 기기 최적화)
B) 모바일 + 태블릿 (320px~1024px, 모바일 퍼스트 반응형)
C) 모든 디바이스 (320px~1920px, 데스크톱 포함 완전 반응형)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
접근성(Accessibility) 수준을 어떻게 설정하시겠습니까?

A) 기본 접근성 (시맨틱 HTML, alt 텍스트, 키보드 네비게이션 기본 지원)
B) WCAG 2.1 AA 수준 (색상 대비, 포커스 관리, ARIA 레이블, 스크린 리더 지원)
C) MVP 수준 (접근성 최소화, 기능 구현 우선)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
오프라인/네트워크 불안정 상황에서의 동작을 어떻게 처리하시겠습니까?

A) 기본 오류 표시 (네트워크 오류 시 모달/토스트로 안내, 재시도 버튼 제공)
B) 오프라인 감지 + 큐잉 (네트워크 상태 감지, 오프라인 시 주문을 큐에 저장 후 복구 시 자동 전송)
C) 오프라인 감지 + 안내 (네트워크 상태 감지, 오프라인 시 배너 표시, 기능 차단)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
국제화(i18n) 지원이 필요합니까?

A) 한국어 단일 언어 (하드코딩 텍스트, i18n 라이브러리 불필요)
B) 다국어 지원 준비 (i18n 라이브러리 도입, 한국어 기본 + 확장 가능 구조)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

