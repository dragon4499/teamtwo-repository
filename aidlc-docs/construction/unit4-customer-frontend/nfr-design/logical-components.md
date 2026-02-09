# Logical Components - Unit 4: Customer Frontend

---

## 1. 컴포넌트 아키텍처 개요

```
Text Alternative:

Layer 1: App Shell
  - App.jsx (라우팅, Suspense, ErrorBoundary)
  - ProtectedRoute (인증 가드)

Layer 2: Context Providers
  - AuthProvider (인증 상태, 자동 로그인, 세션 관리)
  - CartProvider (장바구니 상태, localStorage 동기화)
  - MenuProvider (메뉴 데이터, 캐싱)

Layer 3: Pages (Code-Split)
  - TableSetupPage, MenuPage, CartPage
  - OrderConfirmPage, OrderSuccessPage, OrderHistoryPage

Layer 4: Shared Components
  - MenuCard, CategoryNav, CartBadge, CartItem
  - Modal, Toast, LoadingSpinner

Layer 5: Services & Utilities
  - api.js (Axios 인스턴스, 인터셉터)
  - storage.js (localStorage 래퍼)
  - format.js (통화/날짜 포맷팅)
  - i18n.js (국제화 초기화)

Layer 6: Styles & Assets
  - variables.css (디자인 토큰)
  - global.css (글로벌 리셋/기본 스타일)
  - *.module.css (컴포넌트별 스코프 CSS)
  - locales/ko.json (번역 파일)
```

---

## 2. App Shell 컴포넌트

### 2.1 App.jsx

| 항목 | 설명 |
|------|------|
| 역할 | 최상위 컴포넌트, Provider 트리 구성, 라우팅 정의 |
| 패턴 | ErrorBoundary > Providers > Suspense > Routes |
| 코드 스플리팅 | React.lazy로 6개 페이지 동적 import |

```
컴포넌트 트리:
  <ErrorBoundary>
    <I18nextProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MenuProvider>
              <AppLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/setup" element={<TableSetupPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<MenuPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/order/confirm" element={<OrderConfirmPage />} />
                      <Route path="/order/success" element={<OrderSuccessPage />} />
                      <Route path="/orders" element={<OrderHistoryPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </AppLayout>
            </MenuProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  </ErrorBoundary>
```

### 2.2 AppLayout

| 항목 | 설명 |
|------|------|
| 역할 | 공통 레이아웃 (Header 탭 + 하단 CartBar) |
| 조건부 렌더링 | 인증 완료 시에만 Header/CartBar 표시 |
| HTML 구조 | `<div>` > `<header>` + `<main>` + `<footer>` |

### 2.3 ProtectedRoute

| 항목 | 설명 |
|------|------|
| 역할 | 인증되지 않은 사용자를 /setup으로 리다이렉트 |
| 패턴 | AuthContext의 isAuthenticated 확인 |
| 구현 | `<Navigate to="/setup" replace />` 또는 `<Outlet />` |

### 2.4 ErrorBoundary

| 항목 | 설명 |
|------|------|
| 역할 | 예기치 않은 렌더링 오류 포착 |
| 폴백 UI | 오류 메시지 + 새로고침 버튼 |
| 로깅 | console.error로 오류 정보 기록 |

---

## 3. Context Provider 컴포넌트

### 3.1 AuthProvider

| 항목 | 설명 |
|------|------|
| 상태 | isAuthenticated, isSetupComplete, storeId, tableNumber, sessionId, expiresAt |
| 패턴 | useReducer + useEffect (자동 로그인, 세션 만료 감지) |
| localStorage 연동 | 설정 정보 저장/복원 (storage.js 활용) |
| 세션 갱신 | setInterval 60초마다 만료 체크, 15분 전 자동 재인증 |
| 제공 값 | state + dispatch + setupTable() + logout() |

### 3.2 CartProvider

| 항목 | 설명 |
|------|------|
| 상태 | items, totalAmount, totalCount |
| 패턴 | useReducer + useEffect (localStorage 동기화) |
| localStorage 키 | `cart_{storeId}_{tableNumber}` |
| 동기화 시점 | 모든 dispatch 후 useEffect에서 자동 저장 |
| 제공 값 | state + addItem() + updateQuantity() + removeItem() + clearCart() |

### 3.3 MenuProvider

| 항목 | 설명 |
|------|------|
| 상태 | menus, categories, isLoading, error, lastFetched |
| 패턴 | useReducer + fetchMenus() 메서드 |
| 캐싱 | lastFetched 기반 5분 캐시 |
| 제공 값 | state + fetchMenus() + getFilteredMenus() |

---

## 4. Shared UI 컴포넌트

### 4.1 Modal

| 항목 | 설명 |
|------|------|
| Props | isOpen, title, message, onClose, onRetry, retryable |
| HTML | `<div role="dialog" aria-modal="true">` |
| 스타일 | 배경 딤 (--color-overlay), 중앙 정렬 |
| 닫기 | 버튼 클릭으로만 (배경 클릭 비활성) |
| Z-index | --z-modal (950), --z-modal-overlay (900) |

### 4.2 Toast

