# Unit 3: Backend Business Logic - 비즈니스 로직 모델

---

## 1. AuthService 비즈니스 로직

### 1.1 관리자 로그인 (`login_admin`)

```
입력: store_id, username, password
처리:
  1. DataStore에서 store_id로 매장 존재 확인
  2. DataStore에서 store_id + username으로 AdminUser 조회
  3. 미존재 시 → AuthenticationError
  4. bcrypt.checkpw(password, hashed_password) 검증
  5. 불일치 시 → AuthenticationError
  6. JWT 토큰 생성:
     - payload: { sub: admin_id, store_id, role: "admin", exp: now + 24h }
     - secret: 환경변수 JWT_SECRET_KEY
  7. AuthToken 반환: { token, user: { id, username, role } }
출력: AuthToken
```

- 로그인 시도 제한: MVP에서는 생략 (제한 없음)

### 1.2 관리자 로그아웃 (`logout_admin`)

```
입력: token
처리:
  1. 토큰 디코딩 (검증 불필요, 로그아웃이므로)
  2. 블랙리스트에 토큰 추가 (인메모리 set)
     - 만료 시간까지만 보관
출력: None
```

### 1.3 관리자 토큰 검증 (`verify_admin_token`)

```
입력: token
처리:
  1. 블랙리스트 확인 → 존재 시 AuthenticationError
  2. JWT 디코딩 (secret, algorithm="HS256")
  3. 만료 확인 → 만료 시 AuthenticationError
  4. payload에서 admin_id 추출
  5. DataStore에서 AdminUser 조회
출력: AdminUser 정보
```

### 1.4 테이블 인증 (`authenticate_table`)

```
입력: store_id, table_number, password
처리:
  1. DataStore에서 store_id로 매장 존재 확인
  2. DataStore에서 store_id + table_number로 Table 조회
  3. 미존재 시 → AuthenticationError
  4. bcrypt.checkpw(password, table.hashed_password) 검증
  5. 불일치 시 → AuthenticationError
  6. DataStore에서 해당 테이블의 활성 세션 조회
  7. 활성 세션 없으면 → AuthenticationError("세션이 시작되지 않았습니다")
  8. 세션 만료 확인 → 만료 시 AuthenticationError
출력: TableSession 정보 (session_id, table_number, store_id, expires_at)
```

### 1.5 테이블 세션 검증 (`verify_table_session`)

```
입력: session_id
처리:
  1. DataStore에서 session_id로 TableSession 조회
  2. 미존재 시 → AuthenticationError
  3. 세션 상태 확인 (active 여부)
  4. 만료 시간 확인 → 만료 시 AuthenticationError
출력: TableSession 정보
```

---

## 2. MenuService 비즈니스 로직

### 2.1 메뉴 목록 조회 (`get_menus`)

```
입력: store_id
처리:
  1. DataStore에서 store_id의 전체 메뉴 읽기
  2. sort_order 기준 정렬
출력: list[Menu]
```

### 2.2 카테고리별 메뉴 조회 (`get_menus_by_category`)

```
입력: store_id, category
처리:
  1. DataStore에서 store_id의 전체 메뉴 읽기
  2. category 필터링
  3. sort_order 기준 정렬
출력: list[Menu]
```

### 2.3 단일 메뉴 조회 (`get_menu`)

```
입력: store_id, menu_id
처리:
  1. DataStore에서 find_by_id(menus, store_id, menu_id)
  2. 미존재 시 → NotFoundError
출력: Menu
```

### 2.4 메뉴 등록 (`create_menu`)

```
입력: store_id, MenuCreate(name, price, description, category, image_url, is_available, sort_order)
처리:
  1. 데이터 검증:
     - name: 필수, 1~100자
     - price: 필수, 0 이상 정수
     - category: 필수, 빈 문자열 불가
  2. menu_id 생성 (UUID v4)
  3. created_at, updated_at = now()
  4. DataStore에 append
출력: Menu
```

### 2.5 메뉴 수정 (`update_menu`)

