# Logical Components - Unit 1: DataStore

---

## 1. 컴포넌트 아키텍처 개요

```
+----------------------------------------------------------+
|                    DataStore (Public API)                  |
|  read() | write() | find_by_id() | append() | update()   |
|  delete()                                                 |
+----------------------------------------------------------+
      |              |              |              |
      v              v              v              v
+-----------+  +-----------+  +-----------+  +-----------+
| LockMgr   |  | FileIO    |  | PathResolver| | Logger   |
| (동시성)   |  | (파일I/O) |  | (경로결정)  | | (로깅)   |
+-----------+  +-----------+  +-----------+  +-----------+
                     |
                     v
              +-----------+
              | AtomicWriter|
              | (원자적쓰기)|
              +-----------+
```

---

## 2. 내부 컴포넌트 상세

### 2.1 DataStore (Public API)

외부에 노출되는 유일한 클래스입니다. 모든 데이터 접근은 이 클래스를 통합니다.

| 메서드 | 설명 | 반환 |
|--------|------|------|
| `read(entity, store_id)` | 전체 데이터 읽기 | `list[dict]` |
| `write(entity, store_id, data)` | 전체 데이터 쓰기 | `None` |
| `find_by_id(entity, store_id, id)` | ID로 단건 조회 | `dict \| None` |
| `append(entity, store_id, record)` | 레코드 추가 | `None` |
| `update(entity, store_id, id, data)` | 레코드 수정 | `dict` |
| `delete(entity, store_id, id)` | 레코드 삭제 | `None` |

**생성자 파라미터**:
```python
DataStore(
    base_path: str = "data",
    lock_timeout: float = 5.0
)
```

### 2.2 LockManager (내부 컴포넌트)

동시성 제어를 담당하는 내부 로직입니다. 별도 클래스가 아닌 DataStore 내부 메서드로 구현합니다.

**책임**:
- 엔티티+매장 조합별 Lock 인스턴스 관리 (lazy 생성)
- `asyncio.wait_for` 기반 타임아웃 처리
- `@asynccontextmanager` 기반 안전한 Lock 획득/해제

**내부 메서드**:
| 메서드 | 설명 |
|--------|------|
| `_get_lock(entity, store_id)` | Lock 인스턴스 반환 (없으면 생성) |
| `_acquire_lock(entity, store_id)` | 타임아웃 포함 Lock 획득 |
| `_locked(entity, store_id)` | async context manager |

**Lock 레지스트리**: `dict[str, asyncio.Lock]`
- Key 형식: `"{entity}_{store_id}"` (예: `"orders_store001"`)

### 2.3 FileIO (내부 컴포넌트)

파일 읽기/쓰기를 담당하는 내부 로직입니다. DataStore 내부 메서드로 구현합니다.

**책임**:
- aiofiles 기반 비동기 파일 읽기
- JSON 파싱 및 직렬화
- 파싱 실패 시 빈 배열 반환 + ERROR 로깅

**내부 메서드**:
| 메서드 | 설명 |
|--------|------|
| `_read_file(file_path)` | 파일 읽기 + JSON 파싱 |
| `_atomic_write(file_path, data)` | 원자적 쓰기 (tmp → replace) |

### 2.4 PathResolver (내부 컴포넌트)

파일 경로를 결정하는 내부 로직입니다.

**경로 규칙**:
| 엔티티 | 경로 |
|--------|------|
| stores | `{base_path}/stores.json` |
| 기타 | `{base_path}/{store_id}/{entity}.json` |

**내부 메서드**:
| 메서드 | 설명 |
|--------|------|
| `_get_file_path(entity, store_id)` | 파일 경로 반환 |
| `_ensure_directory(file_path)` | 디렉토리 자동 생성 |

### 2.5 Logger (횡단 관심사)

Python 표준 logging 모듈을 사용한 구조화된 로깅입니다.

**설정**:
```python
logger = logging.getLogger("datastore")
```

**로깅 포맷**: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

---

## 3. 외부 컴포넌트

### 3.1 Pydantic Models (models/)

DataStore와 독립적인 데이터 검증 계층입니다.

| 파일 | 내용 |
|------|------|
| `models/schemas.py` | Store, AdminUser, Menu, Table, TableSession, Order, OrderItem, OrderHistory |
| `models/enums.py` | OrderStatus, SessionStatus, UserRole |

**역할**: DataStore에 저장하기 전 데이터 검증. DataStore 자체는 `dict`를 다루며, Pydantic 검증은 Service Layer에서 수행합니다.

### 3.2 Exceptions (exceptions.py)

커스텀 예외 클래스 정의입니다.

| 예외 | 발생 위치 | 설명 |
|------|----------|------|
| `NotFoundError` | update, delete | ID 미발견 |
| `ValidationError` | Pydantic models | 검증 실패 |
| `DuplicateError` | Service Layer | 중복 데이터 |
| `ConcurrencyError` | _acquire_lock | Lock 타임아웃 |
| `DataCorruptionError` | _read_file | JSON 파싱 실패 (로깅용) |

### 3.3 Seed Data (data/seed.py)

초기 데이터 시딩 스크립트입니다.

**멱등성 보장**: 데이터가 이미 존재하면 건너뜀
**시드 내용**: 매장 1개 + 관리자 1명 + 메뉴 12개 + 빈 파일 초기화

---

## 4. 테스트 인프라 컴포넌트

### 4.1 pytest Fixtures (tests/conftest.py)

| Fixture | Scope | 설명 |
|---------|-------|------|
| `datastore` | function | 임시 디렉토리 기반 격리된 DataStore 인스턴스 |
| `seeded_datastore` | function | 시드 데이터가 포함된 DataStore 인스턴스 |
| `sample_store` | function | 테스트용 Store dict |
| `sample_menu` | function | 테스트용 Menu dict |

**격리 전략**: `tmp_path` (pytest 내장) 사용, 각 테스트마다 독립 디렉토리

### 4.2 테스트 파일 구조

```
backend/tests/
├── __init__.py
├── conftest.py              # 공통 fixtures
├── test_datastore.py        # DataStore CRUD 단위 테스트
├── test_datastore_lock.py   # 동시성/Lock 테스트
├── test_models.py           # Pydantic 모델 검증 테스트
└── test_seed.py             # 시드 데이터 테스트
```

### 4.3 테스트 범위

| 테스트 파일 | 테스트 항목 |
|------------|-----------|
| test_datastore.py | read(빈/존재), write, find_by_id, append, update, delete, 파일 자동 생성, JSON 파싱 실패 |
| test_datastore_lock.py | 동시 쓰기 직렬화, Lock 타임아웃, 다른 엔티티 병렬 접근 |
| test_models.py | 각 엔티티 유효/무효 데이터, Enum 값, 제약조건 경계값 |
| test_seed.py | 시드 실행, 멱등성 (2회 실행), 시드 데이터 내용 검증 |

---

## 5. 파일 구조 요약

```
backend/
├── models/
│   ├── __init__.py
│   ├── schemas.py           # Pydantic 데이터 모델
│   └── enums.py             # Enum 정의
├── data/
│   ├── __init__.py
│   ├── datastore.py         # DataStore 클래스 (LockMgr, FileIO, PathResolver 포함)
│   └── seed.py              # 시드 데이터
├── exceptions.py            # 커스텀 예외
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures
│   ├── test_datastore.py    # CRUD 테스트
│   ├── test_datastore_lock.py # 동시성 테스트
│   ├── test_models.py       # 모델 테스트
│   └── test_seed.py         # 시드 테스트
├── requirements.txt
└── pytest.ini
```
