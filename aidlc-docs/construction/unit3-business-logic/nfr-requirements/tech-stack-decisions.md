# Tech Stack Decisions - Unit 3: Backend Business Logic

> Unit 1/2의 기술 스택을 계승하며, Unit 3에서 추가되는 라이브러리만 정의합니다.

---

## 1. 추가 라이브러리

| 라이브러리 | 버전 | 용도 | 선택 근거 |
|-----------|------|------|----------|
| **PyJWT** | >= 2.8.0 | JWT 토큰 생성/검증 | 경량, 표준 JWT 구현 |

> bcrypt, pydantic, aiofiles 등은 Unit 1에서 이미 포함

---

## 2. requirements.txt (Unit 3 추가분)

```
# Unit 1 기존
pydantic>=2.0.0
aiofiles>=23.0.0
bcrypt>=4.0.0

# Unit 2 기존
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
sse-starlette>=2.0.0

# Unit 3 추가
PyJWT>=2.8.0

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-cov>=5.0.0
httpx>=0.27.0
```

---

## 3. 환경 변수 (Unit 3 추가분)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `JWT_SECRET_KEY` | (필수, 기본값 없음) | JWT 서명 키 |
| `JWT_ALGORITHM` | `HS256` | JWT 알고리즘 |
| `ADMIN_TOKEN_EXPIRE_HOURS` | `24` | 관리자 토큰 만료 시간 |
| `TABLE_SESSION_EXPIRE_HOURS` | `16` | 테이블 세션 만료 시간 |

> Unit 1의 `DATA_BASE_PATH`, `BCRYPT_COST`, `LOCK_TIMEOUT`, `LOG_LEVEL`은 그대로 유지

---

## 4. 프로젝트 구조 (Unit 3 변경분)

```
backend/
├── main.py                    # FastAPI 앱 (Unit 2, 수정: Service DI 추가)
├── config.py                  # 설정 (수정: JWT 설정 추가)
├── exceptions.py              # 예외 (수정: AuthenticationError 추가)
├── routers/
│   ├── customer.py            # (수정: Mock → Service 연동)
│   ├── admin.py               # (수정: Mock → Service 연동)
│   └── sse.py                 # (수정: Mock → EventBus 연동)
├── services/
│   ├── auth_service.py        # (수정: 인터페이스 → 실제 구현)
│   ├── menu_service.py        # (수정: 인터페이스 → 실제 구현)
│   ├── order_service.py       # (수정: 인터페이스 → 실제 구현)
│   ├── table_service.py       # (수정: 인터페이스 → 실제 구현)
│   └── event_bus.py           # (수정: 인터페이스 → 실제 구현)
├── middleware/
│   ├── auth.py                # (신규: 실제 JWT/세션 검증 미들웨어)
│   └── error_handler.py       # (수정: 커스텀 예외 핸들러 추가)
├── tests/
│   ├── test_auth_service.py   # (신규)
│   ├── test_menu_service.py   # (신규)
│   ├── test_order_service.py  # (신규)
│   ├── test_table_service.py  # (신규)
│   ├── test_event_bus.py      # (신규)
│   ├── test_integration_order_flow.py   # (신규)
│   └── test_integration_session_flow.py # (신규)
├── models/                    # (Unit 1 기존, 변경 없음)
├── data/                      # (Unit 1 기존, 변경 없음)
└── requirements.txt           # (업데이트: PyJWT 추가)
```

---

## 5. 의존성 주입 (DI) 패턴

```python
# main.py에서 Service 인스턴스 생성 및 주입
datastore = DataStore(base_path=DATA_DIR)
event_bus = EventBus()

auth_service = AuthService(datastore=datastore)
menu_service = MenuService(datastore=datastore)
order_service = OrderService(datastore=datastore, event_bus=event_bus, menu_service=menu_service)
table_service = TableService(datastore=datastore, order_service=order_service)

# FastAPI Depends를 통해 Router에 주입
```

- 생성자 주입 방식 (Constructor Injection)
- FastAPI의 `Depends()` 활용
- 테스트 시 Mock 주입 용이