```
입력: store_id, menu_id, MenuUpdate(부분 업데이트)
처리:
  1. DataStore에서 기존 메뉴 조회
  2. 미존재 시 → NotFoundError
  3. 제공된 필드만 업데이트
  4. updated_at = now()
  5. DataStore에 update
출력: Menu (업데이트된)
```

### 2.6 메뉴 삭제 (`delete_menu`)

```
입력: store_id, menu_id
처리:
  1. DataStore에서 기존 메뉴 조회
  2. 미존재 시 → NotFoundError
  3. 소프트 삭제: is_available = false, updated_at = now()
  4. DataStore에 update
출력: None
```

- 소프트 삭제 방식: 활성 주문에 포함된 메뉴 데이터 보존

---

## 3. OrderService 비즈니스 로직

### 3.1 주문 생성 (`create_order`)

```
입력: store_id, table_number, session_id, items: list[{menu_id, quantity}]
처리:
  1. 세션 유효성 검증 (AuthService.verify_table_session)
  2. items 검증:
     - 빈 목록 불가 → ValidationError
     - 각 item의 menu_id로 MenuService.get_menu 조회
     - 메뉴 미존재 시 → NotFoundError
     - is_available == false 시 → ValidationError
     - quantity > 0 검증
  3. 주문 번호 생성:
     - 형식: YYYYMMDD-NNNNN
     - DataStore에서 당일 주문 수 조회 → 순번 계산
  4. OrderItem 구성:
     - menu_id, menu_name, price (메뉴에서 복사), quantity, subtotal
  5. total_amount 계산: sum(item.subtotal)
  6. Order 생성:
     - id: UUID v4
     - order_number, table_number, session_id
     - items, total_amount
     - status: "pending"
     - created_at: now()
  7. DataStore에 append
  8. EventBus.publish({
       type: "order_created",
       store_id, order_id, order_number,
       table_number, status, total_amount, timestamp
     })
출력: Order
```

### 3.2 주문 상태 변경 (`update_order_status`)

```
입력: store_id, order_id, new_status
처리:
  1. DataStore에서 주문 조회
  2. 미존재 시 → NotFoundError
  3. 상태 전이 검증 (유연한 전이):
     허용되는 전이:
     - pending → preparing ✅
     - pending → completed ✅ (빠른 완료)
     - preparing → completed ✅
     - preparing → pending ✅ (되돌리기)
     불허:
     - completed → pending ❌
     - completed → preparing ❌
  4. 유효하지 않은 전이 → ValidationError
  5. status 업데이트, updated_at = now()
  6. DataStore에 update
  7. EventBus.publish({
       type: "order_status_changed",
       store_id, order_id, order_number,
       table_number, old_status, new_status, timestamp
     })
출력: Order (업데이트된)
```

### 3.3 주문 삭제 (`delete_order`)

```
입력: store_id, order_id
처리:
  1. DataStore에서 주문 조회
  2. 미존재 시 → NotFoundError
  3. DataStore에서 delete
  4. EventBus.publish({
       type: "order_deleted",
       store_id, order_id, order_number,
       table_number, timestamp
     })
출력: None
```

### 3.4 주문 조회 메서드

```
get_order(store_id, order_id):
  → DataStore.find_by_id → 미존재 시 NotFoundError

get_orders_by_session(store_id, session_id):
  → DataStore.read(orders) → session_id 필터링

get_orders_by_table(store_id, table_number):
  → DataStore.read(orders) → table_number 필터링
```

---

## 4. TableService 비즈니스 로직

### 4.1 테이블 등록 (`create_table`)

```
입력: store_id, table_number, password
처리:
  1. DataStore에서 동일 table_number 존재 확인
  2. 존재 시 → DuplicateError
  3. bcrypt.hashpw(password) → hashed_password
  4. Table 생성:
     - id: UUID v4
     - table_number, hashed_password
     - is_active: true
     - created_at: now()
  5. DataStore에 append
출력: Table (hashed_password 제외)
```

