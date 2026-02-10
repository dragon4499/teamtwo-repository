# Logical Components - Unit 2: Mock API & Core Structure

---

## 1. 컴포넌트 아키텍처 개요

```
+----------------------------------------------------------+
|                    FastAPI App (main.py)                   |
|  CORS Middleware | Error Handler | Health Check            |
+----------------------------------------------------------+
      |              |              |
      v              v              v
+-----------+  +-----------+  +-----------+
| Customer  |  | Admin     |  | SSE       |
| Router    |  | Router    |  | Router    |
+-----------+  +-----------+  +-----------+
      |              |              |
      v              v              v
+-----------+  +-----------+  +-----------+
| Service   |  | Service   |  | EventBus  |
| Interfaces|  | Interfaces|  | Interface |
| (ABC)     |  | (ABC)     |  | (ABC)     |
+-----------+  +-----------+  +-----------+
```

---

## 2. 앱 계층 컴포넌트

### 2.1 FastAPI App (main.py)

앱 진입점으로 모든 컴포넌트를 조합합니다.

| 책임 | 설명 |
|------|------|
| 앱 인스턴스 생성 | `FastAPI(title, version)` |
| CORS 미들웨어 등록 | localhost 오리진 허용 |
| 라우터 등록 | customer, admin, sse |
| Health Check | `GET /health` |
| 전역 예외 핸들러 | 500 응답 |

### 2.2 Config (config.py)

앱 설정값을 중앙 관리합니다.

| 설정 | 기본값 | 설명 |
|------|--------|------|
| APP_TITLE | "Table Order API" | 앱 제목 |
| APP_VERSION | "0.1.0" | 앱 버전 |
| CORS_ORIGINS | ["http://localhost:3000", "http://localhost:3001"] | CORS 허용 오리진 |
| DATA_DIR | "data" | 데이터 디렉토리 |

---

## 3. 라우터 컴포넌트

### 3.1 CustomerRouter (routers/customer.py)

| 엔드포인트 | Mock 응답 |
|-----------|----------|
| POST /tables/auth | 정적 세션 정보 |
| GET /menus | 정적 메뉴 5개 |
| POST /tables/{n}/orders | 정적 주문 |
| GET /sessions/{id}/orders | 정적 주문 목록 |
| GET /orders/{id} | 정적 주문 상세 |

### 3.2 AdminRouter (routers/admin.py)

| 엔드포인트 | Mock 응답 |
|-----------|----------|
| POST /login | 정적 토큰 + 사용자 |
| POST /logout | 성공 메시지 |
| GET /tables | 정적 테이블 3개 |
| POST /tables | 정적 테이블 |
| POST /tables/{n}/session/start | 정적 세션 |
| POST /tables/{n}/session/end | 성공 메시지 |
| GET /tables/{n}/orders | 정적 주문 2개 |
| GET /tables/{n}/history | 정적 이력 1개 |
| PATCH /orders/{id}/status | 정적 주문 (상태 변경) |
| DELETE /orders/{id} | 204 No Content |
| GET /menus | 정적 메뉴 5개 |
| POST /menus | 정적 메뉴 |
| PUT /menus/{id} | 정적 메뉴 (수정) |
| DELETE /menus/{id} | 204 No Content |

### 3.3 SSERouter (routers/sse.py)

| 엔드포인트 | Mock 동작 |
|-----------|----------|
| GET /orders | Mock 이벤트 1개 전송 + keep-alive |

---

## 4. 서비스 인터페이스 컴포넌트

### 4.1 서비스 파일 목록

| 파일 | 클래스 | 메서드 수 | 설명 |
|------|--------|:--------:|------|
| auth_service.py | AuthServiceBase | 5 | 인증 인터페이스 |
| menu_service.py | MenuServiceBase | 6 | 메뉴 관리 인터페이스 |
| order_service.py | OrderServiceBase | 6 | 주문 처리 인터페이스 |
| table_service.py | TableServiceBase | 5 | 테이블 관리 인터페이스 |
| event_bus.py | EventBusBase | 3 | 이벤트 버스 인터페이스 |

> Unit 2에서는 ABC 추상 클래스만 정의. Unit 3에서 실제 구현.

---

## 5. 미들웨어 컴포넌트

### 5.1 ErrorHandler (middleware/error_handler.py)

전역 예외 핸들러 함수를 제공합니다.

| 예외 | 응답 코드 | 응답 본문 |
|------|:---------:|----------|
| Exception (미처리) | 500 | `{"detail": "Internal server error"}` |

> Unit 3에서 NotFoundError → 404, ValidationError → 400 등 추가

---

## 6. 테스트 컴포넌트

### 6.1 테스트 파일 구조

```
backend/tests/
├── conftest.py              # 기존 + client fixture 추가
├── test_customer_api.py     # 고객 API 5개 엔드포인트 테스트
├── test_admin_api.py        # 관리자 API 14개 엔드포인트 테스트
└── test_sse.py              # SSE 이벤트 스트림 테스트
```

### 6.2 테스트 범위

| 테스트 파일 | 테스트 항목 |
|------------|-----------|
| test_customer_api.py | 각 엔드포인트 응답 코드, JSON 구조, 필수 필드 존재 |
| test_admin_api.py | 각 엔드포인트 응답 코드, JSON 구조, 204 응답 (삭제) |
| test_sse.py | SSE 연결, 이벤트 수신, Content-Type 확인 |

---

## 7. 파일 구조 요약 (Unit 2 전체)

```
backend/
├── main.py                    # FastAPI 앱 진입점
├── config.py                  # 설정
├── routers/
│   ├── __init__.py
│   ├── customer.py            # 고객 API (Mock)
│   ├── admin.py               # 관리자 API (Mock)
│   └── sse.py                 # SSE (Mock)
├── services/
│   ├── __init__.py
│   ├── auth_service.py        # AuthServiceBase
│   ├── menu_service.py        # MenuServiceBase
│   ├── order_service.py       # OrderServiceBase
│   ├── table_service.py       # TableServiceBase
│   └── event_bus.py           # EventBusBase
├── middleware/
│   ├── __init__.py
│   └── error_handler.py       # 전역 예외 핸들러
├── models/                    # (Unit 1)
├── data/                      # (Unit 1)
├── exceptions.py              # (Unit 1)
├── tests/
│   ├── conftest.py            # fixtures (업데이트)
│   ├── test_customer_api.py   # 고객 API 테스트
│   ├── test_admin_api.py      # 관리자 API 테스트
│   ├── test_sse.py            # SSE 테스트
│   ├── test_datastore.py      # (Unit 1)
│   ├── test_datastore_lock.py # (Unit 1)
│   ├── test_models.py         # (Unit 1)
│   └── test_seed.py           # (Unit 1)
├── requirements.txt
└── pytest.ini
```
