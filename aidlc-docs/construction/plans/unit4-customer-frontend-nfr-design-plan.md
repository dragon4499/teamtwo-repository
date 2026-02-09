# NFR Design Plan - Unit 4: Customer Frontend

## 개요
Unit 4 (Customer Frontend)의 NFR 요구사항을 구체적인 설계 패턴과 논리적 컴포넌트로 변환합니다.

## 실행 단계

- [x] Step 1: NFR 요구사항 분석 완료
- [x] Step 2: NFR 설계 질문 생성 및 사용자 답변 수집
- [x] Step 3: 답변 분석 및 모호성 검토
- [x] Step 4: NFR Design Patterns 산출물 생성
- [x] Step 5: Logical Components 산출물 생성
- [x] Step 6: 사용자 승인 요청

---

## NFR 설계 질문

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

---

## Question 1
Axios 인터셉터에서 401 (세션 만료) 응답을 받았을 때 자동 재인증 처리 방식을 어떻게 구현하시겠습니까?

A) Axios 응답 인터셉터에서 자동 재인증 시도 후 원래 요청 재시도 (투명한 토큰 갱신)
B) 401 수신 시 즉시 AuthContext에 알리고, Context 레벨에서 재인증 처리 (컴포넌트 주도)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
React Context 리렌더링 최적화를 어떤 수준으로 적용하시겠습니까?

A) 기본 최적화 (React.memo + useMemo/useCallback 주요 컴포넌트에 적용)
B) 고급 최적화 (Context 분리 - 상태/디스패치 분리, 선택적 구독 패턴 적용)
C) MVP 수준 (최적화 최소화, 기능 구현 우선 후 필요 시 최적화)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
코드 스플리팅 전략을 어떻게 적용하시겠습니까?

A) 페이지 단위 스플리팅 (React.lazy로 각 페이지 컴포넌트 동적 import)
B) 페이지 + 대형 라이브러리 스플리팅 (페이지 단위 + i18next 등 별도 청크)
C) 스플리팅 없음 (단일 번들, MVP 단순화)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
CSS 디자인 토큰(색상, 간격, 폰트 등) 관리 방식을 어떻게 하시겠습니까?

A) CSS Custom Properties (variables.css에 :root 변수 정의, 컴포넌트에서 var() 참조)
B) JavaScript 상수 파일 (theme.js에 객체로 정의, 인라인 스타일 또는 CSS-in-JS 활용)
C) CSS Modules 내 직접 값 사용 (별도 토큰 관리 없음, 각 .module.css에 직접 작성)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
테스트 파일 배치 전략을 어떻게 하시겠습니까?

A) 소스 코드와 분리 (tests/ 디렉토리에 미러 구조로 배치)
B) 소스 코드와 동일 위치 (각 컴포넌트 옆에 .test.jsx 파일 배치)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

