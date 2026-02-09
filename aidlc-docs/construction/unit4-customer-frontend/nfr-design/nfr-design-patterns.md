# NFR Design Patterns - Unit 4: Customer Frontend

---

## 1. 성능 패턴 (Performance Patterns)

### 1.1 Page-Level Code Splitting

페이지 단위 동적 import로 초기 번들 크기를 최소화합니다.

| 항목 | 설명 |
|------|------|
| 패턴 | React.lazy + Suspense |
| 적용 범위 | 6개 페이지 컴포넌트 전체 |
| 폴백 UI | 로딩 스피너 (Suspense fallback) |
| 목표 | 메인 번들 200KB 이하 (gzip), 초기 로드 2초 이내 |

```
구현 구조:
  App.jsx에서 각 페이지를 React.lazy로 동적 import
  
  const TableSetupPage = React.lazy(() => import('./pages/TableSetupPage'))
  const MenuPage = React.lazy(() => import('./pages/MenuPage'))
  const CartPage = React.lazy(() => import('./pages/CartPage'))
  const OrderConfirmPage = React.lazy(() => import('./pages/OrderConfirmPage'))
  const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage'))
  const OrderHistoryPage = React.lazy(() => import('./pages/OrderHistoryPage'))

  <Suspense fallback={<LoadingSpinner />}>
    <Routes>...</Routes>
  </Suspense>
```

### 1.2 Memoization Strategy

주요 컴포넌트와 계산 결과를 메모이제이션하여 불필요한 리렌더링을 방지합니다.

| 항목 | 적용 대상 | 패턴 |
|------|-----------|------|
| React.memo | MenuCard, CartItem, CategoryNav, CartBadge | Props 변경 시에만 리렌더링 |
| useMemo | 카테고리 필터링 결과, 장바구니 총액 계산 | 의존성 변경 시에만 재계산 |
| useCallback | onQuantityChange, onRemove, onSelect 콜백 | Context 디스패치 래핑 |

```
적용 원칙:
  1. Shared 컴포넌트 (MenuCard, CartItem 등): React.memo 적용
  2. 파생 데이터 계산: useMemo 적용
     - getFilteredMenus(menus, selectedCategory)
     - totalAmount, totalCount 계산
  3. 이벤트 핸들러: useCallback 적용
     - Context dispatch를 래핑하는 콜백 함수
  4. 페이지 컴포넌트: React.memo 미적용 (최상위 라우트)
```

### 1.3 Menu Data Caching

MenuContext의 lastFetched 기반 캐싱으로 불필요한 API 호출을 방지합니다.

```
캐싱 로직:
  const CACHE_DURATION = 5 * 60 * 1000  // 5분

  fetchMenus(storeId):
    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION):
      return  // 캐시 유효, API 호출 스킵
    else:
      API 호출 실행
      lastFetched = Date.now()
```

---

## 2. 신뢰성 패턴 (Reliability Patterns)

### 2.1 Transparent Token Refresh (Axios Interceptor)

Axios 응답 인터셉터에서 401 응답을 감지하고, 자동으로 재인증 후 원래 요청을 재시도합니다.

```
구현 로직:
  let isRefreshing = false
  let failedQueue = []

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry):
        if (isRefreshing):
          // 이미 갱신 중이면 큐에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(() => axios(originalRequest))

        originalRequest._retry = true
        isRefreshing = true

        try:
          // localStorage에서 설정 정보로 재인증
          const { storeId, tableNumber, password } = getStoredCredentials()
          const response = await authenticateTable(storeId, tableNumber, password)
          
          // 새 세션 정보 업데이트
          updateSession(response.session_id, response.expires_at)
          
          // 큐에 대기 중인 요청 모두 재시도
          failedQueue.forEach(({ resolve }) => resolve())
          failedQueue = []
          
          return axios(originalRequest)
        catch:
          // 재인증 실패 → 큐 거부, 로그아웃 처리
          failedQueue.forEach(({ reject }) => reject(error))
          failedQueue = []
          triggerLogout()
          throw error
        finally:
          isRefreshing = false

      return Promise.reject(error)
  )
```

| 항목 | 설명 |
|------|------|
| 동시 요청 처리 | failedQueue로 동시 401 응답 시 단일 재인증 보장 |
| 재시도 방지 | _retry 플래그로 무한 루프 방지 |
| 실패 시 | 모든 대기 요청 거부, AuthContext 로그아웃 트리거 |

### 2.2 Error Boundary Pattern

React Error Boundary로 컴포넌트 트리의 예기치 않은 오류를 포착합니다.

```
구현 구조:
  App.jsx:
    <ErrorBoundary fallback={<ErrorFallbackPage />}>
      <AuthProvider>
        <CartProvider>
          <MenuProvider>
            <Router>...</Router>
          </MenuProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>

  ErrorFallbackPage:
    - "예기치 않은 오류가 발생했습니다" 메시지
    - "새로고침" 버튼 (window.location.reload)
    - 오류 정보 콘솔 로깅
```

