# Tech Stack Decisions - Unit 1: DataStore

---

## 1. 런타임 환경

| 항목 | 결정 | 근거 |
|------|------|------|
| Python 버전 | **3.13** | 최신 안정 버전, 성능 개선 (JIT 실험적 지원) |
| 패키지 관리 | pip + requirements.txt | MVP 단순화, 추후 Poetry 전환 가능 |

---

## 2. 핵심 라이브러리

| 라이브러리 | 버전 | 용도 | 선택 근거 |
|-----------|------|------|----------|
| **pydantic** | v2 (최신) | 데이터 모델 검증 | 타입 안전, 자동 검증, JSON 직렬화 |
| **aiofiles** | 최신 | 비동기 파일 I/O | asyncio 호환, 논블로킹 파일 읽기/쓰기 |
| **bcrypt** | 최신 | 비밀번호 해싱 | 업계 표준, cost factor 조절 가능 |

---

## 3. 테스트 프레임워크

| 라이브러리 | 버전 | 용도 | 선택 근거 |
|-----------|------|------|----------|
| **pytest** | 최신 | 테스트 실행기 | Python 표준 테스트 프레임워크 |
| **pytest-asyncio** | 최신 | 비동기 테스트 지원 | async/await 테스트 필수 |
| **pytest-cov** | 최신 | 커버리지 측정 | 테스트 커버리지 리포트 |

---

## 4. 개발 도구

| 도구 | 용도 | 비고 |
|------|------|------|
| **ruff** | Linter + Formatter | PEP 8 준수, 빠른 실행 |
| **mypy** | 정적 타입 검사 | 타입 힌트 검증 (선택적) |

---

## 5. requirements.txt (Unit 1)

```
# Core
pydantic>=2.0.0
aiofiles>=23.0.0
bcrypt>=4.0.0

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-cov>=5.0.0

# Development (optional)
ruff>=0.4.0
```

---

## 6. 프로젝트 구조 (Unit 1 범위)

```
backend/
├── models/
│   ├── __init__.py
│   ├── schemas.py          # Pydantic 데이터 모델
│   └── enums.py            # Enum 정의 (OrderStatus 등)
├── data/
│   ├── __init__.py
│   ├── datastore.py        # DataStore 클래스
│   └── seed.py             # 시드 데이터 스크립트
├── exceptions.py           # 커스텀 예외 클래스
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # pytest fixtures
│   ├── test_datastore.py   # DataStore 단위 테스트
│   ├── test_models.py      # 모델 검증 테스트
│   └── test_seed.py        # 시드 데이터 테스트
├── requirements.txt
└── pytest.ini              # pytest 설정
```

---

## 7. Python 3.13 호환성 참고사항

| 항목 | 상태 | 비고 |
|------|------|------|
| pydantic v2 | ✅ 호환 | Python 3.13 공식 지원 |
| aiofiles | ✅ 호환 | 순수 Python, 버전 무관 |
| bcrypt | ✅ 호환 | C 확장, 3.13 빌드 제공 |
| pytest | ✅ 호환 | 3.13 공식 지원 |
| asyncio | ✅ 내장 | Python 표준 라이브러리 |

---

## 8. 설정 관리

### 8.1 환경 변수 (Unit 1 범위)
| 변수 | 기본값 | 설명 |
|------|--------|------|
| `DATA_BASE_PATH` | `data` | 데이터 파일 루트 경로 |
| `BCRYPT_COST` | `10` | bcrypt cost factor |
| `LOCK_TIMEOUT` | `5` | Lock 획득 타임아웃 (초) |
| `LOG_LEVEL` | `INFO` | 로깅 레벨 |

### 8.2 설정 로드 방식
- 환경 변수 우선, 없으면 기본값 사용
- Pydantic `BaseSettings` 활용 가능 (선택적)
