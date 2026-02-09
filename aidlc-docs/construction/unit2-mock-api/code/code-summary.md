# Code Summary - Unit 2: Mock API & Core Structure

---

## 생성된 파일 목록

### 앱 구조
| 파일 | 설명 |
|------|------|
| `backend/main.py` | FastAPI 앱 진입점 (CORS, 라우터 등록, Health Check) |
| `backend/config.py` | 앱 설정 (CORS 오리진, 앱 제목/버전) |

### 라우터 (Mock 응답)
| 파일 | 엔드포인트 수 | 설명 |
|------|:-----------:|------|
| `backend/routers/customer.py` | 5 | 고객 API (인증, 메뉴, 주문) |
| `backend/routers/admin.py` | 14 | 관리자 API (인증, 테이블, 주문, 메뉴) |
| `backend/routers/sse.py` | 1 | SSE 이벤트 스트림 |

### 서비스 인터페이스 (ABC)
| 파일 | 클래스 | 메서드 수 |
|------|--------|:--------:|
| `backend/services/auth_service.py` | AuthServiceBase | 5 |
| `backend/services/menu_service.py` | MenuServiceBase | 6 |
| `backend/services/order_service.py` | OrderServiceBase | 6 |
| `backend/services/table_service.py` | TableServiceBase | 5 |
| `backend/services/event_bus.py` | EventBusBase | 3 |

### 미들웨어
| 파일 | 설명 |
|------|------|
| `backend/middleware/error_handler.py` | 전역 예외 핸들러 (500 응답) |

### 테스트
| 파일 | 테스트 수 | 설명 |
|------|:--------:|------|
| `backend/tests/test_customer_api.py` | 6 | 고객 API 엔드포인트 테스트 |
| `backend/tests/test_admin_api.py` | 14 | 관리자 API 엔드포인트 테스트 |
| `backend/tests/test_sse.py` | 2 | SSE + Health Check 테스트 |

### 패키지 초기화
| 파일 |
|------|
| `backend/routers/__init__.py` |
| `backend/services/__init__.py` |
| `backend/middleware/__init__.py` |

---

## API 엔드포인트 요약

### 고객 API (5개)
- `POST /api/stores/{id}/tables/auth` - 테이블 인증
- `GET /api/stores/{id}/menus` - 메뉴 목록
- `POST /api/stores/{id}/tables/{n}/orders` - 주문 생성
- `GET /api/stores/{id}/sessions/{sid}/orders` - 세션별 주문
- `GET /api/stores/{id}/orders/{oid}` - 주문 상세

### 관리자 API (14개)
- `POST /admin/login`, `POST /admin/logout`
- `GET /admin/tables`, `POST /admin/tables`
- `POST /admin/tables/{n}/session/start`, `POST /admin/tables/{n}/session/end`
- `GET /admin/tables/{n}/orders`, `GET /admin/tables/{n}/history`
- `PATCH /admin/orders/{id}/status`, `DELETE /admin/orders/{id}`
- `GET /admin/menus`, `POST /admin/menus`, `PUT /admin/menus/{id}`, `DELETE /admin/menus/{id}`

### SSE (1개)
- `GET /api/stores/{id}/events/orders` - 주문 이벤트 스트림

### 기타 (1개)
- `GET /health` - Health Check
