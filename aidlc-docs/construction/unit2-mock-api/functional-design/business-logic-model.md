# Business Logic Model - Unit 2: Mock API & Core Structure

---

## 1. 고객 API Mock 응답 로직

### 1.1 POST /api/stores/{store_id}/tables/auth (테이블 인증)

```
입력: TableAuthRequest (table_number, password)
처리: 입력 무시, 정적 Mock 응답 반환
응답 (200):
{
  "session_id": "T01-20260209090000",
  "table_number": 1,
  "store_id": "store001",
  "expires_at": "2026-02-10T04:00:00Z"
}
```

### 1.2 GET /api/stores/{store_id}/menus (메뉴 목록)

```
입력: store_id (path), category (query, optional)
처리: category 파라미터 무시, 전체 Mock 메뉴 반환
응답 (200):
[
  {
    "id": "mock-menu-001",
    "name": "김치찌개",
    "price": 9000,
    "description": "돼지고기와 묵은지로 끓인 김치찌개",
    "category": "메인",
    "image_url": "",
    "is_available": true
  },
  {
    "id": "mock-menu-002",
    "name": "된장찌개",
    "price": 8000,
    "description": "두부와 야채가 들어간 된장찌개",
    "category": "메인",
    "image_url": "",
    "is_available": true
  },
  {
    "id": "mock-menu-003",
    "name": "불고기 정식",
    "price": 12000,
    "description": "양념 불고기와 반찬 세트",
    "category": "메인",
    "image_url": "",
    "is_available": true
  },
  {
    "id": "mock-menu-004",
    "name": "콜라",
    "price": 2000,
    "description": "코카콜라 355ml",
    "category": "음료",
    "image_url": "",
    "is_available": true
  },
  {
    "id": "mock-menu-005",
    "name": "맥주",
    "price": 4000,
    "description": "생맥주 500ml",
    "category": "음료",
    "image_url": "",
    "is_available": true
  }
]
```

### 1.3 POST /api/stores/{store_id}/tables/{table_num}/orders (주문 생성)

```
입력: OrderCreateRequest (session_id, items)
처리: 입력 무시, 정적 Mock 주문 응답 반환
응답 (201):
{
  "id": "mock-order-001",
  "order_number": "20260209-00001",
  "table_number": 1,
  "session_id": "T01-20260209090000",
  "items": [
    {
      "menu_id": "mock-menu-001",
      "menu_name": "김치찌개",
      "price": 9000,
      "quantity": 2,
      "subtotal": 18000
    },
    {
      "menu_id": "mock-menu-004",
      "menu_name": "콜라",
      "price": 2000,
      "quantity": 1,
      "subtotal": 2000
    }
  ],
  "total_amount": 20000,
  "status": "pending",
  "created_at": "2026-02-09T12:00:00Z"
}
```

### 1.4 GET /api/stores/{store_id}/sessions/{session_id}/orders (세션별 주문)

```
입력: store_id, session_id (path)
처리: 파라미터 무시, Mock 주문 목록 반환
응답 (200):
[
  {
    "id": "mock-order-001",
    "order_number": "20260209-00001",
    "table_number": 1,
    "session_id": "T01-20260209090000",
    "items": [
      {"menu_id": "mock-menu-001", "menu_name": "김치찌개", "price": 9000, "quantity": 2, "subtotal": 18000}
    ],
    "total_amount": 18000,
    "status": "pending",
    "created_at": "2026-02-09T12:00:00Z"
  }
]
```

### 1.5 GET /api/stores/{store_id}/orders/{order_id} (주문 상세)

```
입력: store_id, order_id (path)
처리: 파라미터 무시, Mock 단일 주문 반환
응답 (200):
{
  "id": "mock-order-001",
  "order_number": "20260209-00001",
  "table_number": 1,
  "session_id": "T01-20260209090000",
  "items": [
    {"menu_id": "mock-menu-001", "menu_name": "김치찌개", "price": 9000, "quantity": 2, "subtotal": 18000},
    {"menu_id": "mock-menu-004", "menu_name": "콜라", "price": 2000, "quantity": 1, "subtotal": 2000}
  ],
  "total_amount": 20000,
  "status": "pending",
  "created_at": "2026-02-09T12:00:00Z"
}
```

---

## 2. 관리자 API Mock 응답 로직

### 2.1 POST /api/stores/{store_id}/admin/login (관리자 로그인)

