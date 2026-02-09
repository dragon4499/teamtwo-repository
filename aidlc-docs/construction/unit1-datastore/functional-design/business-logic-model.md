# Business Logic Model - Unit 1: DataStore

---

## 1. DataStore 클래스 상세 로직

### 1.1 초기화
```
DataStore(base_path: str = "data")
  1. base_path 저장
  2. 엔티티별 Lock 딕셔너리 초기화 (빈 dict)
  3. base_path 디렉토리 존재 확인, 없으면 생성
```

### 1.2 Lock 관리
```
_get_lock(entity: str, store_id: str) -> asyncio.Lock
  1. key = f"{entity}_{store_id}"
  2. key가 Lock 딕셔너리에 없으면 새 Lock 생성
  3. Lock 반환
```

### 1.3 파일 경로 결정
```
_get_file_path(entity: str, store_id: str) -> Path
  - stores: base_path/stores.json
  - 기타: base_path/{store_id}/{entity}.json
```

### 1.4 read (읽기)
```
async read(entity: str, store_id: str) -> list[dict]
  1. Lock 획득 (타임아웃 5초)
  2. 파일 경로 결정
  3. 파일 존재 확인
     - 없으면: 빈 리스트 [] 반환
  4. 파일 읽기 (UTF-8)
  5. JSON 파싱
     - 파싱 실패: 로그 기록, 빈 리스트 [] 반환
  6. Lock 해제
  7. 데이터 반환
```

### 1.5 write (전체 쓰기)
```
async write(entity: str, store_id: str, data: list[dict]) -> None
  1. Lock 획득 (타임아웃 5초)
  2. 파일 경로 결정
  3. 디렉토리 존재 확인, 없으면 생성
  4. 임시 파일 경로 생성 ({파일명}.tmp)
  5. 임시 파일에 JSON 쓰기 (UTF-8, indent=2)
  6. os.replace(임시파일, 원본파일) - 원자적 교체
  7. Lock 해제
  
  예외 처리:
  - 임시 파일 쓰기 실패: 임시 파일 삭제 시도, IOError 발생
  - os.replace 실패: IOError 발생
```

### 1.6 find_by_id (ID 조회)
```
async find_by_id(entity: str, store_id: str, id: str) -> dict | None
  1. read(entity, store_id) 호출
  2. 결과에서 id 필드가 일치하는 레코드 검색
  3. 찾으면 해당 dict 반환, 없으면 None 반환
```

### 1.7 append (추가)
```
async append(entity: str, store_id: str, record: dict) -> None
  1. Lock 획득 (타임아웃 5초)
  2. 기존 데이터 읽기 (파일에서)
  3. record를 리스트에 추가
  4. 전체 데이터를 원자적 쓰기
  5. Lock 해제
```

### 1.8 update (수정)
```
async update(entity: str, store_id: str, id: str, data: dict) -> dict
  1. Lock 획득 (타임아웃 5초)
  2. 기존 데이터 읽기
  3. id가 일치하는 레코드 검색
     - 없으면: NotFoundError 발생
  4. 레코드 필드 업데이트 (data의 키-값으로 덮어쓰기)
  5. updated_at 필드 갱신 (현재 시각)
  6. 전체 데이터를 원자적 쓰기
  7. Lock 해제
  8. 업데이트된 레코드 반환
```

### 1.9 delete (삭제)
```
async delete(entity: str, store_id: str, id: str) -> None
  1. Lock 획득 (타임아웃 5초)
  2. 기존 데이터 읽기
  3. id가 일치하는 레코드 검색
     - 없으면: NotFoundError 발생
  4. 해당 레코드를 리스트에서 제거
  5. 전체 데이터를 원자적 쓰기
  6. Lock 해제
```

---

## 2. 주문 번호 생성 로직

