# 🍽️ Table Order System — 테이블 주문 관리 시스템

QR 코드 기반 비대면 테이블 주문 시스템입니다. 매장 관리자가 테이블과 메뉴를 관리하고, 고객이 테이블에서 직접 주문할 수 있는 풀스택 웹 애플리케이션입니다.

> AIDLC (AI-Driven Development Life Cycle) 워크샵에서 설계부터 구현까지 AI와 협업하여 개발되었습니다.

---

## 시스템 구성

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────┐
│  Customer SPA   │     │   Admin SPA     │     │    Backend API          │
│  React + Vite   │────▶│  React + Vite   │────▶│    FastAPI + Uvicorn    │
│  :3000          │     │  :3001          │     │    :8000                │
└─────────────────┘     └─────────────────┘     └────────┬────────────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │  JSON File DataStore │
                                              │  (data/)             │
                                              └─────────────────────┘
```

| 구성 요소 | 기술 스택 | 포트 |
|-----------|-----------|------|
| Backend API | Python 3.10+, FastAPI, Pydantic v2, bcrypt, PyJWT | 8000 |
| Customer Frontend | React 18, React Router v6, Vite 5 | 3000 |
| Admin Frontend | React 18, React Router v6, Vite 5, SSE | 3001 |
| Data Store | JSON 파일 기반 (asyncio Lock, 원자적 쓰기) | — |

---

## 주요 기능

### 관리자 (Admin)
- JWT 기반 로그인/로그아웃 (계정 잠금 보호)
- 테이블 등록 및 세션 시작/종료
- 메뉴 CRUD (카테고리별 관리)
- 주문 상태 변경 (pending → preparing → completed)
- SSE 기반 실시간 주문 모니터링

### 고객 (Customer)
- 테이블 번호 + 비밀번호로 인증
- 카테고리별 메뉴 탐색
- 장바구니 (localStorage 영속화)
- 주문 생성 및 주문 내역 조회

---

## 빠른 시작

### 사전 요구사항
- Python 3.10+
- Node.js 18+
- npm

### 1. Backend 설정

```bash
# 가상환경 생성 및 활성화
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 의존성 설치
pip install fastapi uvicorn[standard] aiofiles bcrypt PyJWT pydantic sse-starlette

# 서버 실행
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Admin Frontend 설정

```bash
cd admin-frontend
npm install
npm run dev    # http://localhost:3001
```

### 3. Customer Frontend 설정

```bash
cd customer-frontend
npm install
npm run dev    # http://localhost:3000
```

### 4. 사용 흐름

1. 관리자 페이지 접속 → `http://localhost:3001`
2. 로그인: Store ID `store001`, Username `admin`, Password `admin1234`
3. 테이블 생성 (번호 + 비밀번호 설정)
4. 테이블 세션 시작
5. 고객 페이지 접속 → `http://localhost:3000`
6. Store ID `store001`, 테이블 번호, 비밀번호 입력
7. 메뉴 선택 → 장바구니 → 주문

---

## 프로젝트 구조

```
├── backend/                        # FastAPI 백엔드
│   ├── main.py                     # 앱 진입점 (lifespan, middleware, router)
│   ├── config.py                   # 설정값 (JWT, CORS, Auth)
│   ├── dependencies.py             # DI 컨테이너 (singleton 서비스)
│   ├── exceptions.py               # 커스텀 예외 클래스
│   ├── data/
│   │   ├── datastore.py            # JSON 파일 기반 비동기 DataStore
│   │   └── seed.py                 # 초기 시드 데이터 (매장, 관리자, 메뉴 12종)
│   ├── models/
│   │   ├── enums.py                # OrderStatus, SessionStatus, UserRole
│   │   └── schemas.py              # Pydantic v2 도메인 모델
│   ├── middleware/
│   │   └── error_handler.py        # ErrorHandlerMiddleware (예외→HTTP 매핑)
│   ├── routers/
│   │   ├── customer.py             # 고객 API (/api/stores/{store_id}/...)
│   │   ├── admin.py                # 관리자 API (/api/stores/{store_id}/admin/...)
│   │   └── sse.py                  # SSE 이벤트 스트림
│   ├── services/
│   │   ├── auth_service.py         # 인증 (JWT, bcrypt, 계정 잠금)
│   │   ├── menu_service.py         # 메뉴 CRUD
│   │   ├── order_service.py        # 주문 생성/상태변경/삭제 + EventBus
│   │   ├── table_service.py        # 테이블 등록, 세션 관리
│   │   └── event_bus.py            # asyncio.Queue 기반 pub/sub
│   └── tests/                      # pytest 테스트 (60개)
│
├── customer-frontend/              # 고객용 React SPA
│   └── src/
│       ├── pages/                  # 6개 페이지
│       ├── components/             # 4개 컴포넌트
│       ├── contexts/               # Auth, Cart, Menu Context
│       └── services/api.js         # Backend API 클라이언트
│
├── admin-frontend/                 # 관리자용 React SPA
│   └── src/
│       ├── pages/                  # 5개 페이지
│       ├── components/             # 4개 컴포넌트
│       ├── contexts/               # AdminAuth, Order Context
│       └── services/
│           ├── api.js              # Backend API 클라이언트
│           └── sseClient.js        # SSE 실시간 이벤트 수신
│
├── data/                           # 런타임 데이터 (JSON 파일)
└── aidlc-docs/                     # AIDLC 설계 문서
```