### 4.2 테이블 목록 조회 (`get_tables`)

```
입력: store_id
처리:
  1. DataStore에서 전체 테이블 읽기
  2. 각 테이블에 대해 활성 세션 정보 조회
  3. table_number 기준 정렬
출력: list[Table + current_session 정보]
```

### 4.3 세션 시작 (`start_session`)

```
입력: store_id, table_number
처리:
  1. DataStore에서 테이블 존재 확인
  2. 미존재 시 → NotFoundError
  3. 기존 활성 세션 확인
  4. 활성 세션 존재 시 → ValidationError("이미 활성 세션이 있습니다")
  5. TableSession 생성:
     - session_id: "T{table_number:02d}-{YYYYMMDDHHMMSS}"
     - table_number, store_id
     - started_at: now()
     - expires_at: now() + 16시간
     - status: "active"
  6. DataStore에 append
출력: TableSession
```

### 4.4 세션 종료 (`end_session`)

```
입력: store_id, table_number
처리:
  1. DataStore에서 해당 테이블의 활성 세션 조회
  2. 활성 세션 없으면 → ValidationError("활성 세션이 없습니다")
  3. 해당 세션의 주문들 조회 (OrderService.get_orders_by_session)
  4. 주문 이력(OrderHistory) 생성:
     - id: UUID v4
     - session_id, table_number
     - orders: 현재 주문 목록 (상태 그대로)
     - total_session_amount: sum(order.total_amount)
     - session_started_at, session_ended_at: now()
  5. DataStore에 OrderHistory append
  6. 현재 주문들 DataStore에서 삭제
  7. 세션 status = "ended", ended_at = now()
  8. DataStore에 세션 update
출력: None
```

- 활성 주문이 남아있어도 경고 없이 종료 (상태 그대로 이력 이동, 관리자 판단)

### 4.5 과거 주문 이력 조회 (`get_order_history`)

```
입력: store_id, table_number, date_from (optional), date_to (optional)
처리:
  1. DataStore에서 order_history 읽기
  2. table_number 필터링
  3. date_from/date_to 범위 필터링 (session_ended_at 기준)
  4. 최신순 정렬
출력: list[OrderHistory]
```

---

## 5. EventBus 비즈니스 로직

### 5.1 구현 방식

```
구조:
  - asyncio.Queue 기반 인메모리 이벤트 버스
  - 매장별(store_id) 구독자 관리
  - 구독자별 개별 Queue

속성:
  - _subscribers: dict[str, dict[str, asyncio.Queue]]
    - key: store_id
    - value: { subscriber_id: Queue }
```

### 5.2 이벤트 발행 (`publish`)

```
입력: event (type, store_id, data...)
처리:
  1. store_id로 구독자 목록 조회
  2. 각 구독자의 Queue에 event put (non-blocking)
  3. Queue가 가득 찬 경우 → 이벤트 드롭 (best-effort)
출력: None
```

### 5.3 이벤트 구독 (`subscribe`)

```
입력: store_id, event_types
처리:
  1. subscriber_id 생성 (UUID v4)
  2. asyncio.Queue 생성 (maxsize=100)
  3. _subscribers[store_id][subscriber_id] = queue
  4. AsyncGenerator로 queue에서 이벤트 yield
     - event_types 필터링 적용
출력: AsyncGenerator[Event]
```

### 5.4 구독 해제 (`unsubscribe`)

```
입력: subscriber_id
처리:
  1. 모든 store_id에서 subscriber_id 검색
  2. 해당 Queue 제거
출력: None
```

### 5.5 이벤트 타입 정의

```
order_created:
  { type, store_id, order_id, order_number, table_number, status, total_amount, timestamp }

order_status_changed:
  { type, store_id, order_id, order_number, table_number, old_status, new_status, timestamp }

order_deleted:
  { type, store_id, order_id, order_number, table_number, timestamp }
```

- 전달 보장: Best-effort (이벤트 유실 가능, SSE 재연결 시 최신 상태만 제공)
