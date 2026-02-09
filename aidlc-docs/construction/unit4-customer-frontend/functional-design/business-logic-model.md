# Business Logic Model - Unit 4: Customer Frontend

---

## 1. AuthContext 상태 관리 로직

### 1.1 초기화 로직

```
앱 시작 시:
  1. localStorage에서 설정 정보 읽기 (storeId, tableNumber, password)
  2. 설정 정보 존재 여부 확인
     - 없음 → isSetupComplete=false, TableSetupPage 표시
     - 있음 → 자동 로그인 시도 (3단계)
  3. 자동 로그인:
     a. API 호출: POST /api/stores/{storeId}/tables/auth
        body: { table_number, password }
     b. 성공 → LOGIN_SUCCESS dispatch
        - sessionId, expiresAt 저장
        - isAuthenticated=true
        - MenuPage로 이동
     c. 실패 → LOGIN_FAILURE dispatch
        - localStorage 설정 정보 삭제
        - isSetupComplete=false
        - TableSetupPage 표시
```

### 1.2 테이블 설정 로직 (SETUP_TABLE)

```
입력: storeId, tableNumber, password
처리:
  1. 입력 검증
     - storeId: 비어있지 않은 문자열
     - tableNumber: 1 이상 정수
     - password: 비어있지 않은 문자열
  2. API 호출: POST /api/stores/{storeId}/tables/auth
     body: { table_number: tableNumber, password: password }
  3. 성공:
     - localStorage에 저장: { storeId, tableNumber, password }
     - AuthContext 업데이트:
       isSetupComplete=true, isAuthenticated=true,
       storeId, tableNumber, sessionId, expiresAt
     - MenuPage로 navigate
  4. 실패:
     - error 상태 업데이트
     - 입력값 유지 (사용자가 수정 가능)
```

### 1.3 세션 만료 감지 로직

```
주기적 확인 (setInterval, 60초마다):
  1. expiresAt과 현재 시각 비교
  2. 만료 15분 전 → 자동 재인증 시도
     - localStorage에서 password 읽기
     - API 호출로 새 세션 획득
     - 성공 → sessionId, expiresAt 갱신
     - 실패 → 모달 표시 "세션이 만료되었습니다"
  3. 이미 만료 → 모달 표시 후 TableSetupPage 이동
```

---

## 2. CartContext 장바구니 관리 로직

### 2.1 useReducer 로직

```
cartReducer(state, action):
  case ADD_ITEM:
    - 기존 항목 검색 (menuId 기준)
    - 존재 → quantity 증가
    - 미존재 → 새 항목 추가 { menuId, menuName, price, quantity }
    - subtotal 재계산: price × quantity
    - totalAmount, totalCount 재계산
    - localStorage 동기화

  case UPDATE_QUANTITY:
    - menuId로 항목 검색
    - quantity === 0 → 항목 제거
    - quantity > 0 → 수량 업데이트, subtotal 재계산
    - totalAmount, totalCount 재계산
    - localStorage 동기화

  case REMOVE_ITEM:
    - menuId로 항목 필터링 제거
    - totalAmount, totalCount 재계산
    - localStorage 동기화

  case CLEAR_CART:
    - items = [], totalAmount = 0, totalCount = 0
    - localStorage에서 장바구니 키 삭제

  case RESTORE_CART:
    - items = payload.items
    - 각 항목 subtotal 재계산
    - totalAmount, totalCount 재계산
```

### 2.2 localStorage 동기화 로직

```
저장 키: `cart_{storeId}_{tableNumber}`
저장 형식: JSON.stringify(items)

저장 시점: 모든 장바구니 변경 action 후
복원 시점: AuthContext 인증 완료 후

저장 실패 처리:
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch (e) {
    // QuotaExceededError 등
    토스트 경고: "장바구니 저장에 실패했습니다"
    // 메모리 상태는 유지, 기능 계속 동작
  }
```

---

## 3. MenuContext 메뉴 데이터 관리 로직

### 3.1 메뉴 로딩 로직