### 2.3 Graceful localStorage Degradation

localStorage 접근 실패 시 메모리 상태를 유지하며 기능을 계속 제공합니다.

```
storage.js 유틸리티:
  safeSetItem(key, value):
    try:
      localStorage.setItem(key, JSON.stringify(value))
      return true
    catch (e):
      console.warn('localStorage 저장 실패:', e.message)
      return false  // 호출자에게 실패 알림

  safeGetItem(key):
    try:
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    catch (e):
      console.warn('localStorage 읽기 실패:', e.message)
      return null

  safeRemoveItem(key):
    try:
      localStorage.removeItem(key)
    catch (e):
      console.warn('localStorage 삭제 실패:', e.message)
```

### 2.4 Tiered Error Display

오류 심각도에 따라 모달 또는 토스트로 구분하여 표시합니다.

| 심각도 | UI 패턴 | 오류 유형 |
|--------|---------|-----------|
| Critical | 모달 (배경 딤, 버튼으로만 닫기) | 네트워크 오류, 서버 오류, 세션 만료, 주문 실패 |
| Warning | 토스트 (3초 자동 사라짐) | 메뉴 로딩 실패, 장바구니 저장 실패 |
| Info | 인라인 메시지 | 입력 검증 실패 |

---

## 3. 보안 패턴 (Security Patterns)

### 3.1 Minimal localStorage Exposure

localStorage에 저장하는 데이터를 최소화하고, 민감 정보는 메모리에만 보관합니다.

| 저장 위치 | 데이터 | 이유 |
|-----------|--------|------|
| localStorage | storeId, tableNumber, password | 자동 로그인용 (MVP) |
| localStorage | 장바구니 items | 브라우저 새로고침 시 유지 |
| 메모리 (Context) | sessionId, expiresAt | 세션 정보는 메모리에만 |

### 3.2 Input Sanitization Gateway

모든 사용자 입력을 API 전송 전에 검증합니다.

```
검증 함수 (utils/validation.js):
  validateStoreId(value):
    - typeof string && value.trim().length > 0

  validateTableNumber(value):
    - typeof number && Number.isInteger(value) && value >= 1

  validatePassword(value):
    - typeof string && value.length > 0

  validateQuantity(value):
    - typeof number && Number.isInteger(value) && value >= 1 && value <= 99
```

### 3.3 XSS Prevention

React 기본 이스케이핑을 활용하고, 위험한 패턴을 금지합니다.

| 규칙 | 설명 |
|------|------|
| dangerouslySetInnerHTML 금지 | ESLint 규칙으로 사용 차단 |
| 사용자 입력 직접 렌더링 금지 | JSX 표현식 내에서만 렌더링 (자동 이스케이핑) |
| URL 검증 | 외부 URL 사용 시 프로토콜 검증 (http/https만 허용) |

---

## 4. 사용성 패턴 (Usability Patterns)

### 4.1 CSS Design Token System

CSS Custom Properties로 디자인 토큰을 중앙 관리합니다.

```
styles/variables.css:
  :root {
    /* 색상 */
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-success: #16a34a;
    --color-warning: #f59e0b;
    --color-error: #dc2626;
    --color-text: #1f2937;
    --color-text-secondary: #6b7280;
    --color-background: #ffffff;
    --color-surface: #f9fafb;
    --color-border: #e5e7eb;
    --color-overlay: rgba(0, 0, 0, 0.5);

    /* 간격 */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* 폰트 */
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 24px;
    --font-size-2xl: 32px;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 700;

    /* 터치 타겟 */
    --touch-target-min: 44px;

    /* 반응형 */
    --tablet-min: 768px;
    --tablet-max: 1024px;

    /* 그림자 */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

    /* 둥글기 */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;

    /* 전환 */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;

    /* Z-index */
    --z-toast: 1000;
    --z-modal-overlay: 900;
    --z-modal: 950;
    --z-header: 100;
    --z-cart-bar: 100;
  }
```

### 4.2 Tablet-Optimized Layout

태블릿 전용 레이아웃 패턴을 적용합니다.

```
레이아웃 구조:
  +------------------------------------------+
  |  Header (상단 탭: 메뉴 | 주문내역)         |
  +--------+---------------------------------+
  |        |                                 |
  | 카테고리 |     메뉴 카드 그리드              |
  | 사이드바 |     (2~3열 반응형)               |
  |  (좌측) |                                 |
  |        |                                 |
  +--------+---------------------------------+
  |  CartBar (하단 고정: 수량, 총액, 버튼)      |
  +------------------------------------------+

CSS Grid/Flexbox 적용:
  - 전체 레이아웃: CSS Grid (header / sidebar+content / footer)
  - 메뉴 그리드: CSS Grid (auto-fill, minmax(200px, 1fr))
  - 사이드바: 고정 너비 120px, 세로 스크롤
  - 하단 바: position: fixed, bottom: 0
  - 터치 타겟: 최소 44px x 44px
```

