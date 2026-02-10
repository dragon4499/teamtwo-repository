# Tech Stack Decisions - Unit 2: Mock API & Core Structure

---

## 1. 웹 프레임워크

| 항목 | 결정 | 근거 |
|------|------|------|
| 프레임워크 | **FastAPI** >= 0.110.0 | 비동기 지원, 자동 OpenAPI 문서, Pydantic 통합 |
| ASGI 서버 | **uvicorn[standard]** >= 0.27.0 | FastAPI 공식 권장, HTTP/1.1 + WebSocket |
| SSE 라이브러리 | **sse-starlette** >= 2.0.0 | FastAPI/Starlette 호환 SSE 지원 |

---

## 2. 테스트 라이브러리 (추가)

| 라이브러리 | 버전 | 용도 | 선택 근거 |
|-----------|------|------|----------|
| **httpx** | >= 0.27.0 | 비동기 HTTP 테스트 클라이언트 | FastAPI AsyncClient 호환 |

> Unit 1에서 이미 포함된 pytest, pytest-asyncio, pytest-cov는 그대로 사용

---

## 3. requirements.txt (Unit 2 추가분)

```
# Unit 1 기존
pydantic>=2.0.0
aiofiles>=23.0.0
bcrypt>=4.0.0

# Unit 2 추가 - Web Framework
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
sse-starlette>=2.0.0

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-cov>=5.0.0
httpx>=0.27.0
```

---

## 4. 프로젝트 구조 (Unit 2 추가분)

```
backend/
├── main.py                    # FastAPI 앱 진입점 (NEW)
├── config.py                  # 설정 (NEW)
├── routers/
│   ├── __init__.py            # (NEW)
│   ├── customer.py            # CustomerRouter (NEW)
│   ├── admin.py               # AdminRouter (NEW)
│   └── sse.py                 # SSERouter (NEW)
├── services/
│   ├── __init__.py            # (NEW)
│   ├── auth_service.py        # AuthServiceBase 인터페이스 (NEW)
│   ├── menu_service.py        # MenuServiceBase 인터페이스 (NEW)
│   ├── order_service.py       # OrderServiceBase 인터페이스 (NEW)
│   ├── table_service.py       # TableServiceBase 인터페이스 (NEW)
│   └── event_bus.py           # EventBusBase 인터페이스 (NEW)
├── middleware/
│   ├── __init__.py            # (NEW)
│   └── error_handler.py       # 전역 예외 핸들러 (NEW)
├── tests/
│   ├── test_customer_api.py   # 고객 API 테스트 (NEW)
│   ├── test_admin_api.py      # 관리자 API 테스트 (NEW)
│   └── test_sse.py            # SSE 테스트 (NEW)
├── models/                    # (Unit 1 기존)
├── data/                      # (Unit 1 기존)
├── exceptions.py              # (Unit 1 기존)
└── requirements.txt           # (업데이트)
```
