# Unit 3: Business Logic - Code Generation Plan (Standard)

## 개요
Unit 2의 Mock 응답을 실제 비즈니스 로직으로 교체합니다.
기존 Service 인터페이스(ABC)를 실제 구현 클래스로 교체하고,
Router를 Service 연동으로 수정합니다.

## 스토리 매핑
- 2.1.1, 2.1.2: 관리자 인증 (AuthService)
- 3.1.1~3.1.4: 메뉴 CRUD (MenuService)
- 1.4.2, 2.2.1, 2.2.4, 2.3.2: 주문 처리 (OrderService)
- 1.1.1, 1.1.2, 2.3.1, 2.3.3, 2.3.4: 테이블/세션 (TableService)
- EventBus: SSE 실시간 이벤트

## 의존성
- Unit 1 (DataStore): 완료 ✅
- Unit 2 (Mock API): 완료 ✅

---

## Steps

### Step 1: 설정 및 예외 업데이트
- [x] `backend/config.py` 수정: JWT 설정 추가
- [x] `backend/exceptions.py` 수정: AuthenticationError 추가
- [x] `backend/models/enums.py` 수정: OrderStatus.valid_transitions에 preparing→pending 추가
- [x] `backend/requirements.txt` 수정: PyJWT 추가

### Step 2: EventBus 구현
- [x] `backend/services/event_bus.py` 수정: EventBusBase → EventBus 실제 구현
  - asyncio.Queue 기반 Pub/Sub
  - 매장별 구독자 관리
  - Fan-out 이벤트 전달

### Step 3: AuthService 구현
- [x] `backend/services/auth_service.py` 수정: AuthServiceBase → AuthService 실제 구현
  - JWT 토큰 생성/검증 (PyJWT)
  - bcrypt 비밀번호 검증
  - 인메모리 토큰 블랙리스트
  - 테이블 인증 및 세션 검증

### Step 4: MenuService 구현
- [x] `backend/services/menu_service.py` 수정: MenuServiceBase → MenuService 실제 구현
  - 메뉴 CRUD (DataStore 연동)
  - 소프트 삭제 (is_available = false)
  - 데이터 검증

### Step 5: OrderService 구현
- [x] `backend/services/order_service.py` 수정: OrderServiceBase → OrderService 실제 구현
  - 주문 생성 (메뉴 검증, 가격 스냅샷, 주문번호 생성)
  - 상태 전이 검증 (유연한 전이)
  - EventBus 이벤트 발행
  - 주문 조회/삭제

### Step 6: TableService 구현
- [x] `backend/services/table_service.py` 수정: TableServiceBase → TableService 실제 구현
  - 테이블 등록 (bcrypt 해싱)
  - 세션 시작/종료
  - 세션 종료 시 주문 이력 이동
  - 과거 이력 조회

### Step 7: 인증 미들웨어 구현
- [x] `backend/middleware/auth.py` 신규 생성
  - get_current_admin() — JWT 토큰 검증 Dependency
  - get_current_session() — 세션 검증 Dependency
  - TokenBlacklist 클래스

### Step 8: DI (의존성 주입) 설정
- [x] `backend/dependencies.py` 신규 생성
  - 싱글톤 서비스 인스턴스 관리
  - FastAPI Depends 함수들

### Step 9: Error Handler 확장
- [x] `backend/middleware/error_handler.py` 수정
  - NotFoundError, ValidationError, AuthenticationError, DuplicateError 핸들러 추가

### Step 10: Router 교체 - Customer
- [x] `backend/routers/customer.py` 수정: Mock → Service 연동
  - Depends를 통한 Service 주입
  - 실제 비즈니스 로직 호출

### Step 11: Router 교체 - Admin
- [x] `backend/routers/admin.py` 수정: Mock → Service 연동
  - JWT 인증 Dependency 적용
  - 실제 비즈니스 로직 호출

### Step 12: Router 교체 - SSE
- [x] `backend/routers/sse.py` 수정: Mock → EventBus 연동
  - 실제 이벤트 스트림

### Step 13: main.py 업데이트
- [x] `backend/main.py` 수정
  - 커스텀 예외 핸들러 등록
  - 시드 데이터 초기화 (startup event)

### Step 14: Service 단위 테스트
- [x] `backend/tests/test_auth_service.py` 신규
- [x] `backend/tests/test_menu_service.py` 신규
- [x] `backend/tests/test_order_service.py` 신규
- [x] `backend/tests/test_table_service.py` 신규
- [x] `backend/tests/test_event_bus.py` 신규

### Step 15: 통합 테스트
- [x] `backend/tests/test_integration_order_flow.py` 신규
- [x] `backend/tests/test_integration_session_flow.py` 신규

### Step 16: requirements.txt 최종 확인 및 문서화
- [x] `backend/requirements.txt` 최종 확인
- [x] `aidlc-docs/construction/unit3-business-logic/code/code-summary.md` 생성
