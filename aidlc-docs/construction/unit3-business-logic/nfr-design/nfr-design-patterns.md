# NFR Design Patterns - Unit 3: Backend Business Logic

> Unit 1/2의 패턴을 계승하며, Unit 3 고유 패턴을 추가 정의합니다.

---

## 1. 인증 패턴

### 1.1 JWT Token Lifecycle Pattern (JWT 토큰 생명주기)

토큰 생성 → 검증 → 블랙리스트 관리의 전체 흐름입니다.

```
[로그인 요청]
      |
      v
[자격증명 검증 (bcrypt)]
      |
      v (성공)
[JWT 토큰 생성]
  payload: { sub, store_id, role, iat, exp }
  secret: JWT_SECRET_KEY
  algorithm: HS256
      |
      v
[토큰 반환] ──────────────────────────────────────┐
                                                    |
[API 요청 + Authorization: Bearer {token}]          |
      |                                             |
      v                                             |
[블랙리스트 확인] ── 존재 → [401 Unauthorized]       |
      |                                             |
      v (미존재)                                     |
[JWT 디코딩 + 만료 확인]                              |
      |              |                              |
      v (유효)        v (만료/무효)                    |
[요청 처리]     [401 Unauthorized]                   |
                                                    |
[로그아웃 요청] ────────────────────────────────────┘
      |
      v
[블랙리스트에 토큰 추가]
[만료 시간까지 보관]
```

### 1.2 In-Memory Blacklist Pattern (인메모리 블랙리스트)

로그아웃된 토큰을 인메모리 set으로 관리합니다.

```python
class TokenBlacklist:
    _blacklist: set[str]  # 토큰 문자열 set

    def add(self, token: str, expires_at: datetime) -> None
    def is_blacklisted(self, token: str) -> bool
    def cleanup_expired(self) -> None  # 만료된 토큰 제거
```

- MVP 단순화: 서버 재시작 시 블랙리스트 초기화 (허용)
- 주기적 cleanup은 선택적 (메모리 절약)

### 1.3 Dual Auth Strategy Pattern (이중 인증 전략)

관리자와 고객의 인증 방식을 분리합니다.

```
[요청]
  |
  ├── Admin 엔드포인트 → [JWT 토큰 검증] → AdminUser
  |
  ├── Customer 엔드포인트 → [세션 ID 검증] → TableSession
  |
  └── 공개 엔드포인트 → [인증 없음] → 통과
      (메뉴 조회, 테이블 인증, 관리자 로그인)
```

**FastAPI Depends 구현**:
```python
async def get_current_admin(authorization: str = Header()) -> AdminUser:
    # JWT 토큰 추출 및 검증

async def get_current_session(session_id: str) -> TableSession:
    # 세션 ID 검증
```

---

## 2. 비즈니스 로직 패턴

### 2.1 State Machine Pattern (상태 머신)

주문 상태 전이를 명시적 전이 테이블로 관리합니다.

```python
ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.PREPARING, OrderStatus.COMPLETED},
    OrderStatus.PREPARING: {OrderStatus.PENDING, OrderStatus.COMPLETED},
    OrderStatus.COMPLETED: set(),  # 최종 상태, 전이 불가
}

def validate_transition(current: OrderStatus, target: OrderStatus) -> bool:
    return target in ALLOWED_TRANSITIONS.get(current, set())
```

- 전이 규칙이 코드에 명시적으로 선언됨
- 새 상태 추가 시 테이블만 수정

### 2.2 Snapshot-on-Create Pattern (생성 시 스냅샷)

주문 생성 시 메뉴 정보를 복사하여 가격 변경 영향을 차단합니다.

```
[주문 생성 요청]
      |
      v
[MenuService.get_menu(menu_id)]
      |
      v
[OrderItem 생성]
  menu_id: 원본 참조
  menu_name: 복사 (스냅샷)
  price: 복사 (스냅샷)
  quantity: 요청값
  subtotal: price * quantity
```

- 이후 메뉴 가격이 변경되어도 기존 주문 금액 불변
- 메뉴 삭제(소프트)되어도 주문 데이터 보존

### 2.3 Sequential Number Generation Pattern (순차 번호 생성)

당일 주문 수 기반으로 주문 번호를 생성합니다.

```
[주문 생성]
      |
      v
[DataStore에서 당일 주문 조회]
      |
      v
[count + 1 → 순번]
      |
      v
[YYYYMMDD-{순번:05d}]
```

- 동시성: DataStore Lock이 순번 충돌 방지
- 날짜 변경 시 자동 리셋 (00001부터)

---

## 3. 이벤트 패턴

### 3.1 Fan-Out Event Pattern (팬아웃 이벤트)

하나의 이벤트를 모든 구독자에게 동시 전달합니다.

