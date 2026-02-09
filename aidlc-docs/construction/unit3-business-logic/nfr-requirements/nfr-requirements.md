# NFR Requirements - Unit 3: Backend Business Logic

> Unit 1/2에서 결정된 NFR을 계승하며, Unit 3 고유 요구사항만 추가 정의합니다.

---

## 1. 성능 요구사항

### 1.1 API 응답 성능 (실제 비즈니스 로직)
| 항목 | 요구사항 | 비고 |
|------|---------|------|
| 일반 API 응답 | < 500ms | DataStore 파일 I/O 포함 |
| 주문 생성 | < 1s | 메뉴 검증 + 저장 + 이벤트 발행 |
| SSE 이벤트 전달 | < 100ms | EventBus publish → subscriber 전달 |

### 1.2 EventBus 성능
| 항목 | 값 | 비고 |
|------|---|------|
| Queue 크기 | 100 (구독자당) | 초과 시 이벤트 드롭 |
| 동시 구독자 | 제한 없음 (MVP) | 매장당 관리자 수 제한적 |

---

## 2. 보안 요구사항

### 2.1 JWT 인증
| 항목 | 값 | 비고 |
|------|---|------|
| 알고리즘 | HS256 | 대칭키, 단일 서버 환경 적합 |
| 관리자 토큰 만료 | 24시간 | 사용자 답변 Q6: C |
| 테이블 세션 만료 | 16시간 | 영업 시간 기준 |
| Secret Key | 환경변수 `JWT_SECRET_KEY` | 코드에 하드코딩 금지 |
| 토큰 블랙리스트 | 인메모리 set | 로그아웃 시 추가, 만료 시 자동 제거 |

### 2.2 비밀번호 보안
| 항목 | 값 | 비고 |
|------|---|------|
| 해싱 알고리즘 | bcrypt | Unit 1과 동일 |
| Cost Factor | 10 | Unit 1과 동일 |
| 적용 대상 | 관리자 + 테이블 모두 | 사용자 답변 Q8: A |

### 2.3 인증 미들웨어
| 항목 | 요구사항 | 비고 |
|------|---------|------|
| Admin 엔드포인트 | JWT 토큰 검증 필수 | Authorization: Bearer {token} |
| Customer 엔드포인트 | 세션 ID 검증 | 주문 생성 시 세션 유효성 확인 |
| 공개 엔드포인트 | 인증 불필요 | 메뉴 조회, 테이블 인증, 관리자 로그인 |

### 2.4 로그인 시도 제한
| 항목 | 값 | 비고 |
|------|---|------|
| 제한 | 없음 | MVP 생략 (사용자 답변 Q2: C) |

---

## 3. 신뢰성 요구사항

### 3.1 오류 처리 (Unit 2 확장)
| Exception | HTTP Status | 설명 |
|-----------|:-----------:|------|
| ValidationError | 400 | 입력 데이터 검증 실패 |
| AuthenticationError | 401 | 인증 실패 (JWT 만료, 세션 무효) |
| NotFoundError | 404 | 리소스 미발견 |
| DuplicateError | 409 | 중복 데이터 |
| ConcurrencyError | 409 | 동시성 충돌 |
| DataCorruptionError | 500 | 데이터 파일 손상 |

### 3.2 상태 전이 안전성
| 항목 | 요구사항 | 비고 |
|------|---------|------|
| 주문 상태 전이 | 유효성 검증 필수 | 불허 전이 시 ValidationError |
| 세션 상태 전이 | active → ended만 허용 | 역방향 불가 |

### 3.3 데이터 일관성
| 항목 | 요구사항 | 비고 |
|------|---------|------|
| 주문 생성 | 메뉴 가격 시점 복사 | 이후 메뉴 가격 변경 영향 없음 |
| 세션 종료 | 주문 이력 이동 + 현재 주문 삭제 | 원자적 처리 |

---

## 4. 로깅 요구사항

### 4.1 로깅 수준: 표준
| 이벤트 | 로깅 여부 | 로그 레벨 | 비고 |
|--------|:--------:|----------|------|
| 관리자 로그인 성공 | ✓ | INFO | username, store_id |
| 관리자 로그인 실패 | ✓ | WARNING | username, store_id, 사유 |
| 테이블 인증 성공 | ✓ | INFO | table_number, store_id |
| 테이블 인증 실패 | ✓ | WARNING | table_number, store_id, 사유 |
| 주문 생성 | ✓ | INFO | order_number, table_number, total |
| 주문 상태 변경 | ✓ | INFO | order_id, old → new status |
| 주문 삭제 | ✓ | INFO | order_id, table_number |
| 세션 시작 | ✓ | INFO | session_id, table_number |
| 세션 종료 | ✓ | INFO | session_id, 주문 수, 총액 |
| 이벤트 발행 | ✓ | DEBUG | event_type, store_id |
| 이벤트 드롭 | ✓ | WARNING | subscriber_id, event_type |
| 비즈니스 규칙 위반 | ✓ | WARNING | 규칙 ID, 상세 |

### 4.2 로거 구성
- 로거 이름: `table_order` (서비스별 하위 로거: `table_order.auth`, `table_order.order` 등)
- Unit 1의 `datastore` 로거와 공존

---

## 5. 유지보수성 요구사항

### 5.1 코드 품질 (Unit 1/2 계승)
| 항목 | 요구사항 |
|------|---------|
| 타입 힌트 | 모든 함수/메서드에 적용 |
| Docstring | 공개 메서드에 작성 |
| 코드 스타일 | PEP 8 (ruff) |

### 5.2 테스트 커버리지
| 항목 | 요구사항 |
|------|---------|
| Service 단위 테스트 | 각 Service 메서드별 테스트 |
| 비즈니스 규칙 테스트 | 상태 전이, 검증 로직 |
| 통합 테스트 | 주문 생성→상태변경→SSE, 세션 시작→주문→종료→이력 |
| 테스트 클라이언트 | httpx AsyncClient |
