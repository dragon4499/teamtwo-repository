# NFR Design Patterns - Unit 1: DataStore

---

## 1. 신뢰성 패턴

### 1.1 Atomic Write Pattern (원자적 쓰기)

데이터 손실을 방지하기 위한 2단계 쓰기 패턴입니다.

```
[데이터] → [임시 파일 쓰기] → [os.replace 원자적 교체] → [완료]
                |                       |
                ↓ (실패)                ↓ (실패)
         [임시 파일 삭제]         [원본 파일 유지]
         [IOError 발생]          [IOError 발생]
```

**구현 상세**:
```python
async def _atomic_write(self, file_path: Path, data: list[dict]) -> None:
    tmp_path = file_path.with_suffix(file_path.suffix + ".tmp")
    try:
        async with aiofiles.open(tmp_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(data, ensure_ascii=False, indent=2))
        os.replace(str(tmp_path), str(file_path))
    except Exception:
        # 임시 파일 정리
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        raise
```

**적용 위치**: `DataStore.write()`, `DataStore.append()`, `DataStore.update()`, `DataStore.delete()`

### 1.2 Graceful Degradation Pattern (우아한 성능 저하)

파일 손상 시 서비스를 중단하지 않고 빈 상태로 복구합니다.

```
[파일 읽기] → [JSON 파싱] → [성공] → [데이터 반환]
                  |
                  ↓ (파싱 실패)
           [ERROR 로그 기록]
           [빈 배열 [] 반환]
```

**설계 결정**: 백업 없이 빈 배열로 리셋 (MVP 단순화)
- 손상 파일 보존 없음
- 로그에 ERROR 레벨로 파일 경로와 오류 상세 기록
- 서비스 연속성 우선

### 1.3 Auto-Initialize Pattern (자동 초기화)

존재하지 않는 리소스를 자동으로 생성합니다.

```
[파일 접근] → [존재 확인] → [있음] → [정상 처리]
                  |
                  ↓ (없음)
           [디렉토리 생성 (필요 시)]
           [빈 배열 반환 또는 빈 파일 생성]
```

**적용**:
- `read()`: 파일 없으면 빈 리스트 반환
- `write()`: 디렉토리 없으면 `Path.mkdir(parents=True, exist_ok=True)`
- `seed_data()`: 데이터 없으면 초기 데이터 생성 (멱등)

---

## 2. 동시성 패턴

### 2.1 Fine-Grained Lock Pattern (세밀한 잠금)

엔티티 타입 + 매장 ID 조합으로 잠금 범위를 최소화합니다.

```
Lock Registry (dict):
  "orders_store001"   → asyncio.Lock()
  "menus_store001"    → asyncio.Lock()
  "sessions_store001" → asyncio.Lock()
  "orders_store002"   → asyncio.Lock()
  ...
```

**특성**:
- 서로 다른 엔티티 타입은 동시 접근 가능 (orders와 menus 동시 쓰기 OK)
- 서로 다른 매장은 동시 접근 가능
- 같은 엔티티+매장 조합만 직렬화
- Lock은 lazy 생성 (첫 접근 시)

### 2.2 Timeout-Guarded Lock Pattern (타임아웃 보호 잠금)

`asyncio.wait_for`를 사용한 간단한 타임아웃 구현입니다.

```python
async def _acquire_lock(self, entity: str, store_id: str) -> asyncio.Lock:
    lock = self._get_lock(entity, store_id)
    try:
        await asyncio.wait_for(lock.acquire(), timeout=self._lock_timeout)
    except asyncio.TimeoutError:
        raise ConcurrencyError(
            f"Lock timeout for {entity}_{store_id} after {self._lock_timeout}s"
        )
    return lock
```

**패턴 흐름**:
```
[Lock 요청] → [wait_for(acquire, timeout=5s)]
                  |                    |
                  ↓ (획득 성공)         ↓ (타임아웃)
           [작업 수행]          [ConcurrencyError]
           [Lock 해제]
```