```
fetchMenus(storeId):
  1. FETCH_MENUS_START dispatch → isLoading=true
  2. API 호출: GET /api/stores/{storeId}/menus
  3. 성공:
     - menus = response data
     - categories = [...new Set(menus.map(m => m.category))]
     - lastFetched = Date.now()
     - FETCH_MENUS_SUCCESS dispatch
  4. 실패:
     - FETCH_MENUS_FAILURE dispatch
     - error = "메뉴를 불러오지 못했습니다"
```

### 3.2 카테고리 필터링 로직

```
getFilteredMenus(selectedCategory):
  - selectedCategory === null → 전체 메뉴 반환
  - selectedCategory !== null → menus.filter(m => m.category === selectedCategory)
```

---

## 4. API 서비스 호출 로직

### 4.1 API 기본 설정

```
BASE_URL = "http://localhost:8000"

공통 헤더:
  Content-Type: "application/json"

공통 오류 처리:
  - fetch 실패 (네트워크) → { type: "network", message: "네트워크 연결을 확인해주세요", retryable: true }
  - 401 응답 → { type: "session", message: "세션이 만료되었습니다", retryable: false }
  - 404 응답 → { type: "server", message: "요청한 리소스를 찾을 수 없습니다", retryable: false }
  - 422 응답 → { type: "validation", message: response.detail, retryable: false }
  - 500 응답 → { type: "server", message: "서버 오류가 발생했습니다", retryable: true }
```

### 4.2 엔드포인트별 호출 로직

```
authenticateTable(storeId, tableNumber, password):
  POST /api/stores/{storeId}/tables/auth
  body: { table_number: tableNumber, password: password }
  응답: TableAuthResponse

getMenus(storeId):
  GET /api/stores/{storeId}/menus
  응답: MenuResponse[]

createOrder(storeId, tableNumber, sessionId, items):
  POST /api/stores/{storeId}/tables/{tableNumber}/orders
  body: { session_id: sessionId, items: items }
  응답: OrderResponse

getOrdersBySession(storeId, sessionId):
  GET /api/stores/{storeId}/sessions/{sessionId}/orders
  응답: OrderResponse[]

getOrder(storeId, orderId):
  GET /api/stores/{storeId}/orders/{orderId}
  응답: OrderResponse
```

---

## 5. 페이지별 비즈니스 로직

### 5.1 TableSetupPage 로직

```
handleSubmit():
  1. 입력 검증
     - storeId 비어있음 → 인라인 오류 "매장 식별자를 입력해주세요"
     - tableNumber 비어있음/0 이하 → 인라인 오류 "올바른 테이블 번호를 입력해주세요"
     - password 비어있음 → 인라인 오류 "비밀번호를 입력해주세요"
  2. isSubmitting = true
  3. AuthContext.setupTable(storeId, tableNumber, password) 호출
  4. 성공 → MenuPage로 이동 (AuthContext 내부 처리)
  5. 실패 → error 표시, isSubmitting = false
```

### 5.2 MenuPage 로직

```
마운트 시:
  1. MenuContext에서 menus 확인
  2. menus 비어있거나 미로드 → fetchMenus(storeId) 호출
  3. CartContext에서 현재 장바구니 상태 로드

카테고리 선택:
  1. selectedCategory 업데이트
  2. getFilteredMenus(selectedCategory)로 표시 메뉴 필터링

수량 변경 (메뉴 카드에서):
  1. quantity > 0 → CartContext.addItem 또는 updateQuantity
  2. quantity === 0 → CartContext.removeItem
  3. 하단 장바구니 바 자동 업데이트 (CartContext 구독)
```

### 5.3 CartPage 로직

```
마운트 시:
  1. CartContext에서 items, totalAmount, totalCount 로드
  2. items 비어있으면 빈 장바구니 안내 표시

수량 변경:
  1. CartContext.updateQuantity(menuId, newQuantity) 호출
  2. newQuantity === 0 → 항목 자동 제거

항목 삭제:
  1. CartContext.removeItem(menuId) 호출

전체 비우기:
  1. showClearConfirm = true (확인 모달 표시)
  2. 확인 → CartContext.clearCart() 호출
  3. 취소 → showClearConfirm = false

주문하기:
  1. items.length === 0 → 버튼 비활성화
  2. items.length > 0 → OrderConfirmPage로 navigate
```

### 5.4 OrderConfirmPage 로직

