# Unit of Work 정의 - 테이블오더 시스템

## 개요
시스템을 5개 유닛으로 분해합니다. Unit 1(DataStore)과 Unit 2(Mock API)가 선행 유닛으로, 나머지 유닛의 기반을 제공합니다.

---

## Unit 1: DataStore (파일 기반 데이터 저장소)

### 정의
파일 시스템 기반 데이터 영속화 계층. 모든 엔티티의 JSON 파일 읽기/쓰기를 담당합니다.

### 포함 컴포넌트
- **DataStore** - JSON 파일 I/O 엔진
- **Data Models** - Pydantic 스키마 (Store, AdminUser, Menu, Table, TableSession, Order, OrderItem, OrderHistory, AuthToken, Event, OrderStatus)
- **Seed Data** - 초기 데이터 시딩 스크립트

### 책임 범위
- 엔티티별 개별 JSON 파일 관리
- CRUD 연산 (read, write, find_by_id, append, update, delete)
- asyncio.Lock 기반 동시성 제어
- 데이터 디렉토리 자동 생성
- Pydantic 모델 기반 데이터 검증

### 산출물
```
backend/
├── models/
│   ├── schemas.py          # Pydantic 데이터 모델
│   └── enums.py            # OrderStatus 등 Enum 정의
├── data/
│   ├── datastore.py        # DataStore 클래스
│   └── seed.py             # 초기 데이터 시딩
├── tests/
│   ├── test_datastore.py   # DataStore 단위 테스트
│   └── test_models.py      # 모델 검증 테스트
└── data/                   # 데이터 파일 디렉토리
    └── {store_id}/
        ├── menus.json
        ├── tables.json
        ├── sessions.json
        ├── orders.json
        └── order_history.json
```

### 테스트 범위
- 단위 테스트: 각 CRUD 메서드, 동시성 제어, 파일 생성/읽기
- 통합 테스트: 다중 엔티티 연속 작업, 파일 잠금 동시 접근

---

## Unit 2: Mock API & Core Structure

### 정의
FastAPI 앱 기본 구조와 모든 API 엔드포인트의 하드코딩된 정적 Mock 응답. 프론트엔드 개발을 즉시 시작할 수 있는 기반을 제공합니다.

### 포함 컴포넌트
- **FastAPI App** - 앱 진입점, CORS 설정
- **CustomerRouter** - 고객 API 엔드포인트 (Mock 응답)
- **AdminRouter** - 관리자 API 엔드포인트 (Mock 응답)
- **SSERouter** - SSE 엔드포인트 (Mock 이벤트 스트림)
- **AuthMiddleware** - 인증 미들웨어 (Mock 통과)
- **ErrorHandler** - 전역 오류 처리
- **Service Stubs** - AuthService, MenuService, OrderService, TableService, EventBus 인터페이스 정의

### 책임 범위
- FastAPI 앱 초기화 및 라우터 등록
- 모든 REST 엔드포인트 정의 (17개)
- 하드코딩된 정적 JSON Mock 응답 반환
- SSE Mock 이벤트 스트림
- CORS 설정 (로컬 개발용)
- Service 인터페이스/추상 클래스 정의

### 산출물
```
backend/
├── main.py                 # FastAPI 앱 진입점
├── config.py               # 설정 (CORS, 경로 등)
├── routers/
│   ├── customer.py         # CustomerRouter (Mock)
│   ├── admin.py            # AdminRouter (Mock)
│   └── sse.py              # SSERouter (Mock)
├── services/
│   ├── auth_service.py     # AuthService 인터페이스
│   ├── menu_service.py     # MenuService 인터페이스
│   ├── order_service.py    # OrderService 인터페이스
│   ├── table_service.py    # TableService 인터페이스
│   └── event_bus.py        # EventBus 인터페이스
├── middleware/
│   ├── auth.py             # AuthMiddleware (Mock 통과)
│   └── error_handler.py    # ErrorHandler
├── tests/
│   ├── test_customer_api.py  # 고객 API 엔드포인트 테스트
│   ├── test_admin_api.py     # 관리자 API 엔드포인트 테스트
│   └── test_sse.py           # SSE 엔드포인트 테스트
└── requirements.txt
```

### Mock 응답 예시
- `GET /api/stores/{id}/menus` → 정적 메뉴 목록 JSON
- `POST /api/stores/{id}/tables/{num}/orders` → 정적 주문 생성 응답
- `GET /api/stores/{id}/events/orders` → 주기적 Mock SSE 이벤트

### 테스트 범위
- 단위 테스트: 각 엔드포인트 응답 코드, 응답 형식 검증
- 통합 테스트: 엔드포인트 간 흐름 (인증 → 조회 → 주문)

---

## Unit 3: Backend Business Logic

### 정의
Service Layer의 실제 비즈니스 로직 구현. Unit 1의 DataStore와 연동하여 Mock 응답을 실제 데이터 처리로 교체합니다.

### 포함 컴포넌트
- **AuthService** - JWT 생성/검증, 테이블 인증, 로그인 시도 제한
- **MenuService** - 메뉴 CRUD, 카테고리 필터링, 데이터 검증
- **OrderService** - 주문 생성/상태변경/삭제, 주문번호 생성, 이벤트 발행
- **TableService** - 테이블 등록, 세션 시작/종료, 이력 관리
- **EventBus** - asyncio.Queue 기반 이벤트 발행/구독
- **SSE Stream** - 실시간 이벤트 스트리밍
- **AuthMiddleware** - 실제 JWT/세션 검증

