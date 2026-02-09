# Code Generation Plan - Unit 1: DataStore

## 유닛 컨텍스트
- **유닛**: Unit 1 - DataStore (파일 기반 데이터 저장소)
- **방식**: Standard (일반 방식)
- **프로젝트 타입**: Greenfield
- **코드 위치**: `backend/` (워크스페이스 루트)
- **의존성**: 없음 (독립 유닛)
- **스토리**: 기반 인프라 유닛 (직접 스토리 없음, 모든 데이터 스토리의 기반)

## 기술 스택
- Python 3.13, Pydantic v2, aiofiles, bcrypt
- pytest, pytest-asyncio, pytest-cov

---

## 코드 생성 단계

### Step 1: 프로젝트 구조 및 설정 파일
- [x] `backend/requirements.txt` 생성
- [x] `backend/pytest.ini` 생성
- [x] `backend/__init__.py` 생성
- [x] `backend/models/__init__.py` 생성
- [x] `backend/data/__init__.py` 생성
- [x] `backend/tests/__init__.py` 생성

### Step 2: Enum 정의
- [x] `backend/models/enums.py` 생성
  - OrderStatus (pending, preparing, completed)
  - SessionStatus (active, ended)
  - UserRole (admin, staff)

### Step 3: 커스텀 예외 클래스
- [x] `backend/exceptions.py` 생성
  - NotFoundError, ValidationError, DuplicateError, ConcurrencyError, DataCorruptionError

### Step 4: Pydantic 데이터 모델
- [x] `backend/models/schemas.py` 생성
  - Store, AdminUser, Menu, Table, TableSession, Order, OrderItem, OrderHistory
  - 모든 제약조건 및 검증 규칙 포함

### Step 5: DataStore 클래스
- [x] `backend/data/datastore.py` 생성
  - DataStore 클래스 (read, write, find_by_id, append, update, delete)
  - 내부: LockManager, FileIO, PathResolver, AtomicWriter
  - asyncio.Lock + wait_for 타임아웃
  - aiofiles 비동기 I/O
  - 구조화된 로깅

### Step 6: 시드 데이터
- [x] `backend/data/seed.py` 생성
  - seed_data() 함수
  - 기본 매장 (store001), 관리자 (admin), 메뉴 12개
  - 멱등성 보장

### Step 7: pytest Fixtures 및 설정
- [x] `backend/tests/conftest.py` 생성
  - datastore fixture (tmp_path 기반)
  - seeded_datastore fixture
  - sample_store, sample_menu fixtures

### Step 8: DataStore CRUD 단위 테스트
- [x] `backend/tests/test_datastore.py` 생성
  - read (빈 파일, 존재하는 파일)
  - write, find_by_id, append, update, delete
  - 파일 자동 생성, JSON 파싱 실패 처리

### Step 9: 동시성/Lock 테스트
- [x] `backend/tests/test_datastore_lock.py` 생성
  - 동시 쓰기 직렬화 검증
  - Lock 타임아웃 검증
  - 다른 엔티티 병렬 접근 검증

### Step 10: Pydantic 모델 테스트
- [x] `backend/tests/test_models.py` 생성
  - 각 엔티티 유효/무효 데이터 검증
  - Enum 값 검증
  - 제약조건 경계값 테스트

### Step 11: 시드 데이터 테스트
- [x] `backend/tests/test_seed.py` 생성
  - 시드 실행 검증
  - 멱등성 검증 (2회 실행)
  - 시드 데이터 내용 검증

### Step 12: 코드 생성 요약 문서
- [x] `aidlc-docs/construction/unit1-datastore/code/code-summary.md` 생성
  - 생성된 파일 목록, 구현 요약
