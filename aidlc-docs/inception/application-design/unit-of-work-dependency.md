# Unit of Work 의존성 매트릭스

---

## 1. 의존성 매트릭스

| 유닛 | Unit 1 (DataStore) | Unit 2 (Mock API) | Unit 3 (Business Logic) | Unit 4 (Customer FE) | Unit 5 (Admin FE) |
|------|:------------------:|:-----------------:|:-----------------------:|:--------------------:|:------------------:|
| Unit 1 | - | - | - | - | - |
| Unit 2 | - | - | - | - | - |
| Unit 3 | ● | ● | - | - | - |
| Unit 4 | - | ● | - | - | - |
| Unit 5 | - | ● | - | - | - |

● = 직접 의존 (해당 유닛이 완료되어야 시작 가능)

### 의존성 설명
- **Unit 1 (DataStore)**: 독립적, 의존성 없음
- **Unit 2 (Mock API)**: 독립적, 의존성 없음 (하드코딩 Mock 응답)
- **Unit 3 (Business Logic)**: Unit 1 (DataStore 연동) + Unit 2 (API 구조 교체)에 의존
- **Unit 4 (Customer FE)**: Unit 2 (Mock API 엔드포인트)에 의존
- **Unit 5 (Admin FE)**: Unit 2 (Mock API + SSE 엔드포인트)에 의존

---

## 2. 개발 순서 및 병렬 가능성

### Phase A: 기반 구축 (병렬 가능)
```
+-------------------+     +-------------------+
| Unit 1: DataStore |     | Unit 2: Mock API  |
| (선행 유닛)        |     | (선행 유닛)        |
+-------------------+     +-------------------+
        |                         |
        |                    +----+----+
        |                    |         |
        v                    v         v
```

- Unit 1과 Unit 2는 서로 독립적이므로 병렬 개발 가능
- 둘 다 선행 유닛으로 가장 먼저 완료해야 함

### Phase B: 프론트엔드 + 비즈니스 로직 (병렬 가능)
```
+-------------------------+
| Unit 3: Business Logic  |  (Unit 1 + Unit 2 완료 후)
+-------------------------+
        |
+-------------------+     +-------------------+
| Unit 4: Customer  |     | Unit 5: Admin     |
| Frontend          |     | Frontend          |
| (Unit 2 완료 후)   |     | (Unit 2 완료 후)   |
+-------------------+     +-------------------+
```

- Unit 4, Unit 5는 Unit 2 완료 후 즉시 시작 (Mock API 기반)
- Unit 3은 Unit 1 + Unit 2 완료 후 시작
- Unit 3, Unit 4, Unit 5는 병렬 진행 가능

### Phase C: API 전환
- Unit 3 완료 후 Unit 4, Unit 5의 API 호출을 Mock에서 실제 API로 전환
- 전환은 API 서비스 레이어만 수정하면 됨 (엔드포인트 동일)

---

## 3. 개발 타임라인

```
Week 1          Week 2          Week 3          Week 4
|--- Phase A ---|--- Phase B ---|--- Phase B ---|--- Phase C ---|
                                                
[Unit 1: DataStore    ]
[Unit 2: Mock API     ]
                [Unit 3: Business Logic         ]
                [Unit 4: Customer FE            ][API 전환]
                [Unit 5: Admin FE               ][API 전환]
                                                [통합 테스트  ]
```

### 예상 소요 시간
| 유닛 | 예상 기간 | 시작 조건 |
|------|----------|----------|
| Unit 1: DataStore | 3-4일 | 즉시 시작 |
| Unit 2: Mock API | 3-4일 | 즉시 시작 (Unit 1과 병렬) |
| Unit 3: Business Logic | 5-7일 | Unit 1 + Unit 2 완료 후 |
| Unit 4: Customer FE | 5-7일 | Unit 2 완료 후 |
| Unit 5: Admin FE | 5-7일 | Unit 2 완료 후 |
| API 전환 + 통합 테스트 | 2-3일 | Unit 3, 4, 5 완료 후 |

---

## 4. 순환 의존성 검증

순환 의존성 없음 확인:
- Unit 1 → (없음)
- Unit 2 → (없음)
- Unit 3 → Unit 1, Unit 2 (단방향)
- Unit 4 → Unit 2 (단방향)
- Unit 5 → Unit 2 (단방향)

모든 의존성이 단방향이며, 순환 경로가 존재하지 않습니다.

---

## 5. 통신 인터페이스 (유닛 간)

| 연결 | 프로토콜 | 설명 |
|------|---------|------|
| Unit 4 → Unit 2/3 | HTTP REST | 고객 API 호출 |
| Unit 5 → Unit 2/3 | HTTP REST | 관리자 API 호출 |
| Unit 5 → Unit 2/3 | SSE | 실시간 주문 스트림 |
| Unit 3 → Unit 1 | Python 함수 호출 | DataStore 메서드 직접 호출 |
| Unit 3 내부 | asyncio.Queue | EventBus 이벤트 전달 |
