# Logical Components - Unit 3: Backend Business Logic

---

## 1. 컴포넌트 구조

```
+------------------------------------------------------------------+
|                        FastAPI Application                        |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  | CustomerRouter   |  | AdminRouter      |  | SSERouter        |  |
|  | (고객 API)        |  | (관리자 API)      |  | (실시간 스트림)   |  |
|  +--------+---------+  +--------+---------+  +--------+---------+  |
|           |                      |                      |          |
|           v                      v                      v          |
|  +------------------+  +------------------+                        |
|  | Auth Dependency   |  | Auth Middleware  |                        |
|  | (세션 검증)        |  | (JWT 검증)       |                        |
|  +--------+---------+  +--------+---------+                        |
|           |                      |                                  |
|           v                      v                                  |
|  +-------------------------------------------------------+        |
|  |              Service Layer                             |        |
|  |  +-------------+ +-------------+ +---------------+    |        |
|  |  | AuthService | | MenuService | | OrderService  |    |        |
|  |  +-------------+ +-------------+ +-------+-------+    |        |
|  |  +-------------+                         |            |        |
|  |  |TableService |                         v            |        |
|  |  +------+------+                 +-------+-------+    |        |
|  |         |                        |   EventBus    |    |        |
|  |         |                        +-------+-------+    |        |
|  +---------+--------------------------------+------------+        |
|            |                                |                      |
|            v                                v                      |
|  +------------------+              +------------------+            |
|  |    DataStore      |              |   SSE Stream     |            |
|  |  (JSON File I/O)  |              | (클라이언트 전달)  |            |
|  +------------------+              +------------------+            |
+------------------------------------------------------------------+
```

---

## 2. 컴포넌트 상세

### 2.1 Auth Dependency (신규)
- 역할: FastAPI Depends를 통한 인증 주입
- 위치: `backend/middleware/auth.py`
- 구성:
  - `get_current_admin()` — JWT 토큰에서 AdminUser 추출
  - `get_current_session()` — 세션 ID에서 TableSession 추출
  - `TokenBlacklist` — 로그아웃 토큰 관리

### 2.2 AuthService (인터페이스 → 구현)
- 역할: 인증 로직 처리
- 의존성: DataStore
- 주요 기능: 관리자 로그인/로그아웃, 테이블 인증, 토큰/세션 검증

### 2.3 MenuService (인터페이스 → 구현)
- 역할: 메뉴 CRUD
- 의존성: DataStore
- 주요 기능: 메뉴 조회/등록/수정/소프트삭제

### 2.4 OrderService (인터페이스 → 구현)
- 역할: 주문 처리 (핵심 서비스)
- 의존성: DataStore, EventBus, MenuService
- 주요 기능: 주문 생성/조회/상태변경/삭제, 이벤트 발행

### 2.5 TableService (인터페이스 → 구현)
- 역할: 테이블/세션 생명주기 관리
- 의존성: DataStore, OrderService
- 주요 기능: 테이블 등록, 세션 시작/종료, 이력 관리

### 2.6 EventBus (인터페이스 → 구현)
- 역할: 인메모리 이벤트 중개
- 의존성: 없음 (독립)
- 구현: asyncio.Queue 기반 Pub/Sub
- 주요 기능: 이벤트 발행/구독/해제

### 2.7 Error Handlers (확장)
- 역할: 비즈니스 예외 → HTTP 응답 매핑
- 위치: `backend/middleware/error_handler.py`
- 추가: NotFoundError, ValidationError, AuthenticationError, DuplicateError 핸들러

---

## 3. 의존성 흐름

```
DataStore ←── AuthService
          ←── MenuService
          ←── OrderService ←── EventBus
          ←── TableService ←── OrderService

Router → Depends(get_xxx_service) → Service → DataStore
                                           → EventBus → SSE Stream
```

### 초기화 순서
1. DataStore (독립)
2. EventBus (독립)
3. AuthService (DataStore)
4. MenuService (DataStore)
5. OrderService (DataStore, EventBus, MenuService)
6. TableService (DataStore, OrderService)

---

## 4. 설정 컴포넌트 (config.py 확장)

```python
# 기존 (Unit 2)
APP_TITLE = "Table Order API"
APP_VERSION = "0.2.0"  # Unit 3 버전 업
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
DATA_DIR = "data"

# 추가 (Unit 3)
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ADMIN_TOKEN_EXPIRE_HOURS = 24
TABLE_SESSION_EXPIRE_HOURS = 16
```
