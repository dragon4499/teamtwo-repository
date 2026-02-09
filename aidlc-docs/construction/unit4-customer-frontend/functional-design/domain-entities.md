# Domain Entities - Unit 4: Customer Frontend

---

## 1. Page 컴포넌트 State/Props 정의

### 1.1 TableSetupPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| storeId | string | "" | 매장 식별자 입력값 |
| tableNumber | number \| null | null | 테이블 번호 입력값 |
| password | string | "" | 테이블 비밀번호 입력값 |
| isSubmitting | boolean | false | 설정 요청 중 여부 |
| error | string \| null | null | 오류 메시지 |

#### Props
없음 (최상위 페이지)

---

### 1.2 MenuPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| selectedCategory | string \| null | null | 현재 선택된 카테고리 (null = 전체) |

#### Props
없음 (최상위 페이지, Context에서 데이터 소비)

---

### 1.3 CartPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| showClearConfirm | boolean | false | 전체 비우기 확인 모달 표시 여부 |

#### Props
없음 (최상위 페이지, CartContext에서 데이터 소비)

---

### 1.4 OrderConfirmPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| isSubmitting | boolean | false | 주문 전송 중 여부 |
| error | ErrorInfo \| null | null | 주문 실패 오류 정보 |

#### Props
없음 (최상위 페이지, CartContext에서 데이터 소비)

---

### 1.5 OrderSuccessPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| countdown | number | 5 | 자동 리다이렉트 카운트다운 (초) |

#### Props (route params 또는 location state)
| 필드 | 타입 | 설명 |
|------|------|------|
| orderNumber | string | 생성된 주문 번호 |
| totalAmount | number | 주문 총액 |

---

### 1.6 OrderHistoryPage

#### State
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| orders | OrderResponse[] | [] | 세션 주문 목록 |
| selectedOrder | OrderResponse \| null | null | 선택된 주문 (상세 보기) |
| isLoading | boolean | false | 데이터 로딩 중 여부 |
| error | string \| null | null | 오류 메시지 |

#### Props
없음 (최상위 페이지)

---

## 2. Shared 컴포넌트 Props 정의

### 2.1 MenuCard

| Prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| menu | MenuResponse | ✓ | 메뉴 데이터 |
| quantity | number | ✓ | 현재 장바구니 내 수량 (0이면 미추가 상태) |
| onQuantityChange | (menuId: string, quantity: number) => void | ✓ | 수량 변경 콜백 |
| disabled | boolean | ✗ | 비활성 상태 (품절 등) |

---

### 2.2 CategoryNav

| Prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| categories | string[] | ✓ | 카테고리 목록 |
| selectedCategory | string \| null | ✓ | 현재 선택된 카테고리 |
| onSelect | (category: string \| null) => void | ✓ | 카테고리 선택 콜백 |

---

### 2.3 CartBadge

| Prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| itemCount | number | ✓ | 장바구니 총 아이템 수 |
| totalAmount | number | ✓ | 장바구니 총액 |
| onClick | () => void | ✓ | 클릭 콜백 (장바구니 페이지 이동) |

---

### 2.4 CartItem

| Prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| item | CartItemData | ✓ | 장바구니 항목 데이터 |
| onQuantityChange | (menuId: string, quantity: number) => void | ✓ | 수량 변경 콜백 |
| onRemove | (menuId: string) => void | ✓ | 항목 삭제 콜백 |
| editable | boolean | ✗ | 수정 가능 여부 (기본 true) |

---

## 3. Context State 모델 정의

### 3.1 AuthContext State

| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| isAuthenticated | boolean | false | 인증 완료 여부 |
| isSetupComplete | boolean | false | 테이블 초기 설정 완료 여부 |
| storeId | string \| null | null | 매장 식별자 |
| tableNumber | number \| null | null | 테이블 번호 |
| sessionId | string \| null | null | 세션 ID |
| expiresAt | string \| null | null | 세션 만료 시각 (ISO 8601) |

#### AuthContext Actions
| Action | Payload | 설명 |
|--------|---------|------|
| SETUP_TABLE | { storeId, tableNumber, password } | 테이블 초기 설정 |
| LOGIN_SUCCESS | { sessionId, storeId, tableNumber, expiresAt } | 인증 성공 |
| LOGIN_FAILURE | { error } | 인증 실패 |
| LOGOUT | - | 로그아웃 (설정 초기화) |
| RESTORE_SESSION | { storeId, tableNumber, sessionId, expiresAt } | localStorage에서 세션 복원 |