| 항목 | 설명 |
|------|------|
| Props | message, type (success/warning/error), duration (기본 3000ms) |
| HTML | `<div role="alert" aria-live="assertive">` |
| 위치 | 화면 상단 중앙 (position: fixed) |
| 자동 사라짐 | setTimeout으로 duration 후 제거 |
| 중복 방지 | 동일 메시지 토스트 중복 표시 방지 로직 |
| Z-index | --z-toast (1000) |

### 4.3 LoadingSpinner

| 항목 | 설명 |
|------|------|
| 역할 | Suspense fallback, 데이터 로딩 중 표시 |
| 스타일 | CSS 애니메이션 기반 스피너 |
| 접근성 | aria-label="로딩 중" |

---

## 5. Services 컴포넌트

### 5.1 api.js (Axios 인스턴스)

| 항목 | 설명 |
|------|------|
| 역할 | Axios 인스턴스 생성, 인터셉터 설정, API 메서드 제공 |
| baseURL | `http://localhost:8000` |
| 타임아웃 | 10초 (전역) |
| 요청 인터셉터 | Content-Type: application/json 자동 설정 |
| 응답 인터셉터 | 401 자동 재인증 (Transparent Token Refresh 패턴) |
| 오류 매핑 | HTTP 상태 코드 → ErrorInfo 객체 변환 |

```
내부 구조:
  - createApiInstance(): Axios 인스턴스 생성 + 인터셉터 등록
  - setupInterceptors(instance, authCallbacks): 인터셉터 설정
    - authCallbacks: { getCredentials, updateSession, triggerLogout }
  - API 메서드: authenticateTable, getMenus, createOrder, getOrdersBySession, getOrder
  - mapHttpError(status, body): HTTP 오류 → ErrorInfo 변환
```

### 5.2 storage.js (localStorage 래퍼)

| 항목 | 설명 |
|------|------|
| 역할 | localStorage 안전 접근 래퍼 |
| 메서드 | safeSetItem, safeGetItem, safeRemoveItem |
| 오류 처리 | try-catch로 QuotaExceededError 등 graceful 처리 |
| 반환값 | safeSetItem → boolean (성공/실패), safeGetItem → parsed value 또는 null |

### 5.3 format.js (포맷팅 유틸리티)

| 항목 | 설명 |
|------|------|
| formatCurrency(amount) | Intl.NumberFormat 기반 원화 포맷 (예: "₩9,000") |
| formatDateTime(isoString) | Intl.DateTimeFormat 기반 한국어 날짜/시간 포맷 |
| formatCountdown(seconds) | 카운트다운 표시 문자열 생성 |

### 5.4 i18n.js (국제화 초기화)

| 항목 | 설명 |
|------|------|
| 역할 | i18next 초기화, 언어 감지, 번역 리소스 로드 |
| 기본 언어 | ko (한국어) |
| 감지 | i18next-browser-languagedetector |
| 번역 파일 | src/locales/ko.json (인라인 번들) |

---

## 6. Styles 구조

### 6.1 styles/variables.css

| 항목 | 설명 |
|------|------|
| 역할 | CSS Custom Properties 디자인 토큰 중앙 정의 |
| 범위 | 색상, 간격, 폰트, 터치 타겟, 그림자, 둥글기, 전환, Z-index |
| 사용 | 모든 .module.css에서 var() 참조 |

### 6.2 styles/global.css

| 항목 | 설명 |
|------|------|
| 역할 | CSS 리셋, 기본 스타일, 글로벌 타이포그래피 |
| 내용 | box-sizing: border-box, 기본 폰트, body 배경색 |
| import | main.jsx에서 최초 import |

### 6.3 *.module.css (컴포넌트별)

| 항목 | 설명 |
|------|------|
| 역할 | 컴포넌트 스코프 CSS |
| 네이밍 | camelCase (예: styles.menuCard, styles.priceText) |
| 토큰 참조 | var(--color-primary), var(--spacing-md) 등 |

---

## 7. 컴포넌트 의존성 매트릭스

| 컴포넌트 | 의존 대상 |
|----------|-----------|
| App.jsx | AuthProvider, CartProvider, MenuProvider, ProtectedRoute, ErrorBoundary, i18n |
| AppLayout | AuthContext, CartContext, Header, CartBar |
| ProtectedRoute | AuthContext, react-router-dom |
| TableSetupPage | AuthContext, api.js, storage.js, i18n |
| MenuPage | MenuContext, CartContext, MenuCard, CategoryNav, i18n |
| CartPage | CartContext, CartItem, Modal, i18n |
| OrderConfirmPage | CartContext, AuthContext, CartItem, Modal, api.js, i18n |
| OrderSuccessPage | react-router-dom, format.js, i18n |
| OrderHistoryPage | AuthContext, api.js, format.js, i18n |
| MenuCard | format.js, i18n |
| CartItem | format.js, i18n |
| CategoryNav | i18n |
| CartBadge | format.js, i18n |
| Modal | i18n |
| Toast | (독립) |
| api.js | axios, storage.js |
| storage.js | (독립) |
| format.js | (독립) |
| i18n.js | i18next, react-i18next, locales/ko.json |