```
generate_order_number(store_id: str, current_date: str) -> str
  1. orders.json 읽기
  2. current_date(YYYYMMDD)로 시작하는 order_number 필터링
  3. 필터링된 주문이 없으면: 순번 = 1
  4. 있으면: 최대 순번 추출 + 1
  5. 형식: f"{current_date}-{순번:05d}"
  6. 반환

  주의: 이 로직은 OrderService에서 호출되며,
  주문 생성 Lock 내에서 실행되어 동시성 안전
```

---

## 3. 세션 ID 생성 로직

```
generate_session_id(table_number: int, timestamp: datetime) -> str
  1. 테이블 번호 2자리 패딩: f"{table_number:02d}"
  2. 타임스탬프 포맷: timestamp.strftime("%Y%m%d%H%M%S")
  3. 형식: f"T{패딩번호}-{타임스탬프}"
  4. 반환
```

---

## 4. 시드 데이터 구조

### 4.1 기본 매장
```json
{
  "id": "store001",
  "name": "맛있는 식당",
  "created_at": "2026-02-09T00:00:00Z",
  "updated_at": "2026-02-09T00:00:00Z"
}
```

### 4.2 기본 관리자 계정
```json
{
  "id": "uuid-generated",
  "store_id": "store001",
  "username": "admin",
  "password_hash": "bcrypt-hash-of-admin1234",
  "role": "admin",
  "login_attempts": 0,
  "locked_until": null,
  "created_at": "2026-02-09T00:00:00Z"
}
```

### 4.3 샘플 메뉴 (카테고리 4개, 메뉴 12개)

**카테고리: 메인**
| 메뉴명 | 가격 | 설명 |
|--------|------|------|
| 김치찌개 | 9000 | 돼지고기와 묵은지로 끓인 김치찌개 |
| 된장찌개 | 8000 | 두부와 야채가 들어간 된장찌개 |
| 불고기 정식 | 12000 | 양념 불고기와 반찬 세트 |

**카테고리: 사이드**
| 메뉴명 | 가격 | 설명 |
|--------|------|------|
| 계란말이 | 5000 | 부드러운 계란말이 |
| 김치전 | 6000 | 바삭한 김치전 |
| 두부김치 | 7000 | 구운 두부와 볶음김치 |

**카테고리: 음료**
| 메뉴명 | 가격 | 설명 |
|--------|------|------|
| 콜라 | 2000 | 코카콜라 355ml |
| 사이다 | 2000 | 칠성사이다 355ml |
| 맥주 | 4000 | 생맥주 500ml |

**카테고리: 디저트**
| 메뉴명 | 가격 | 설명 |
|--------|------|------|
| 식혜 | 3000 | 전통 식혜 |
| 아이스크림 | 2500 | 바닐라 아이스크림 |
| 떡 | 3500 | 모듬 떡 |

---

## 5. 예외 클래스 정의

| 예외 | 설명 | HTTP 상태 |
|------|------|----------|
| NotFoundError | 리소스 미발견 | 404 |
| ValidationError | 데이터 검증 실패 | 400 |
| DuplicateError | 중복 데이터 | 409 |
| ConcurrencyError | 동시성 잠금 타임아웃 | 409 |
| DataCorruptionError | 데이터 파일 손상 | 500 |

---

## 6. 시드 데이터 실행 로직

```
async seed_data(datastore: DataStore) -> None
  1. stores.json 확인
     - 비어있으면: 기본 매장 추가
     - 있으면: 건너뜀
  2. store001/users.json 확인
     - 비어있으면: 기본 관리자 계정 추가 (비밀번호 bcrypt 해싱)
     - 있으면: 건너뜀
  3. store001/menus.json 확인
     - 비어있으면: 샘플 메뉴 12개 추가
     - 있으면: 건너뜀
  4. 나머지 파일 (tables, sessions, orders, order_history)
     - 파일 없으면: 빈 배열로 초기화
  
  멱등성: 이미 데이터가 있으면 덮어쓰지 않음
```
