# Code Generation Plan - Unit 4: Customer Frontend

## Unit Context
- **Workspace Root**: `.` (현재 디렉토리)
- **Project Type**: Greenfield (Multi-unit, Microservices 구조)
- **Code Location**: `customer-frontend/`
- **Approach**: Standard (일반 방식)
- **Dependencies**: Unit 2 (Mock API - 포트 8000)

## Stories Implemented
- 고객 테이블 인증 및 자동 로그인
- 메뉴 카테고리 탐색 및 메뉴 카드 표시
- 장바구니 관리 (추가/삭제/수량조절/총액계산/localStorage 영속화)
- 주문 생성 및 확인 플로우
- 주문 성공 및 자동 리다이렉트
- 주문 내역 조회
- 오류 처리 및 사용자 피드백 (모달/토스트)
- 다국어 지원 준비 (react-i18next)

## Tech Stack
- Vite 5.x, React 18.x, React Router v6, Axios 1.x
- CSS Modules, react-i18next 14.x, Vitest + RTL
- Node.js 22 LTS, npm

---

## Plan Steps

### Step 1: 프로젝트 초기화 및 설정 파일 생성
- [x] `customer-frontend/package.json` 생성
- [x] `customer-frontend/index.html` 생성
- [x] `customer-frontend/vite.config.js` 생성
- [x] `customer-frontend/vitest.config.js` 생성
- [x] `customer-frontend/eslint.config.js` 생성
- [x] `customer-frontend/.prettierrc` 생성
- [x] `customer-frontend/.env.development` 생성
- [x] `customer-frontend/.env.production` 생성
- [x] `customer-frontend/.gitignore` 생성

### Step 2: 글로벌 스타일 및 디자인 토큰
- [x] `customer-frontend/src/styles/variables.css` 생성
- [x] `customer-frontend/src/styles/global.css` 생성

### Step 3: 유틸리티 및 서비스 레이어
- [x] `customer-frontend/src/utils/storage.js` 생성
- [x] `customer-frontend/src/utils/format.js` 생성
- [x] `customer-frontend/src/utils/validation.js` 생성
- [x] `customer-frontend/src/services/api.js` 생성

### Step 4: 국제화 설정
- [x] `customer-frontend/src/locales/ko.json` 생성
- [x] `customer-frontend/src/i18n.js` 생성

### Step 5: Context Providers
- [x] `customer-frontend/src/contexts/AuthContext.jsx` 생성
- [x] `customer-frontend/src/contexts/CartContext.jsx` 생성
- [x] `customer-frontend/src/contexts/MenuContext.jsx` 생성

### Step 6: 공통 UI 컴포넌트
- [x] `customer-frontend/src/components/ErrorBoundary.jsx` 생성
- [x] `customer-frontend/src/components/LoadingSpinner.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/Modal.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/Toast.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/ProtectedRoute.jsx` 생성

### Step 7: Shared 비즈니스 컴포넌트
- [x] `customer-frontend/src/components/MenuCard.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/CategoryNav.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/CartBadge.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/components/CartItem.jsx` + `.module.css` 생성

### Step 8: App Shell 및 레이아웃
- [x] `customer-frontend/src/components/AppLayout.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/App.jsx` 생성
- [x] `customer-frontend/src/main.jsx` 생성

### Step 9: 페이지 컴포넌트 (Part 1 - 인증/메뉴)
- [x] `customer-frontend/src/pages/TableSetupPage.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/pages/MenuPage.jsx` + `.module.css` 생성

### Step 10: 페이지 컴포넌트 (Part 2 - 장바구니/주문)
- [x] `customer-frontend/src/pages/CartPage.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/pages/OrderConfirmPage.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/pages/OrderSuccessPage.jsx` + `.module.css` 생성
- [x] `customer-frontend/src/pages/OrderHistoryPage.jsx` + `.module.css` 생성

### Step 11: 테스트 설정 및 유틸리티 테스트
- [x] `customer-frontend/tests/setup.js` 생성
- [x] `customer-frontend/tests/utils/format.test.js` 생성
- [x] `customer-frontend/tests/utils/storage.test.js` 생성
- [x] `customer-frontend/tests/utils/validation.test.js` 생성

### Step 12: Context 테스트
- [x] `customer-frontend/tests/contexts/AuthContext.test.jsx` 생성
- [x] `customer-frontend/tests/contexts/CartContext.test.jsx` 생성
- [x] `customer-frontend/tests/contexts/MenuContext.test.jsx` 생성

### Step 13: 컴포넌트 테스트
- [x] `customer-frontend/tests/components/MenuCard.test.jsx` 생성
- [x] `customer-frontend/tests/components/CartItem.test.jsx` 생성
- [x] `customer-frontend/tests/components/CategoryNav.test.jsx` 생성
- [x] `customer-frontend/tests/components/Modal.test.jsx` 생성
- [x] `customer-frontend/tests/components/Toast.test.jsx` 생성

### Step 14: 페이지 통합 테스트
- [x] `customer-frontend/tests/pages/MenuPage.test.jsx` 생성
- [x] `customer-frontend/tests/pages/CartPage.test.jsx` 생성
- [x] `customer-frontend/tests/pages/OrderConfirmPage.test.jsx` 생성

### Step 15: API 서비스 테스트
- [x] `customer-frontend/tests/services/api.test.js` 생성

### Step 16: 코드 요약 문서
- [x] `aidlc-docs/construction/unit4-customer-frontend/code/code-summary.md` 생성

---

## ✅ 모든 Step 완료
