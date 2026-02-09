# Code Summary - Unit 3: Backend Business Logic

---

## 개요
Unit 2의 Mock 응답을 실제 비즈니스 로직으로 교체했습니다.
서비스 인터페이스(ABC)를 실제 구현 클래스로 교체하고, Router를 Service 연동으로 수정했습니다.

## 수정/생성된 파일 목록

### 설정 및 공통
| 파일 | 변경 | 설명 |
|------|------|------|
| `backend/config.py` | 수정 | JWT 설정, bcrypt cost, session expire 추가 |
| `backend/exceptions.py` | 수정 | AuthenticationError 추가 |
| `backend/models/enums.py` | 수정 | OrderStatus preparing→pending 전이 허용 |
| `backend/requirements.txt` | 수정 | PyJWT 추가 |

### 서비스 구현 (Mock → 실제)
| 파일 | 변경 | 주요 기능 |
|------|------|----------|
| `backend/services/event_bus.py` | 재작성 | asyncio.Queue 기반 Pub/Sub, 매장별 구독자 관리 |
| `backend/services/auth_service.py` | 재작성 | JWT 토큰 생성/검증, bcrypt 비밀번호, 토큰 블랙리스트 |
| `backend/services/menu_service.py` | 재작성 | 메뉴 CRUD, 소프트 삭제, 데이터 검증 |
| `backend/services/order_service.py` | 재작성 | 주문 생성(가격 스냅샷), 상태 전이, EventBus 이벤트 발행 |
| `backend/services/table_service.py` | 재작성 | 세션 생명주기, 종료 시 이력 아카이빙 |

### 미들웨어 및 DI
| 파일 | 변경 | 설명 |
|------|------|------|
| `backend/middleware/auth.py` | 신규 | Bearer 토큰 추출 Dependency |
| `backend/middleware/error_handler.py` | 재작성 | NotFound, Validation, Auth, Duplicate 등 핸들러 |
| `backend/dependencies.py` | 신규 | 싱글톤 서비스 인스턴스, FastAPI Depends 함수 |

### 라우터 (Mock → Service 연동)
| 파일 | 변경 | 설명 |
|------|------|------|
| `backend/routers/customer.py` | 재작성 | Service Depends 주입, 실제 비즈니스 로직 호출 |
| `backend/routers/admin.py` | 재작성 | JWT 인증 + Service 연동 |
| `backend/routers/sse.py` | 재작성 | EventBus 실시간 이벤트 스트림 |
| `backend/main.py` | 재작성 | 커스텀 예외 핸들러 등록 |

### 단위 테스트
| 파일 | 테스트 수 | 설명 |
|------|:--------:|------|
| `backend/tests/test_event_bus.py` | 5 | EventBus publish/subscribe/unsubscribe |
| `backend/tests/test_auth_service.py` | 5+ | 로그인, 토큰 검증, 블랙리스트, 테이블 인증 |
| `backend/tests/test_menu_service.py` | 5+ | 메뉴 CRUD, 소프트 삭제, 검증 |
| `backend/tests/test_order_service.py` | 9 | 주문 생성, 상태 전이, 삭제, 세션/테이블별 조회 |
| `backend/tests/test_table_service.py` | 8 | 테이블 생성, 세션 시작/종료, 이력 조회 |

### 통합 테스트
| 파일 | 테스트 수 | 설명 |
|------|:--------:|------|
| `backend/tests/test_integration_order_flow.py` | 5 | 주문 생성→상태변경→이벤트 발행 흐름 |
| `backend/tests/test_integration_session_flow.py` | 6 | 테이블→세션→주문→종료→이력 흐름 |

---

## 주요 설계 결정 반영

| 결정 사항 | 구현 |
|-----------|------|
| 유연한 주문 상태 전이 | pending ↔ preparing → completed |
| 로그인 시도 제한 없음 (MVP) | 제한 로직 미구현 |
| 주문번호 형식 | YYYYMMDD-NNNNN |
| 세션 종료 시 주문 처리 | 현재 상태 그대로 이력 이동 |
| 메뉴 삭제 방식 | 소프트 삭제 (is_available=false) |
| 토큰 만료 시간 | Admin 24h, Table Session 16h |
| 이벤트 전달 방식 | Best-effort (큐 가득 시 drop) |
| 비밀번호 해싱 | bcrypt (admin + table 모두) |
