# Code Generation Plan - Unit 2: Mock API & Core Structure

## 코드 생성 방식: Standard (일반 방식)

---

## 실행 단계

### Step 1: 프로젝트 구조 및 설정
- [x] `backend/config.py` 생성 (앱 설정)
- [x] `backend/routers/__init__.py` 생성
- [x] `backend/services/__init__.py` 생성
- [x] `backend/middleware/__init__.py` 생성

### Step 2: Service 인터페이스 정의
- [x] `backend/services/auth_service.py` (AuthServiceBase ABC)
- [x] `backend/services/menu_service.py` (MenuServiceBase ABC)
- [x] `backend/services/order_service.py` (OrderServiceBase ABC)
- [x] `backend/services/table_service.py` (TableServiceBase ABC)
- [x] `backend/services/event_bus.py` (EventBusBase ABC)

### Step 3: 미들웨어
- [x] `backend/middleware/error_handler.py` (전역 예외 핸들러)

### Step 4: 고객 API 라우터
- [x] `backend/routers/customer.py` (CustomerRouter - Mock 응답 6개 엔드포인트)

### Step 5: 관리자 API 라우터
- [x] `backend/routers/admin.py` (AdminRouter - Mock 응답 14개 엔드포인트)

### Step 6: SSE 라우터
- [x] `backend/routers/sse.py` (SSERouter - Mock 이벤트 스트림)

### Step 7: FastAPI 앱 진입점
- [x] `backend/main.py` (앱 초기화, 라우터 등록, CORS, Health Check)

### Step 8: 테스트 fixtures 업데이트
- [x] `backend/tests/conftest.py` 업데이트 (AsyncClient fixture 추가)

### Step 9: 고객 API 테스트
- [x] `backend/tests/test_customer_api.py`

### Step 10: 관리자 API 테스트
- [x] `backend/tests/test_admin_api.py`

### Step 11: SSE 테스트
- [x] `backend/tests/test_sse.py`

### Step 12: 코드 요약 문서
- [x] `aidlc-docs/construction/unit2-mock-api/code/code-summary.md`