```
[Service] ── publish(event) ──> [EventBus]
                                     |
                          ┌──────────┼──────────┐
                          v          v          v
                    [Queue A]  [Queue B]  [Queue C]
                    (Admin 1)  (Admin 2)  (Admin 3)
                          |          |          |
                          v          v          v
                    [SSE Stream] [SSE Stream] [SSE Stream]
```

- 매장(store_id) 단위 격리
- 구독자별 독립 Queue
- Queue 가득 참 시 이벤트 드롭 (best-effort)

### 3.2 SSE Real Stream Pattern (SSE 실시간 스트림)

Mock 이벤트 대신 EventBus에서 실제 이벤트를 수신합니다.

```python
async def order_event_stream(store_id: str, request: Request):
    subscriber = await event_bus.subscribe(store_id, ["order_created", "order_status_changed", "order_deleted"])
    try:
        async for event in subscriber:
            if await request.is_disconnected():
                break
            yield {
                "event": event["type"],
                "data": json.dumps(event, ensure_ascii=False),
            }
    finally:
        await event_bus.unsubscribe(subscriber.id)
```

---

## 4. 서비스 계층 패턴

### 4.1 Constructor Injection Pattern (생성자 주입)

서비스 간 의존성을 생성자로 주입합니다.

```
DataStore (독립)
    |
    ├── AuthService(datastore)
    ├── MenuService(datastore)
    ├── EventBus() (독립)
    |       |
    ├── OrderService(datastore, event_bus, menu_service)
    └── TableService(datastore, order_service)
```

**FastAPI 통합**:
```python
# main.py 또는 dependencies.py
def get_datastore() -> DataStore: ...
def get_event_bus() -> EventBus: ...
def get_auth_service(ds=Depends(get_datastore)) -> AuthService: ...
def get_menu_service(ds=Depends(get_datastore)) -> MenuService: ...
def get_order_service(ds=Depends(get_datastore), eb=Depends(get_event_bus), ms=Depends(get_menu_service)) -> OrderService: ...
def get_table_service(ds=Depends(get_datastore), os=Depends(get_order_service)) -> TableService: ...
```

### 4.2 Mock-to-Real Replacement Pattern (Mock → 실제 교체)

Unit 2의 Mock 응답을 Unit 3의 실제 Service 호출로 교체합니다.

```
Unit 2 (Mock):
  @router.get("/menus")
  async def get_menus(store_id):
      return [{"id": "mock-001", ...}]  # 하드코딩

Unit 3 (Real):
  @router.get("/menus")
  async def get_menus(store_id, menu_svc=Depends(get_menu_service)):
      return await menu_svc.get_menus(store_id)  # 실제 로직
```

- 엔드포인트 URL/응답 형식은 동일 유지
- 내부 구현만 Service 호출로 교체
- 프론트엔드 코드 변경 불필요

---

## 5. 오류 처리 패턴 (Unit 2 확장)

### 5.1 Custom Exception Handler Pattern (커스텀 예외 핸들러)

비즈니스 예외를 HTTP 응답으로 매핑합니다.

```python
@app.exception_handler(NotFoundError)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.exception_handler(ValidationError)
async def validation_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.exception_handler(AuthenticationError)
async def auth_handler(request, exc):
    return JSONResponse(status_code=401, content={"detail": str(exc)})

@app.exception_handler(DuplicateError)
async def duplicate_handler(request, exc):
    return JSONResponse(status_code=409, content={"detail": str(exc)})
```

---

## 6. 테스트 패턴 (Unit 3 고유)

### 6.1 Service Unit Test Pattern (서비스 단위 테스트)

실제 DataStore(임시 디렉토리)를 사용한 서비스 테스트입니다.

```python
@pytest.fixture
async def services(tmp_path):
    ds = DataStore(base_path=str(tmp_path / "data"))
    eb = EventBus()
    auth = AuthService(datastore=ds)
    menu = MenuService(datastore=ds)
    order = OrderService(datastore=ds, event_bus=eb, menu_service=menu)
    table = TableService(datastore=ds, order_service=order)
    return {"ds": ds, "eb": eb, "auth": auth, "menu": menu, "order": order, "table": table}
```

- Mock 최소화: 실제 DataStore + 임시 디렉토리 사용
- 서비스 간 통합도 자연스럽게 테스트

### 6.2 Integration Flow Test Pattern (통합 플로우 테스트)

비즈니스 시나리오 전체를 테스트합니다.

```
주문 플로우:
  세션 시작 → 메뉴 조회 → 주문 생성 → 상태 변경 → SSE 이벤트 확인

세션 플로우:
  테이블 생성 → 세션 시작 → 주문 생성 → 세션 종료 → 이력 확인
```