**설계 결정**: `asyncio.wait_for` 래핑 방식 선택 (단순성 우선)

### 2.3 Lock Context Manager Pattern

Lock 획득/해제를 안전하게 관리하는 컨텍스트 매니저입니다.

```python
@asynccontextmanager
async def _locked(self, entity: str, store_id: str):
    lock = await self._acquire_lock(entity, store_id)
    try:
        yield
    finally:
        lock.release()
```

**사용 예시**:
```python
async def append(self, entity: str, store_id: str, record: dict) -> None:
    async with self._locked(entity, store_id):
        data = await self._read_file(entity, store_id)
        data.append(record)
        await self._atomic_write(self._get_file_path(entity, store_id), data)
```

---

## 3. 보안 패턴

### 3.1 Hash-on-Store Pattern (저장 시 해싱)

비밀번호는 저장 전에 반드시 해싱합니다. 평문은 메모리에서만 존재합니다.

```
[평문 비밀번호] → [bcrypt.hashpw(cost=10)] → [hash 저장]
                                                  |
[비밀번호 검증] → [bcrypt.checkpw(평문, hash)] → [True/False]
```

**적용 대상**: `AdminUser.password_hash`, `Table.password_hash`

### 3.2 Pydantic Validation Gateway Pattern (검증 게이트웨이)

모든 데이터는 Pydantic 모델을 통과해야 DataStore에 저장됩니다.

```
[외부 입력] → [Pydantic Model 검증] → [통과] → [DataStore 저장]
                     |
                     ↓ (검증 실패)
              [ValidationError 발생]
```

**검증 계층**:
1. 타입 검증 (Pydantic 자동)
2. 제약조건 검증 (Field validators)
3. 비즈니스 규칙 검증 (model_validator)

---

## 4. 로깅 패턴

### 4.1 Structured Operation Logging (구조화된 연산 로깅)

표준 로깅 수준: 오류 + 쓰기 연산만 기록합니다.

```python
import logging

logger = logging.getLogger("datastore")

# 쓰기 성공
logger.info("write: entity=%s, store_id=%s, records=%d", entity, store_id, len(data))

# 오류
logger.error("read_failed: entity=%s, store_id=%s, error=%s", entity, store_id, str(e))
logger.error("lock_timeout: entity=%s, store_id=%s, timeout=%ds", entity, store_id, timeout)
```

**로깅 규칙**:
| 연산 | 로그 여부 | 레벨 | 포함 정보 |
|------|:--------:|------|----------|
| read (성공) | ✗ | - | - |
| write/append/update/delete (성공) | ✓ | INFO | entity, store_id, record count |
| 모든 연산 (실패) | ✓ | ERROR | entity, store_id, error message |
| Lock 타임아웃 | ✓ | ERROR | entity, store_id, timeout |
| JSON 파싱 실패 | ✓ | ERROR | file_path, error detail |
| 디렉토리 생성 | ✓ | INFO | path |
| 시드 데이터 | ✓ | INFO | 생성 요약 |

---

## 5. 테스트 패턴

### 5.1 Temporary Directory Isolation Pattern (임시 디렉토리 격리)

각 테스트가 독립적인 파일 시스템 공간에서 실행됩니다.

```python
@pytest.fixture
async def datastore(tmp_path):
    """각 테스트마다 격리된 DataStore 인스턴스 제공"""
    ds = DataStore(base_path=str(tmp_path / "data"))
    return ds
```

**특성**:
- `tmp_path` (pytest 내장 fixture) 사용
- 테스트 간 파일 시스템 완전 격리
- 실제 파일 I/O 검증 가능
- pytest가 자동으로 임시 디렉토리 정리

### 5.2 Async Test Pattern

pytest-asyncio를 사용한 비동기 테스트 패턴입니다.

```python
import pytest

@pytest.mark.asyncio
async def test_read_empty(datastore):
    result = await datastore.read("menus", "store001")
    assert result == []
```
