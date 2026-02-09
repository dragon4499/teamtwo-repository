# NFR Design Patterns - Unit 2: Mock API & Core Structure

---

## 1. API 구조 패턴

### 1.1 Router Separation Pattern (라우터 분리)

기능 영역별로 라우터를 분리하여 코드 관리성을 높입니다.

```
FastAPI App
  ├── CustomerRouter  (/api/stores/{store_id}/...)
  ├── AdminRouter     (/api/stores/{store_id}/admin/...)
  └── SSERouter       (/api/stores/{store_id}/events/...)
```

**적용**: `routers/customer.py`, `routers/admin.py`, `routers/sse.py`

### 1.2 Service Interface Pattern (서비스 인터페이스)

ABC 기반 추상 클래스로 서비스 인터페이스를 정의합니다. Unit 2에서는 인터페이스만 정의하고, Unit 3에서 실제 구현으로 교체합니다.

```
[Router] → [ServiceBase (ABC)] ← [MockImpl (Unit 2)] / [RealImpl (Unit 3)]
```

**적용**: `services/auth_service.py`, `services/menu_service.py`, `services/order_service.py`, `services/table_service.py`, `services/event_bus.py`

---

## 2. 오류 처리 패턴

### 2.1 Global Exception Handler Pattern (전역 예외 핸들러)

모든 미처리 예외를 캐치하여 표준화된 오류 응답을 반환합니다.

```
[요청] → [라우터] → [예외 발생]
                        |
                        v
              [Global Exception Handler]
                        |
                        v
              [{"detail": "Internal server error"}]
              [HTTP 500]
```

**구현**:
```python
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

**적용**: `middleware/error_handler.py`

---

## 3. SSE 패턴

### 3.1 SSE Generator Pattern (SSE 제너레이터)

async generator를 사용하여 SSE 이벤트를 스트리밍합니다.

```
[클라이언트 연결] → [EventSourceResponse]
                        |
                        v
              [async generator]
                  |
                  ├── [Mock 이벤트 1개 전송]
                  └── [keep-alive 루프 (30초 간격)]
                        |
                        v (클라이언트 해제)
                  [generator 종료]
```

**적용**: `routers/sse.py`

### 3.2 Graceful Disconnect Pattern (우아한 연결 해제)

클라이언트 연결 해제 시 리소스를 정리합니다.

```python
async def event_generator():
    try:
        yield mock_event
        while True:
            await asyncio.sleep(30)
            yield ": keep-alive\n\n"
    except asyncio.CancelledError:
        pass  # 클라이언트 연결 해제
```

---

## 4. 테스트 패턴

### 4.1 AsyncClient Test Pattern (비동기 클라이언트 테스트)

httpx AsyncClient를 사용하여 FastAPI 엔드포인트를 테스트합니다.

```python
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_get_menus(client):
    response = await client.get("/api/stores/store001/menus")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

**적용**: `tests/test_customer_api.py`, `tests/test_admin_api.py`, `tests/test_sse.py`
