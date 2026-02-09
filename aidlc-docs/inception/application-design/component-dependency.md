# 테이블오더 시스템 - 컴포넌트 의존성 및 통신 패턴

---

## 1. 의존성 매트릭스

### 1.1 Backend 컴포넌트 의존성

| 컴포넌트 | AuthService | MenuService | OrderService | TableService | EventBus | DataStore |
|----------|:-----------:|:-----------:|:------------:|:------------:|:--------:|:---------:|
| CustomerRouter | ● | ● | ● | - | - | - |
| AdminRouter | ● | ● | ● | ● | - | - |
| SSERouter | ● | - | - | - | ● | - |
| AuthService | - | - | - | - | - | ● |
| MenuService | - | - | - | - | - | ● |
| OrderService | - | ● | - | - | ● | ● |
| TableService | - | - | ● | - | - | ● |
| EventBus | - | - | - | - | - | - |
| DataStore | - | - | - | - | - | - |
| AuthMiddleware | ● | - | - | - | - | - |

● = 직접 의존

### 1.2 의존성 방향 규칙
- **Router → Service**: Router는 Service에만 의존
- **Service → DataStore**: Service는 DataStore에 의존
- **Service → EventBus**: 이벤트 발행이 필요한 Service만 EventBus에 의존
- **Service → Service**: OrderService ↔ MenuService (검증), TableService → OrderService (이력 이동)
- **DataStore, EventBus**: 다른 컴포넌트에 의존하지 않음 (독립적)

---

## 2. 통신 패턴

### 2.1 동기 통신 (Request-Response)

```
+----------------+    HTTP/REST    +----------------+
| Customer App   |<--------------->| FastAPI Server |
+----------------+                 +----------------+

+----------------+    HTTP/REST    +----------------+
| Admin App      |<--------------->| FastAPI Server |
+----------------+                 +----------------+
```

- **프로토콜**: HTTP/REST (JSON)
- **사용처**: 모든 CRUD 작업, 인증, 데이터 조회
- **특성**: 요청 후 응답 대기, 동기적 처리

### 2.2 비동기 통신 (Event-Driven)

```
+----------------+   publish    +----------------+   stream    +----------------+
| OrderService   |------------>| EventBus       |------------>| SSE Client     |
+----------------+             | (asyncio.Queue)|             | (Admin App)    |
                               +----------------+             +----------------+
```

- **프로토콜**: 인메모리 asyncio.Queue → SSE (HTTP)
- **사용처**: 주문 생성/변경/삭제 실시간 알림
- **특성**: 비동기, 단방향 (서버 → 클라이언트)

### 2.3 로컬 저장소 통신

```
+----------------+  localStorage  +----------------+
| Customer App   |<-------------->| Browser Storage|
| (Cart/Auth)    |                | (JSON)         |
+----------------+                +----------------+

+----------------+  localStorage  +----------------+
| Admin App      |<-------------->| Browser Storage|
| (JWT Token)    |                | (JSON)         |
+----------------+                +----------------+
```

- **프로토콜**: Web Storage API
- **사용처**: 장바구니 데이터, 테이블 인증 정보, JWT 토큰
- **특성**: 클라이언트 로컬, 영속적

---

## 3. 데이터 흐름

### 3.1 고객 주문 흐름

```
[Customer App]
     |
     | 1. POST /api/stores/{id}/tables/{num}/orders
     v
[CustomerRouter]
     |
     | 2. create_order(store_id, table_num, session_id, items)
     v
[OrderService]
     |
     | 3. get_menu(store_id, menu_id) -- 메뉴 검증
     v
[MenuService] --> [DataStore] (menus.json 읽기)
     |
     | 4. 주문 저장
     v
[DataStore] (orders.json 쓰기)
     |
     | 5. 이벤트 발행
     v
[EventBus]
     |
     | 6. SSE 스트림 전달
     v
[Admin App] (실시간 대시보드 업데이트)
```

### 3.2 관리자 주문 상태 변경 흐름

```
[Admin App]
     |
     | 1. PATCH /api/stores/{id}/admin/orders/{oid}/status
     v
[AdminRouter] --> [AuthMiddleware] (JWT 검증)
     |
     | 2. update_order_status(store_id, order_id, status)
     v
[OrderService]
     |
     | 3. 상태 업데이트
     v
[DataStore] (orders.json 업데이트)
     |
     | 4. 이벤트 발행
     v
[EventBus]
     |
     | 5. SSE 스트림 전달
     v
[Admin App] (다른 관리자 클라이언트 업데이트)
```

### 3.3 테이블 세션 종료 흐름

```
[Admin App]
     |
     | 1. POST /api/stores/{id}/admin/tables/{num}/session/end
     v
[AdminRouter] --> [AuthMiddleware]
     |
     | 2. end_session(store_id, table_num)
     v
[TableService]
     |
     | 3. get_orders_by_table(store_id, table_num)
     v
[OrderService] --> [DataStore] (orders.json 읽기)
     |
     | 4. 주문 이력 이동 + 세션 종료
     v
[DataStore] (order_history.json 쓰기, sessions.json 업데이트)
```

---

## 4. 프로젝트 디렉토리 구조

```
table-order/                          # 워크스페이스 루트
├── backend/                          # FastAPI 백엔드
│   ├── main.py                       # FastAPI 앱 진입점
│   ├── config.py                     # 설정
│   ├── routers/
│   │   ├── customer.py               # CustomerRouter
│   │   ├── admin.py                  # AdminRouter
│   │   └── sse.py                    # SSERouter
│   ├── services/
│   │   ├── auth_service.py           # AuthService
│   │   ├── menu_service.py           # MenuService
│   │   ├── order_service.py          # OrderService
│   │   ├── table_service.py          # TableService
│   │   └── event_bus.py              # EventBus
│   ├── data/
│   │   └── datastore.py              # DataStore
│   ├── models/
│   │   ├── schemas.py                # Pydantic 모델
│   │   └── enums.py                  # Enum 정의
│   ├── middleware/
│   │   ├── auth.py                   # AuthMiddleware
│   │   └── error_handler.py          # ErrorHandler
│   ├── tests/                        # 백엔드 테스트
│   └── requirements.txt
├── customer-frontend/                # 고객용 React 앱
│   ├── src/
│   │   ├── pages/                    # 페이지 컴포넌트
│   │   ├── components/               # 공유 컴포넌트
│   │   ├── contexts/                 # Context 상태 관리
│   │   ├── services/                 # API 호출 서비스
│   │   └── utils/                    # 유틸리티
│   ├── public/
│   └── package.json
├── admin-frontend/                   # 관리자용 React 앱
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── data/                             # 데이터 저장소 (JSON 파일)
    └── {store_id}/
        ├── menus.json
        ├── tables.json
        ├── sessions.json
        ├── orders.json
        └── order_history.json
```

---

## 5. 기술 스택 요약

| 영역 | 기술 | 비고 |
|------|------|------|
| Backend Framework | FastAPI | 비동기, SSE 네이티브 지원 |
| Backend Language | Python 3.11+ | async/await 지원 |
| Frontend Framework | React.js | 고객/관리자 별도 앱 |
| State Management | Context API + useReducer | 내장 솔루션 |
| Data Storage | JSON 파일 (엔티티별) | 파일 I/O 기반 |
| Real-time | SSE (Server-Sent Events) | EventBus → SSE Stream |
| Event System | asyncio.Queue | 인메모리 비동기 큐 |
| Authentication | JWT (관리자), 세션 (고객) | localStorage 저장 |
| API Style | REST (리소스 기반 중첩) | `/api/stores/{id}/...` |