```
입력: AdminLoginRequest (username, password)
처리: 입력 무시, 정적 Mock 토큰 반환
응답 (200):
{
  "token": "mock-jwt-token-admin",
  "user": {
    "id": "mock-admin-001",
    "username": "admin",
    "role": "admin"
  }
}
```

### 2.2 POST /api/stores/{store_id}/admin/logout (관리자 로그아웃)

```
입력: (없음)
처리: 아무 동작 없음
응답 (200):
{
  "message": "Logged out successfully"
}
```

### 2.3 GET /api/stores/{store_id}/admin/tables (테이블 목록)

```
입력: store_id (path)
처리: 정적 Mock 테이블 목록 반환
응답 (200):
[
  {
    "id": "mock-table-001",
    "table_number": 1,
    "is_active": true,
    "current_session": {
      "session_id": "T01-20260209090000",
      "started_at": "2026-02-09T12:00:00Z",
      "expires_at": "2026-02-10T04:00:00Z"
    }
  },
  {
    "id": "mock-table-002",
    "table_number": 2,
    "is_active": true,
    "current_session": null
  },
  {
    "id": "mock-table-003",
    "table_number": 3,
    "is_active": true,
    "current_session": null
  }
]
```

### 2.4 POST /api/stores/{store_id}/admin/tables (테이블 생성)

```
입력: TableCreateRequest (table_number, password)
처리: 입력 무시, 정적 Mock 테이블 반환
응답 (201):
{
  "id": "mock-table-new",
  "table_number": 4,
  "is_active": true,
  "current_session": null
}
```

### 2.5 POST /api/stores/{store_id}/admin/tables/{table_num}/session/start (세션 시작)

```
입력: store_id, table_num (path)
처리: 정적 Mock 세션 반환
응답 (200):
{
  "session_id": "T01-20260209120000",
  "table_number": 1,
  "started_at": "2026-02-09T12:00:00Z",
  "expires_at": "2026-02-10T04:00:00Z",
  "status": "active"
}
```

### 2.6 POST /api/stores/{store_id}/admin/tables/{table_num}/session/end (세션 종료)

```
입력: store_id, table_num (path)
처리: 아무 동작 없음
응답 (200):
{
  "message": "Session ended successfully"
}
```

### 2.7 GET /api/stores/{store_id}/admin/tables/{table_num}/orders (테이블 주문)

```
입력: store_id, table_num (path)
처리: 정적 Mock 주문 목록 반환
응답 (200):
[
  {
    "id": "mock-order-001",
    "order_number": "20260209-00001",
    "table_number": 1,
    "session_id": "T01-20260209090000",
    "items": [
      {"menu_id": "mock-menu-001", "menu_name": "김치찌개", "price": 9000, "quantity": 2, "subtotal": 18000}
    ],
    "total_amount": 18000,
    "status": "pending",
    "created_at": "2026-02-09T12:00:00Z"
  },
  {
    "id": "mock-order-002",
    "order_number": "20260209-00002",
    "table_number": 1,
    "session_id": "T01-20260209090000",
    "items": [
      {"menu_id": "mock-menu-003", "menu_name": "불고기 정식", "price": 12000, "quantity": 1, "subtotal": 12000}
    ],
    "total_amount": 12000,
    "status": "preparing",
    "created_at": "2026-02-09T12:05:00Z"
  }
]
```

### 2.8 GET /api/stores/{store_id}/admin/tables/{table_num}/history (과거 이력)

```
입력: store_id, table_num (path), date_from, date_to (query, optional)
처리: 파라미터 무시, 정적 Mock 이력 반환
응답 (200):
[
  {
    "id": "mock-history-001",
    "session_id": "T01-20260208090000",
    "orders": [
      {
        "id": "mock-hist-order-001",
        "order_number": "20260208-00001",
        "table_number": 1,
        "session_id": "T01-20260208090000",
        "items": [
          {"menu_id": "mock-menu-001", "menu_name": "김치찌개", "price": 9000, "quantity": 1, "subtotal": 9000}
        ],
        "total_amount": 9000,
        "status": "completed",
        "created_at": "2026-02-08T12:00:00Z"
      }
    ],
    "total_session_amount": 9000,
    "session_started_at": "2026-02-08T09:00:00Z",
    "session_ended_at": "2026-02-08T22:00:00Z"
  }
]
```

### 2.9 PATCH /api/stores/{store_id}/admin/orders/{order_id}/status (상태 변경)

