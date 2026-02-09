# Code Summary - Unit 1: DataStore

## 생성된 파일 목록

### 설정 파일
| 파일 | 설명 |
|------|------|
| `backend/requirements.txt` | Python 의존성 (pydantic, aiofiles, bcrypt, pytest) |
| `backend/pytest.ini` | pytest 설정 (asyncio_mode=auto) |

### 소스 코드
| 파일 | 설명 |
|------|------|
| `backend/models/enums.py` | OrderStatus, SessionStatus, UserRole Enum |
| `backend/models/schemas.py` | 8개 Pydantic 모델 (Store~OrderHistory) |
| `backend/exceptions.py` | 5개 커스텀 예외 클래스 |
| `backend/data/datastore.py` | DataStore 클래스 (CRUD 6개 메서드 + Lock + AtomicWrite) |
| `backend/data/seed.py` | 시드 데이터 (매장1 + 관리자1 + 메뉴12) |

### 테스트 코드
| 파일 | 테스트 수 | 설명 |
|------|:--------:|------|
| `backend/tests/conftest.py` | - | 공통 fixtures (datastore, seeded_datastore 등) |
| `backend/tests/test_datastore.py` | 13 | CRUD 단위 테스트 |
| `backend/tests/test_datastore_lock.py` | 4 | 동시성/Lock 테스트 |
| `backend/tests/test_models.py` | 27 | Pydantic 모델 검증 테스트 |
| `backend/tests/test_seed.py` | 6 | 시드 데이터 테스트 |

## 구현 요약
- DataStore: asyncio.Lock 기반 동시성 제어, aiofiles 비동기 I/O, 원자적 쓰기 (tmp → os.replace)
- Pydantic v2: 타입 안전 + 자동 검증 + field_validator/model_validator
- bcrypt cost 10: AdminUser, Table 비밀번호 해싱
- 로깅: Python logging (표준 - 오류 + 쓰기 연산)
- 테스트: tmp_path 기반 격리, pytest-asyncio
