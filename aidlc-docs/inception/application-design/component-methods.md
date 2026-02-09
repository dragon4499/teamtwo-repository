# 테이블오더 시스템 - 컴포넌트 메서드 정의

> **참고**: 상세 비즈니스 규칙은 Functional Design (CONSTRUCTION 단계)에서 정의됩니다.
> 이 문서는 메서드 시그니처와 고수준 목적만 정의합니다.

---

## 1. Backend - Service Layer Methods

### 1.1 AuthService

```python
class AuthService:
    async def login_admin(
        store_id: str, username: str, password: str
    ) -> AuthToken
    # 관리자 로그인, JWT 토큰 반환

    async def logout_admin(token: str) -> None
    # 관리자 로그아웃, 토큰 무효화

    async def verify_admin_token(token: str) -> AdminUser
    # JWT 토큰 검증, 관리자 정보 반환

    async def authenticate_table(
        store_id: str, table_number: int, password: str
    ) -> TableSession
    # 테이블 인증, 세션 정보 반환

    async def verify_table_session(session_id: str) -> TableSession
    # 테이블 세션 유효성 검증
```

### 1.2 MenuService

```python
class MenuService:
    async def get_menus(store_id: str) -> list[Menu]
    # 매장의 전체 메뉴 목록 조회

    async def get_menus_by_category(
        store_id: str, category: str
    ) -> list[Menu]
    # 카테고리별 메뉴 조회

    async def get_menu(store_id: str, menu_id: str) -> Menu
    # 단일 메뉴 상세 조회

    async def create_menu(store_id: str, data: MenuCreate) -> Menu
    # 새 메뉴 등록

    async def update_menu(
        store_id: str, menu_id: str, data: MenuUpdate
    ) -> Menu
    # 메뉴 정보 수정

    async def delete_menu(store_id: str, menu_id: str) -> None
    # 메뉴 삭제
```

### 1.3 OrderService

```python
class OrderService:
    async def create_order(
        store_id: str, table_number: int,
        session_id: str, items: list[OrderItem]
    ) -> Order
    # 새 주문 생성, 이벤트 발행

    async def get_order(store_id: str, order_id: str) -> Order
    # 단일 주문 조회

    async def get_orders_by_session(
        store_id: str, session_id: str
    ) -> list[Order]
    # 세션별 주문 목록 조회

    async def get_orders_by_table(
        store_id: str, table_number: int
    ) -> list[Order]
    # 테이블별 현재 주문 목록 조회

    async def update_order_status(
        store_id: str, order_id: str, status: OrderStatus
    ) -> Order
    # 주문 상태 변경, 이벤트 발행

    async def delete_order(store_id: str, order_id: str) -> None
    # 주문 삭제 (관리자), 이벤트 발행
```

### 1.4 TableService

```python
class TableService:
    async def create_table(
        store_id: str, table_number: int, password: str
    ) -> Table
    # 새 테이블 등록

    async def get_tables(store_id: str) -> list[Table]
    # 매장의 전체 테이블 목록 조회

    async def start_session(
        store_id: str, table_number: int
    ) -> TableSession
    # 테이블 세션 시작 (16시간)

    async def end_session(
        store_id: str, table_number: int
    ) -> None
    # 테이블 세션 종료, 주문 이력 이동

    async def get_order_history(
        store_id: str, table_number: int,
        date_from: str | None, date_to: str | None
    ) -> list[OrderHistory]
    # 테이블 과거 주문 이력 조회
```

### 1.5 EventBus

```python
class EventBus:
    async def publish(event: Event) -> None
    # 이벤트 발행

    async def subscribe(
        store_id: str, event_types: list[str]
    ) -> AsyncGenerator[Event]
    # 이벤트 구독 (SSE 스트림용)

    async def unsubscribe(subscriber_id: str) -> None
    # 구독 해제
```

### 1.6 DataStore

```python
class DataStore:
    async def read(entity: str, store_id: str) -> list[dict]
    # 엔티티 데이터 읽기

    async def write(entity: str, store_id: str, data: list[dict]) -> None
    # 엔티티 데이터 쓰기

    async def find_by_id(
        entity: str, store_id: str, id: str
    ) -> dict | None
    # ID로 단일 레코드 조회

    async def append(entity: str, store_id: str, record: dict) -> None
    # 레코드 추가

    async def update(
        entity: str, store_id: str, id: str, data: dict
    ) -> dict
    # 레코드 업데이트

    async def delete(entity: str, store_id: str, id: str) -> None
    # 레코드 삭제
```

---

## 2. Backend - API Layer Methods (Router Endpoints)

### 2.1 CustomerRouter

```
POST   /api/stores/{store_id}/tables/auth          # 테이블 인증
GET    /api/stores/{store_id}/menus                 # 메뉴 목록 조회
GET    /api/stores/{store_id}/menus?category={cat}  # 카테고리별 메뉴
POST   /api/stores/{store_id}/tables/{table_num}/orders  # 주문 생성
GET    /api/stores/{store_id}/sessions/{session_id}/orders  # 세션별 주문 조회
GET    /api/stores/{store_id}/orders/{order_id}     # 주문 상세 조회
```

### 2.2 AdminRouter

```
POST   /api/stores/{store_id}/admin/login           # 관리자 로그인
POST   /api/stores/{store_id}/admin/logout          # 관리자 로그아웃
GET    /api/stores/{store_id}/admin/tables           # 테이블 목록
POST   /api/stores/{store_id}/admin/tables           # 테이블 생성
POST   /api/stores/{store_id}/admin/tables/{table_num}/session/start  # 세션 시작
POST   /api/stores/{store_id}/admin/tables/{table_num}/session/end    # 세션 종료
GET    /api/stores/{store_id}/admin/tables/{table_num}/orders         # 테이블 주문
GET    /api/stores/{store_id}/admin/tables/{table_num}/history        # 과거 이력
PATCH  /api/stores/{store_id}/admin/orders/{order_id}/status          # 주문 상태 변경
DELETE /api/stores/{store_id}/admin/orders/{order_id}                 # 주문 삭제
GET    /api/stores/{store_id}/admin/menus            # 메뉴 목록 (관리자)
POST   /api/stores/{store_id}/admin/menus            # 메뉴 등록
PUT    /api/stores/{store_id}/admin/menus/{menu_id}  # 메뉴 수정
DELETE /api/stores/{store_id}/admin/menus/{menu_id}  # 메뉴 삭제
```

### 2.3 SSERouter

```
GET    /api/stores/{store_id}/events/orders          # 주문 실시간 스트림 (SSE)
```

---

## 3. Data Models (High-Level)

```python
# 상세 필드 정의는 Functional Design에서 수행

class Store:       # 매장 정보
class AdminUser:   # 관리자 계정
class Menu:        # 메뉴 항목
class Table:       # 테이블 정보
class TableSession:# 테이블 세션
class Order:       # 주문
class OrderItem:   # 주문 항목
class OrderHistory:# 과거 주문 이력
class AuthToken:   # 인증 토큰
class Event:       # 이벤트 (SSE용)

class OrderStatus(Enum):
    PENDING = "pending"       # 대기중
    PREPARING = "preparing"   # 준비중
    COMPLETED = "completed"   # 완료
```
