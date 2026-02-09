# Unit 3: Backend Business Logic - 도메인 엔티티

---

## 1. 엔티티 관계도 (텍스트)

```
Store (1) ──── (N) AdminUser
  |
  ├── (N) Menu
  |
  ├── (N) Table ──── (N) TableSession ──── (N) Order ──── (N) OrderItem
  |                                    |
  |                                    └── (N) OrderHistory
  |
  └── (N) Event (인메모리, 비영속)
```

---

## 2. 엔티티 상세

### 2.1 Store (매장)
```python
class Store:
    id: str              # UUID v4
    name: str            # 매장명
    created_at: str      # ISO 8601
```
- Unit 1(DataStore)에서 이미 정의됨
- Unit 3에서는 읽기 전용으로 사용

### 2.2 AdminUser (관리자)
```python
class AdminUser:
    id: str              # UUID v4
    store_id: str        # 소속 매장
    username: str        # 로그인 ID
    hashed_password: str # bcrypt 해시
    role: str            # "admin"
    created_at: str      # ISO 8601
```

### 2.3 Menu (메뉴)
```python
class Menu:
    id: str              # UUID v4
    store_id: str        # 소속 매장
    name: str            # 메뉴명 (1~100자)
    price: int           # 가격 (0 이상)
    description: str     # 설명 (최대 500자)
    category: str        # 카테고리
    image_url: str       # 이미지 URL
    is_available: bool   # 판매 가능 여부 (소프트 삭제용)
    sort_order: int      # 정렬 순서
    created_at: str      # ISO 8601
    updated_at: str      # ISO 8601
```

### 2.4 Table (테이블)
```python
class Table:
    id: str              # UUID v4
    store_id: str        # 소속 매장
    table_number: int    # 테이블 번호 (매장 내 고유)
    hashed_password: str # bcrypt 해시
    is_active: bool      # 활성 상태
    created_at: str      # ISO 8601
```

### 2.5 TableSession (테이블 세션)
```python
class TableSession:
    session_id: str      # "T{NN}-{YYYYMMDDHHMMSS}"
    store_id: str        # 소속 매장
    table_number: int    # 테이블 번호
    started_at: str      # ISO 8601
    expires_at: str      # ISO 8601 (started_at + 16h)
    status: str          # "active" | "ended"
    ended_at: str | None # ISO 8601 (종료 시)
```

### 2.6 Order (주문)
```python
class Order:
    id: str              # UUID v4
    store_id: str        # 소속 매장
    order_number: str    # "YYYYMMDD-NNNNN"
    table_number: int    # 테이블 번호
    session_id: str      # 세션 ID
    items: list[OrderItem]
    total_amount: int    # 총 금액
    status: str          # "pending" | "preparing" | "completed"
    created_at: str      # ISO 8601
    updated_at: str | None
```

### 2.7 OrderItem (주문 항목)
```python
class OrderItem:
    menu_id: str         # 메뉴 ID
    menu_name: str       # 메뉴명 (주문 시점 복사)
    price: int           # 가격 (주문 시점 복사)
    quantity: int        # 수량 (1 이상)
    subtotal: int        # price × quantity
```

### 2.8 OrderHistory (주문 이력)
```python
class OrderHistory:
    id: str              # UUID v4
    store_id: str        # 소속 매장
    session_id: str      # 세션 ID
    table_number: int    # 테이블 번호
    orders: list[Order]  # 해당 세션의 주문 목록
    total_session_amount: int  # 세션 총 금액
    session_started_at: str    # ISO 8601
    session_ended_at: str      # ISO 8601
```

### 2.9 Event (이벤트 - 인메모리)
```python
class Event:
    type: str            # "order_created" | "order_status_changed" | "order_deleted"
    store_id: str        # 매장 ID
    data: dict           # 이벤트별 데이터
    timestamp: str       # ISO 8601
```

---

## 3. 상태 다이어그램

### 3.1 주문 상태 (OrderStatus)
```
+----------+     +------------+     +-----------+
| pending  |---->| preparing  |---->| completed |
+----------+     +------------+     +-----------+
     |                |
     |    +------+    |
     +--->|      |<---+
          +------+
      (양방향 전이)

pending → preparing     (조리 시작)
pending → completed     (빠른 완료)
preparing → completed   (조리 완료)
preparing → pending     (되돌리기)
completed → X           (최종 상태, 변경 불가)
```

### 3.2 세션 상태 (SessionStatus)
```
+--------+     +-------+
| active |---->| ended |
+--------+     +-------+

active → ended  (관리자 수동 종료 또는 만료)
ended → X       (최종 상태)
```