### 책임 범위
- Unit 2의 Mock 응답을 실제 비즈니스 로직으로 교체
- DataStore 연동 데이터 처리
- JWT 토큰 생성/검증 (PyJWT)
- bcrypt 비밀번호 해싱
- asyncio.Queue 이벤트 시스템
- SSE 실시간 스트림 구현
- 상태 전이 검증 (주문 상태)
- 동시성 충돌 감지

### 산출물
```
backend/
├── services/
│   ├── auth_service.py     # 실제 구현
│   ├── menu_service.py     # 실제 구현
│   ├── order_service.py    # 실제 구현
│   ├── table_service.py    # 실제 구현
│   └── event_bus.py        # 실제 구현
├── routers/
│   ├── customer.py         # Service 연동으로 교체
│   ├── admin.py            # Service 연동으로 교체
│   └── sse.py              # EventBus 연동으로 교체
├── middleware/
│   └── auth.py             # 실제 JWT/세션 검증
└── tests/
    ├── test_auth_service.py
    ├── test_menu_service.py
    ├── test_order_service.py
    ├── test_table_service.py
    ├── test_event_bus.py
    ├── test_integration_order_flow.py
    └── test_integration_session_flow.py
```

### 테스트 범위
- 단위 테스트: 각 Service 메서드, 비즈니스 규칙 검증
- 통합 테스트: 주문 생성→상태변경→SSE 전달, 세션 시작→주문→세션 종료→이력 이동

---

## Unit 4: Customer Frontend

### 정의
고객용 React.js 웹 애플리케이션. Mock API(Unit 2) 기반으로 개발을 시작하고, Unit 3 완료 후 실제 API로 전환합니다.

### 포함 컴포넌트
- **Pages**: TableSetupPage, MenuPage, CartPage, OrderConfirmPage, OrderSuccessPage, OrderHistoryPage
- **Components**: MenuCard, CategoryNav, CartBadge, CartItem
- **Contexts**: AuthContext, CartContext, MenuContext
- **Services**: API 호출 서비스 (axios/fetch)

### 책임 범위
- 테이블 초기 설정 및 자동 로그인
- 메뉴 카테고리 탐색 및 상세 정보 표시
- 장바구니 관리 (추가/삭제/수량조절/총액계산)
- localStorage 장바구니 영속화
- 주문 생성 및 확인 플로우
- 주문 내역 조회
- 오류 처리 및 사용자 피드백

### 산출물
```
customer-frontend/
├── src/
│   ├── App.jsx
│   ├── pages/
│   │   ├── TableSetupPage.jsx
│   │   ├── MenuPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── OrderConfirmPage.jsx
│   │   ├── OrderSuccessPage.jsx
│   │   └── OrderHistoryPage.jsx
│   ├── components/
│   │   ├── MenuCard.jsx
│   │   ├── CategoryNav.jsx
│   │   ├── CartBadge.jsx
│   │   └── CartItem.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── MenuContext.jsx
│   ├── services/
│   │   └── api.js
│   └── utils/
│       └── storage.js
├── public/
├── package.json
└── tests/
```

### 테스트 범위
- 단위 테스트: Context 로직, 유틸리티 함수, 컴포넌트 렌더링
- 통합 테스트: 페이지 간 네비게이션, 장바구니→주문 플로우

---

## Unit 5: Admin Frontend

### 정의
관리자용 React.js 웹 애플리케이션. SSE 실시간 주문 모니터링이 핵심 기능입니다.

### 포함 컴포넌트
- **Pages**: LoginPage, DashboardPage, TableDetailPage, TableManagementPage, MenuManagementPage
- **Components**: TableCard, OrderCard, OrderStatusBadge, MenuForm
- **Contexts**: AdminAuthContext, OrderContext, SSEContext
- **Services**: API 호출 서비스, SSE 클라이언트

### 책임 범위
- 관리자 로그인/로그아웃 (JWT localStorage)
- 실시간 주문 대시보드 (SSE)
- 테이블별 주문 그리드 표시
- 주문 상태 변경 (대기중/준비중/완료)
- 주문 삭제
- 테이블 관리 (생성, 세션 시작/종료)
- 과거 주문 이력 조회
- 메뉴 CRUD 관리

### 산출물
```
admin-frontend/
├── src/
│   ├── App.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TableDetailPage.jsx
│   │   ├── TableManagementPage.jsx
│   │   └── MenuManagementPage.jsx
│   ├── components/
│   │   ├── TableCard.jsx
│   │   ├── OrderCard.jsx
│   │   ├── OrderStatusBadge.jsx
│   │   └── MenuForm.jsx
│   ├── contexts/
│   │   ├── AdminAuthContext.jsx
│   │   ├── OrderContext.jsx
│   │   └── SSEContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── sseClient.js
│   └── utils/
│       └── auth.js
├── public/
├── package.json
└── tests/
```

### 테스트 범위
- 단위 테스트: Context 로직, SSE 클라이언트, 컴포넌트 렌더링
- 통합 테스트: 로그인→대시보드, 주문 상태 변경 플로우, SSE 이벤트 수신

---

## 코드 조직 전략 (Greenfield)

```
table-order/                    # 워크스페이스 루트
├── backend/                    # Unit 1, 2, 3
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── models/
│   ├── data/
│   ├── routers/
│   ├── services/
│   ├── middleware/
│   └── tests/
├── customer-frontend/          # Unit 4
│   ├── src/
│   ├── public/
│   └── package.json
├── admin-frontend/             # Unit 5
│   ├── src/
│   ├── public/
│   └── package.json
└── data/                       # 런타임 데이터 (JSON 파일)
    └── {store_id}/
```