```
마운트 시:
  1. CartContext에서 items, totalAmount 로드
  2. items 비어있으면 MenuPage로 리다이렉트
  3. AuthContext에서 tableNumber 로드

수량 수정:
  1. CartContext.updateQuantity(menuId, newQuantity) 호출
  2. 수량 0 → 항목 제거
  3. 모든 항목 제거 시 → MenuPage로 리다이렉트

항목 삭제:
  1. CartContext.removeItem(menuId) 호출
  2. 마지막 항목 삭제 시 → MenuPage로 리다이렉트

주문 확정:
  1. isSubmitting = true, 버튼 비활성화
  2. items → OrderItemRequest[] 변환
     items.map(item => ({ menu_id: item.menuId, quantity: item.quantity }))
  3. API 호출: createOrder(storeId, tableNumber, sessionId, orderItems)
  4. 성공:
     - CartContext.clearCart()
     - navigate("/order/success", { state: { orderNumber, totalAmount } })
  5. 실패:
     - isSubmitting = false
     - error = ErrorInfo 설정 → 모달 표시
     - 장바구니 데이터 유지
```

### 5.5 OrderSuccessPage 로직

```
마운트 시:
  1. route state에서 orderNumber, totalAmount 읽기
  2. 데이터 없으면 MenuPage로 리다이렉트
  3. countdown = 5, setInterval 시작 (1초마다 감소)

카운트다운:
  1. 매 초 countdown -= 1
  2. countdown === 0 → navigate("/") (MenuPage)
  3. 컴포넌트 언마운트 시 interval 정리

표시:
  - "주문이 완료되었습니다!"
  - 주문 번호: {orderNumber}
  - 총 금액: {totalAmount}원
  - "{countdown}초 후 메뉴 화면으로 이동합니다"
```

### 5.6 OrderHistoryPage 로직

```
마운트 시:
  1. isLoading = true
  2. API 호출: getOrdersBySession(storeId, sessionId)
  3. 성공 → orders 업데이트, 최신순 정렬
  4. 실패 → error 표시

주문 선택:
  1. selectedOrder = 클릭된 주문
  2. 상세 정보 표시 (인라인 확장 또는 별도 뷰)

돌아가기:
  1. selectedOrder = null → 목록 뷰로 복귀
```

---

## 6. 예외 처리 및 오류 복구 로직

### 6.1 네트워크 오류 처리

```
모든 API 호출에 공통 적용:

try {
  const response = await fetch(url, options)
  if (!response.ok) {
    // HTTP 오류 처리
    throw new ApiError(response.status, await response.json())
  }
  return await response.json()
} catch (error) {
  if (error instanceof TypeError) {
    // 네트워크 오류 (fetch 실패)
    return { type: "network", message: "네트워크 연결을 확인해주세요", retryable: true }
  }
  if (error instanceof ApiError) {
    // HTTP 오류
    return mapHttpError(error.status, error.body)
  }
  // 알 수 없는 오류
  return { type: "server", message: "알 수 없는 오류가 발생했습니다", retryable: true }
}
```

### 6.2 HTTP 오류 매핑

```
mapHttpError(status, body):
  401 → { type: "session", message: "세션이 만료되었습니다", retryable: false }
  404 → { type: "server", message: "요청한 리소스를 찾을 수 없습니다", retryable: false }
  422 → { type: "validation", message: body.detail || "입력 데이터가 올바르지 않습니다", retryable: false }
  500 → { type: "server", message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요", retryable: true }
  기타 → { type: "server", message: "오류가 발생했습니다", retryable: true }
```

### 6.3 재시도 로직

```
주문 실패 재시도:
  - retryCount 추적 (초기값 0)
  - 재시도 클릭 시 retryCount += 1
  - retryCount >= 3 → 모달 메시지 변경: "매장 직원에게 문의해주세요"
  - 재시도 성공 시 retryCount 리셋
```

### 6.4 세션 만료 복구

```
API 호출에서 401 수신 시:
  1. 자동 재인증 시도 (localStorage의 설정 정보 사용)
  2. 재인증 성공 → 원래 API 호출 재시도
  3. 재인증 실패 → 모달 표시 "세션이 만료되었습니다" → TableSetupPage 이동
```
