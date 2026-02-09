# Tech Stack Decisions - Unit 4: Customer Frontend

---

## 1. 핵심 기술 스택 요약

| 영역 | 기술 | 버전 | 선택 근거 |
|------|------|------|-----------|
| 빌드 도구 | Vite | 5.x | 빠른 HMR, 경량 번들러, React 생태계 최적 지원 |
| UI 프레임워크 | React | 18.x | Context API + useReducer 상태 관리 (기존 설계 결정) |
| 라우팅 | React Router | v6.x | 표준 SPA 라우팅, 가장 널리 사용되는 라이브러리 |
| HTTP 클라이언트 | Axios | 1.x | 인터셉터, 자동 JSON 변환, 요청 취소, 타임아웃 설정 |
| 스타일링 | CSS Modules | - | 컴포넌트별 스코프 CSS, 빌드 타임 처리, 런타임 오버헤드 없음 |
| 국제화 | react-i18next | 14.x | 다국어 확장 가능 구조, JSON 번역 파일 분리 |
| 테스트 | Vitest + React Testing Library | - | Vite 네이티브 통합, 빠른 실행 속도 |
| 린터 | ESLint | 9.x | 코드 품질 및 스타일 일관성 |
| 포맷터 | Prettier | 3.x | 자동 코드 포맷팅 |

---

## 2. 의존성 상세

### 2.1 Production Dependencies

```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^6.28.0",
  "axios": "^1.7.0",
  "i18next": "^24.0.0",
  "react-i18next": "^14.1.0",
  "i18next-browser-languagedetector": "^8.0.0"
}
```

### 2.2 Development Dependencies

```json
{
  "@vitejs/plugin-react": "^4.3.0",
  "vite": "^5.4.0",
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.6.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^25.0.0",
  "eslint": "^9.0.0",
  "eslint-plugin-react": "^7.37.0",
  "eslint-plugin-react-hooks": "^5.0.0",
  "prettier": "^3.4.0"
}
```

---

## 3. 기술 선택 근거

### 3.1 Vite (빌드 도구)

| 항목 | 설명 |
|------|------|
| 선택 이유 | CRA 대비 10~100배 빠른 HMR, ES 모듈 기반 개발 서버 |
| 장점 | 빠른 콜드 스타트, 효율적 코드 스플리팅, Tree shaking 기본 지원 |
| 성능 목표 연계 | 초기 로드 2초 이내 목표 달성을 위한 최적 번들링 |
| 테스트 연계 | Vitest와 네이티브 통합으로 설정 공유 |

### 3.2 CSS Modules (스타일링)

| 항목 | 설명 |
|------|------|
| 선택 이유 | 컴포넌트별 스코프 CSS로 스타일 충돌 방지 |
| 장점 | 빌드 타임 처리 (런타임 오버헤드 없음), Vite 기본 지원 |
| 파일 구조 | 각 컴포넌트와 동일 디렉토리에 `.module.css` 파일 배치 |
| 네이밍 규칙 | camelCase 클래스명 (예: `styles.menuCard`) |

### 3.3 Axios (HTTP 클라이언트)

| 항목 | 설명 |
|------|------|
| 선택 이유 | 인터셉터로 공통 오류 처리, 세션 만료 자동 감지 구현 용이 |
| 인터셉터 활용 | 요청: Content-Type 헤더 자동 설정 / 응답: 401 세션 만료 자동 처리 |
| 타임아웃 | 전역 10초 타임아웃 설정 |
| 요청 취소 | AbortController 기반 요청 취소 (페이지 전환 시) |

### 3.4 React Router v6 (라우팅)

| 항목 | 설명 |
|------|------|
| 선택 이유 | React 생태계 표준, 풍부한 문서 및 커뮤니티 |
| 인증 가드 | ProtectedRoute 래퍼 컴포넌트로 인증 체크 |
| 코드 스플리팅 | React.lazy + Suspense로 페이지별 동적 import |
| 네비게이션 | useNavigate 훅 기반 프로그래매틱 네비게이션 |

### 3.5 react-i18next (국제화)

| 항목 | 설명 |
|------|------|
| 선택 이유 | React 생태계 표준 i18n 라이브러리, 확장 가능 구조 |
| 초기 언어 | 한국어 (ko) |
| 번역 파일 | `src/locales/ko.json` (JSON 네임스페이스 구조) |
| 사용 패턴 | useTranslation 훅으로 컴포넌트 내 텍스트 참조 |
| 날짜/통화 | Intl.NumberFormat, Intl.DateTimeFormat 활용 |

### 3.6 Vitest + React Testing Library (테스트)

| 항목 | 설명 |
|------|------|
| 선택 이유 | Vite 설정 공유, Jest 호환 API, 빠른 실행 |
| 단위 테스트 | Context 로직, 유틸리티 함수, 컴포넌트 렌더링 |
| 통합 테스트 | 페이지 간 네비게이션, 장바구니→주문 플로우 |
| DOM 환경 | jsdom (브라우저 환경 시뮬레이션) |
| 커버리지 | v8 기반 커버리지 리포트 |

---

## 4. 프로젝트 구조

```
customer-frontend/
+-- public/
|   +-- favicon.ico
+-- src/
|   +-- App.jsx
|   +-- main.jsx
|   +-- pages/
|   |   +-- TableSetupPage.jsx
|   |   +-- TableSetupPage.module.css
|   |   +-- MenuPage.jsx
|   |   +-- MenuPage.module.css
|   |   +-- CartPage.jsx
|   |   +-- CartPage.module.css
|   |   +-- OrderConfirmPage.jsx
|   |   +-- OrderConfirmPage.module.css
|   |   +-- OrderSuccessPage.jsx
|   |   +-- OrderSuccessPage.module.css
|   |   +-- OrderHistoryPage.jsx
|   |   +-- OrderHistoryPage.module.css
|   +-- components/
|   |   +-- MenuCard.jsx
|   |   +-- MenuCard.module.css
|   |   +-- CategoryNav.jsx
|   |   +-- CategoryNav.module.css
|   |   +-- CartBadge.jsx
|   |   +-- CartBadge.module.css
|   |   +-- CartItem.jsx
|   |   +-- CartItem.module.css
|   |   +-- ProtectedRoute.jsx
|   |   +-- Toast.jsx
|   |   +-- Toast.module.css
|   |   +-- Modal.jsx
|   |   +-- Modal.module.css
|   +-- contexts/
|   |   +-- AuthContext.jsx
|   |   +-- CartContext.jsx
|   |   +-- MenuContext.jsx
|   +-- services/
|   |   +-- api.js
|   +-- utils/
|   |   +-- storage.js
|   |   +-- format.js
|   +-- locales/
|   |   +-- ko.json
|   +-- styles/
|       +-- global.css
|       +-- variables.css
+-- tests/
|   +-- setup.js
|   +-- contexts/
|   |   +-- AuthContext.test.jsx
|   |   +-- CartContext.test.jsx
|   |   +-- MenuContext.test.jsx
|   +-- components/
|   |   +-- MenuCard.test.jsx
|   |   +-- CartItem.test.jsx
|   +-- pages/
|       +-- MenuPage.test.jsx
|       +-- CartPage.test.jsx
+-- index.html
+-- package.json
+-- vite.config.js
+-- vitest.config.js
+-- eslint.config.js
+-- .prettierrc