```
입력: OrderStatusUpdateRequest (status)
처리: 입력 무시, 정적 Mock 응답 반환
응답 (200):
{
  "id": "mock-order-001",
  "order_number": "20260209-00001",
  "table_number": 1,
  "session_id": "T01-20260209090000",
  "items": [
    {"menu_id": "mock-menu-001", "menu_name": "김치찌개", "price": 9000, "quantity": 2, "subtotal": 18000}
  ],
  "total_amount": 18000,
  "status": "preparing",
  "created_at": "2026-02-09T12:00:00Z"
}
```

### 2.10 DELETE /api/stores/{store_id}/admin/orders/{order_id} (주문 삭제)

```
입력: store_id, order_id (path)
처리: 아무 동작 없음
응답 (204): No Content
```

### 2.11 GET /api/stores/{store_id}/admin/menus (메뉴 목록 - 관리자)

```
입력: store_id (path)
처리: 고객 메뉴 목록과 동일한 Mock 데이터 반환
응답 (200): (1.2 메뉴 목록과 동일)
```

### 2.12 POST /api/stores/{store_id}/admin/menus (메뉴 등록)

```
입력: MenuCreateRequest
처리: 입력 무시, 정적 Mock 메뉴 반환
응답 (201):
{
  "id": "mock-menu-new",
  "name": "새 메뉴",
  "price": 10000,
  "description": "새로 등록된 메뉴",
  "category": "메인",
  "image_url": "",
  "is_available": true,
  "sort_order": 0,
  "created_at": "2026-02-09T12:00:00Z",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### 2.13 PUT /api/stores/{store_id}/admin/menus/{menu_id} (메뉴 수정)

```
입력: MenuUpdateRequest
처리: 입력 무시, 정적 Mock 메뉴 반환
응답 (200):
{
  "id": "mock-menu-001",
  "name": "김치찌개 (수정됨)",
  "price": 10000,
  "description": "돼지고기와 묵은지로 끓인 김치찌개",
  "category": "메인",
  "image_url": "",
  "is_available": true,
  "sort_order": 0,
  "created_at": "2026-02-09T12:00:00Z",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### 2.14 DELETE /api/stores/{store_id}/admin/menus/{menu_id} (메뉴 삭제)

```
입력: store_id, menu_id (path)
처리: 아무 동작 없음
응답 (204): No Content
```

---

## 3. SSE Mock 이벤트 로직

### 3.1 GET /api/stores/{store_id}/events/orders (주문 이벤트 스트림)

```
연결 시 동작:
  1. StreamingResponse 생성 (media_type="text/event-stream")
  2. 즉시 Mock 이벤트 1개 전송:
     event: order_created
     data: {
       "order_id": "mock-order-001",
       "order_number": "20260209-00001",
       "table_number": 1,
       "status": "pending",
       "total_amount": 25000,
       "timestamp": "2026-02-09T12:00:00Z"
     }
  3. 연결 유지 (무한 대기)
     - asyncio.sleep으로 연결 유지
     - 클라이언트 연결 해제 감지 시 종료
```

### 3.2 SSE 이벤트 전송 형식
```
async def event_generator():
    # 초기 Mock 이벤트 전송
    yield f"event: order_created\ndata: {json.dumps(mock_event)}\n\n"
    
    # 연결 유지 (keep-alive)
    while True:
        await asyncio.sleep(30)
        yield ": keep-alive\n\n"
```

---

## 4. FastAPI 앱 초기화 로직

### 4.1 main.py 구조

```
1. FastAPI 인스턴스 생성
   app = FastAPI(title="Table Order API", version="0.1.0")

2. CORS 미들웨어 추가
   app.add_middleware(CORSMiddleware, ...)

3. Health Check 엔드포인트 등록
   @app.get("/health")

4. 라우터 등록
   app.include_router(customer_router)
   app.include_router(admin_router)
   app.include_router(sse_router)
```

### 4.2 config.py 구조

```
설정값 정의:
  - APP_TITLE = "Table Order API"
  - APP_VERSION = "0.1.0"
  - CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
  - DATA_DIR = "data"
```

---

## 5. 전역 예외 핸들러 로직

### 5.1 ErrorHandler 구조

```
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # 로깅 (선택적)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

- Unit 2에서는 최소한의 전역 핸들러만 등록
- Unit 3에서 커스텀 예외(NotFoundError, ValidationError 등) 핸들러 추가