---

## API 엔드포인트

### 고객 API (`/api/stores/{store_id}`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/tables/auth` | 테이블 인증 |
| GET | `/menus?category=` | 메뉴 목록 (카테고리 필터) |
| POST | `/tables/{table_num}/orders` | 주문 생성 |
| GET | `/sessions/{session_id}/orders` | 세션별 주문 조회 |
| GET | `/orders/{order_id}` | 주문 상세 |

### 관리자 API (`/api/stores/{store_id}/admin`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/login` | 관리자 로그인 |
| POST | `/logout` | 관리자 로그아웃 |
| GET | `/tables` | 테이블 목록 |
| POST | `/tables` | 테이블 생성 |
| POST | `/tables/{table_num}/session/start` | 세션 시작 |
| POST | `/tables/{table_num}/session/end` | 세션 종료 |
| GET | `/tables/{table_num}/orders` | 테이블 주문 목록 |
| GET | `/tables/{table_num}/history` | 과거 주문 이력 |
| PATCH | `/orders/{order_id}/status` | 주문 상태 변경 |
| DELETE | `/orders/{order_id}` | 주문 삭제 |
| GET | `/menus` | 메뉴 목록 |
| POST | `/menus` | 메뉴 등록 |
| PUT | `/menus/{menu_id}` | 메뉴 수정 |
| DELETE | `/menus/{menu_id}` | 메뉴 삭제 |

### SSE (`/api/stores/{store_id}/events`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/orders` | 주문 실시간 이벤트 스트림 |

---

## 아키텍처 설계 결정

### DataStore (JSON 파일 기반)
- 외부 DB 의존성 없이 즉시 실행 가능
- `asyncio.Lock` 기반 엔티티별 동시성 제어
- 원자적 쓰기 (tmp 파일 → `os.replace`)
- 매장별 디렉토리 격리 (`data/{store_id}/`)

### ErrorHandlerMiddleware
- `BaseHTTPMiddleware`를 상속하여 모든 커스텀 예외를 HTTP 상태 코드로 매핑
- FastAPI의 `add_exception_handler`는 커스텀 예외를 캐치하지 못하는 문제 해결

### EventBus (asyncio.Queue)
- 매장별 구독자 관리
- SSE를 통한 실시간 주문 알림
- 큐 가득 참 시 이벤트 드롭 (graceful degradation)

### 인증
- 관리자: JWT (HS256) + bcrypt 비밀번호 해싱 + 계정 잠금 (5회 실패 → 30분)
- 고객: 테이블 번호 + 비밀번호 → 활성 세션 반환

---

## 테스트

```bash
# 전체 테스트 실행 (60개)
python -m pytest backend/tests/ -v

# 커버리지 포함
python -m pytest backend/tests/ -v --cov=backend
```

테스트 범위:
- DataStore CRUD 및 동시성 (Lock timeout, 병렬 실행)
- Pydantic 모델 검증 (Store, Menu, Table, Order, Session)
- Enum 상태 전이 규칙
- Seed 데이터 멱등성

---

## 향후 개발 로드맵

### 단기 (Short-term)
- [ ] 관리자 JWT 토큰 검증 middleware 추가 (현재 stateless)
- [ ] 고객 주문 실시간 상태 업데이트 (고객 측 SSE)
- [ ] 메뉴 이미지 업로드 (현재 URL만 지원)
- [ ] 주문 취소 기능 (고객 측)
- [ ] 환경 변수 기반 설정 관리 (python-dotenv)

### 중기 (Mid-term)
- [ ] PostgreSQL/MySQL 마이그레이션 (SQLAlchemy async)
- [ ] Redis 기반 세션 관리 및 EventBus
- [ ] 결제 시스템 연동 (PG사 API)
- [ ] 주문 통계 대시보드 (일별/주별/메뉴별 매출)
- [ ] 다국어 지원 (i18n)
- [ ] 프론트엔드 테스트 (Vitest + React Testing Library)

### 장기 (Long-term)
- [ ] 멀티 매장 관리 (매장 그룹, 본사 대시보드)
- [ ] 모바일 앱 (React Native)
- [ ] 주방 디스플레이 시스템 (KDS)
- [ ] AI 기반 메뉴 추천
- [ ] AWS 배포 (ECS/Lambda + DynamoDB + CloudFront)
- [ ] CI/CD 파이프라인 (GitHub Actions)

### 기술 부채 해소
- [ ] 서비스 레이어 단위 테스트 추가
- [ ] API 통합 테스트 (httpx AsyncClient)
- [ ] OpenAPI 스키마 자동 생성 및 문서화
- [ ] 프론트엔드 상태 관리 고도화 (Zustand 또는 TanStack Query)
- [ ] 에러 바운더리 및 로딩 상태 UX 개선
- [ ] 접근성(a11y) 감사 및 개선

---

## 시드 데이터

| 항목 | 값 |
|------|-----|
| Store ID | `store001` |
| Store Name | 맛있는 식당 |
| Admin Username | `admin` |
| Admin Password | `admin1234` |
| 메뉴 | 12종 (메인 3, 사이드 3, 음료 3, 디저트 3) |

---

## 라이선스

AIDLC 워크샵 교육용 프로젝트입니다.