---

### 3.2 CartContext State

| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| items | CartItemData[] | [] | 장바구니 항목 목록 |
| totalAmount | number | 0 | 총 금액 (자동 계산) |
| totalCount | number | 0 | 총 아이템 수 (자동 계산) |

#### CartItemData
| 필드 | 타입 | 설명 |
|------|------|------|
| menuId | string | 메뉴 ID |
| menuName | string | 메뉴명 |
| price | number | 단가 (원) |
| quantity | number | 수량 |
| subtotal | number | 소계 (price × quantity) |

#### CartContext Actions
| Action | Payload | 설명 |
|--------|---------|------|
| ADD_ITEM | { menuId, menuName, price, quantity } | 장바구니에 메뉴 추가 |
| UPDATE_QUANTITY | { menuId, quantity } | 수량 변경 (0이면 삭제) |
| REMOVE_ITEM | { menuId } | 항목 삭제 |
| CLEAR_CART | - | 장바구니 전체 비우기 |
| RESTORE_CART | { items } | localStorage에서 복원 |

---

### 3.3 MenuContext State

| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| menus | MenuResponse[] | [] | 전체 메뉴 목록 |
| categories | string[] | [] | 카테고리 목록 (중복 제거) |
| isLoading | boolean | false | 메뉴 로딩 중 여부 |
| error | string \| null | null | 오류 메시지 |
| lastFetched | number \| null | null | 마지막 조회 시각 (timestamp) |

#### MenuContext Actions
| Action | Payload | 설명 |
|--------|---------|------|
| FETCH_MENUS_START | - | 메뉴 로딩 시작 |
| FETCH_MENUS_SUCCESS | { menus } | 메뉴 로딩 성공 |
| FETCH_MENUS_FAILURE | { error } | 메뉴 로딩 실패 |

---

## 4. API 서비스 인터페이스 정의

### 4.1 API 서비스 메서드

```typescript
interface CustomerApiService {
  // 테이블 인증
  authenticateTable(
    storeId: string,
    tableNumber: number,
    password: string
  ): Promise<TableAuthResponse>;

  // 메뉴 조회
  getMenus(storeId: string): Promise<MenuResponse[]>;

  // 주문 생성
  createOrder(
    storeId: string,
    tableNumber: number,
    sessionId: string,
    items: OrderItemRequest[]
  ): Promise<OrderResponse>;

  // 세션별 주문 조회
  getOrdersBySession(
    storeId: string,
    sessionId: string
  ): Promise<OrderResponse[]>;

  // 주문 상세 조회
  getOrder(
    storeId: string,
    orderId: string
  ): Promise<OrderResponse>;
}
```

### 4.2 API 응답 타입 (Unit 2 DTO 재사용)

```typescript
// Unit 2 domain-entities.md에서 정의된 타입 그대로 사용
interface TableAuthResponse {
  session_id: string;
  table_number: number;
  store_id: string;
  expires_at: string;  // ISO 8601
}

interface MenuResponse {
  id: string;
  name: string;
  price: number;       // 원 단위 정수
  description: string;
  category: string;
  image_url: string;
  is_available: boolean;
}

interface OrderItemRequest {
  menu_id: string;
  quantity: number;
}

interface OrderResponse {
  id: string;
  order_number: string;
  table_number: number;
  session_id: string;
  items: OrderItemResponse[];
  total_amount: number;
  status: string;      // "pending" | "preparing" | "completed"
  created_at: string;  // ISO 8601
}

interface OrderItemResponse {
  menu_id: string;
  menu_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
```

---

## 5. 공통 타입 정의

### 5.1 ErrorInfo
| 필드 | 타입 | 설명 |
|------|------|------|
| type | "network" \| "server" \| "validation" \| "session" | 오류 유형 |
| message | string | 사용자 표시용 메시지 |
| retryable | boolean | 재시도 가능 여부 |

### 5.2 RouteConfig
| 경로 | 페이지 | 인증 필요 |
|------|--------|:---------:|
| `/setup` | TableSetupPage | ✗ |
| `/` | MenuPage | ✓ |
| `/cart` | CartPage | ✓ |
| `/order/confirm` | OrderConfirmPage | ✓ |
| `/order/success` | OrderSuccessPage | ✓ |
| `/orders` | OrderHistoryPage | ✓ |