### 4.3 Accessible Component Pattern

시맨틱 HTML과 기본 접근성을 모든 컴포넌트에 적용합니다.

| 컴포넌트 | HTML 요소 | 접근성 속성 |
|----------|-----------|-------------|
| Header | `<header>`, `<nav>` | role="navigation" |
| CategoryNav | `<nav>`, `<ul>`, `<li>`, `<button>` | aria-current="true" (선택된 카테고리) |
| MenuCard | `<article>`, `<button>` | aria-label="메뉴명 수량 조절" |
| CartBar | `<footer>` | aria-live="polite" (수량/총액 변경 알림) |
| Modal | `<dialog>` 또는 `<div role="dialog">` | aria-modal="true", aria-labelledby |
| Toast | `<div role="alert">` | aria-live="assertive" |
| 수량 버튼 | `<button>` | aria-label="수량 증가/감소" |

### 4.4 i18n Integration Pattern

react-i18next를 활용한 국제화 통합 패턴입니다.

```
초기화 (src/i18n.js):
  import i18n from 'i18next'
  import { initReactI18next } from 'react-i18next'
  import LanguageDetector from 'i18next-browser-languagedetector'
  import ko from './locales/ko.json'

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { ko: { translation: ko } },
      fallbackLng: 'ko',
      interpolation: { escapeValue: false }
    })

컴포넌트 사용:
  const { t } = useTranslation()
  <h1>{t('menu.title')}</h1>
  <p>{t('cart.total', { amount: formatCurrency(totalAmount) })}</p>

번역 파일 구조 (ko.json):
  {
    "common": { "retry": "재시도", "cancel": "취소", "confirm": "확인" },
    "auth": { "title": "테이블 설정", ... },
    "menu": { "title": "메뉴", "allCategories": "전체", ... },
    "cart": { "title": "장바구니", "empty": "장바구니가 비어있습니다", ... },
    "order": { "confirm": "주문 확정", "success": "주문이 완료되었습니다!", ... },
    "error": { "network": "네트워크 연결을 확인해주세요", ... }
  }

통화/날짜 포맷팅 (utils/format.js):
  formatCurrency(amount):
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency', currency: 'KRW'
    }).format(amount)

  formatDateTime(isoString):
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(isoString))
```

---

## 5. 유지보수성 패턴 (Maintainability Patterns)

### 5.1 Separated Test Directory

테스트 파일을 소스 코드와 분리하여 tests/ 디렉토리에 미러 구조로 배치합니다.

```
tests/
+-- setup.js                    # Vitest 글로벌 설정
+-- contexts/
|   +-- AuthContext.test.jsx    # AuthContext 단위 테스트
|   +-- CartContext.test.jsx    # CartContext 단위 테스트
|   +-- MenuContext.test.jsx    # MenuContext 단위 테스트
+-- components/
|   +-- MenuCard.test.jsx       # MenuCard 렌더링 테스트
|   +-- CartItem.test.jsx       # CartItem 렌더링 테스트
|   +-- CategoryNav.test.jsx    # CategoryNav 렌더링 테스트
|   +-- Modal.test.jsx          # Modal 렌더링 테스트
|   +-- Toast.test.jsx          # Toast 렌더링 테스트
+-- pages/
|   +-- MenuPage.test.jsx       # MenuPage 통합 테스트
|   +-- CartPage.test.jsx       # CartPage 통합 테스트
|   +-- OrderConfirmPage.test.jsx
+-- services/
|   +-- api.test.js             # API 서비스 테스트
+-- utils/
    +-- format.test.js          # 포맷팅 유틸리티 테스트
    +-- storage.test.js         # localStorage 유틸리티 테스트
```

### 5.2 Consistent Component Structure

모든 컴포넌트가 일관된 구조를 따릅니다.

```
컴포넌트 파일 구조:
  1. import 문 (React, 라이브러리, 컨텍스트, 유틸리티, 스타일 순)
  2. 컴포넌트 함수 정의
  3. PropTypes 또는 JSDoc 타입 주석
  4. export default

예시:
  // 1. Imports
  import { useState, useCallback } from 'react'
  import { useTranslation } from 'react-i18next'
  import { useCart } from '../contexts/CartContext'
  import { formatCurrency } from '../utils/format'
  import styles from './MenuCard.module.css'

  // 2. Component
  function MenuCard({ menu, quantity, onQuantityChange, disabled }) {
    const { t } = useTranslation()
    // ... 로직
    return (/* JSX */)
  }

  // 3. Export
  export default React.memo(MenuCard)
```

