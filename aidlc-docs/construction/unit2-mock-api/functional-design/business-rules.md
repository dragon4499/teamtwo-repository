# Business Rules - Unit 2: Mock API & Core Structure

---

## 1. URL 라우팅 규칙

### 1.1 라우터 구조

| 라우터 | Prefix | 설명 |
|--------|--------|------|
| CustomerRouter | `/api/stores/{store_id}` | 고객용 API |
| AdminRouter | `/api/stores/{store_id}/admin` | 관리자용 API |
| SSERouter | `/api/stores/{store_id}/events` | SSE 이벤트 스트림 |

### 1.2 고객 API 엔드포인트

| Method | Path | 설명 | Mock 응답 코드 |
|--------|------|------|:-------------:|
| POST | `/api/stores/{store_id}/tables/auth` | 테이블 인증 | 200 |
| GET | `/api/stores/{store_id}/menus` | 메뉴 목록 | 200 |
| GET | `/api/stores/{store_id}/menus?category={cat}` | 카테고리별 메뉴 | 200 |
| POST | `/api/stores/{store_id}/tables/{table_num}/orders` | 주문 생성 | 201 |
| GET | `/api/stores/{store_id}/sessions/{session_id}/orders` | 세션별 주문 | 200 |
| GET | `/api/stores/{store_id}/orders/{order_id}` | 주문 상세 | 200 |

### 1.3 관리자 API 엔드포인트

| Method | Path | 설명 | Mock 응답 코드 |
|--------|------|------|:-------------:|
| POST | `/api/stores/{store_id}/admin/login` | 로그인 | 200 |
| POST | `/api/stores/{store_id}/admin/logout` | 로그아웃 | 200 |
| GET | `/api/stores/{store_id}/admin/tables` | 테이블 목록 | 200 |
| POST | `/api/stores/{store_id}/admin/tables` | 테이블 생성 | 201 |
| POST | `/api/stores/{store_id}/admin/tables/{table_num}/session/start` | 세션 시작 | 200 |
| POST | `/api/stores/{store_id}/admin/tables/{table_num}/session/end` | 세션 종료 | 200 |
| GET | `/api/stores/{store_id}/admin/tables/{table_num}/orders` | 테이블 주문 | 200 |
| GET | `/api/stores/{store_id}/admin/tables/{table_num}/history` | 과거 이력 | 200 |
| PATCH | `/api/stores/{store_id}/admin/orders/{order_id}/status` | 상태 변경 | 200 |
| DELETE | `/api/stores/{store_id}/admin/orders/{order_id}` | 주문 삭제 | 204 |
| GET | `/api/stores/{store_id}/admin/menus` | 메뉴 목록 | 200 |
| POST | `/api/stores/{store_id}/admin/menus` | 메뉴 등록 | 201 |
| PUT | `/api/stores/{store_id}/admin/menus/{menu_id}` | 메뉴 수정 | 200 |
| DELETE | `/api/stores/{store_id}/admin/menus/{menu_id}` | 메뉴 삭제 | 204 |

### 1.4 SSE 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/stores/{store_id}/events/orders` | 주문 이벤트 스트림 |

---

## 2. CORS 설정 규칙

### 2.1 허용 오리진
```
http://localhost:3000   # Customer Frontend
http://localhost:3001   # Admin Frontend
```

### 2.2 CORS 정책
| 설정 | 값 | 설명 |
|------|-----|------|
| allow_origins | `["http://localhost:3000", "http://localhost:3001"]` | 허용 오리진 |
| allow_methods | `["*"]` | 모든 HTTP 메서드 허용 |
| allow_headers | `["*"]` | 모든 헤더 허용 |
| allow_credentials | `true` | 쿠키/인증 헤더 허용 |

---

## 3. 인증 미들웨어 Mock 동작

### 3.1 Mock 모드 규칙
- 모든 요청을 인증 없이 통과시킴
- Authorization 헤더 검사하지 않음
- 인증 미들웨어는 구조만 존재하고 실제 검증 로직 없음

### 3.2 미들웨어 적용 범위
| 경로 패턴 | 인증 필요 | Mock 동작 |
|-----------|:---------:|-----------|
| `/api/stores/{id}/admin/login` | ✗ | 미들웨어 제외 |
| `/api/stores/{id}/admin/*` | ✓ (관리자) | 통과 |
| `/api/stores/{id}/tables/auth` | ✗ | 미들웨어 제외 |
| `/api/stores/{id}/menus` | ✗ | 미들웨어 제외 |
| `/api/stores/{id}/tables/*/orders` | ✓ (테이블) | 통과 |
| `/api/stores/{id}/sessions/*/orders` | ✓ (테이블) | 통과 |
| `/api/stores/{id}/orders/*` | ✓ (테이블) | 통과 |
| `/api/stores/{id}/events/*` | ✗ | 미들웨어 제외 |

### 3.3 Mock 미들웨어 구현 방식
- Unit 2에서는 인증 미들웨어를 등록하지 않음 (완전 통과)
- 라우터 함수에 인증 의존성 주입 구조만 준비
- Unit 3에서 실제 인증 로직으로 교체

---

## 4. 오류 처리 규칙

### 4.1 오류 응답 형식
FastAPI 기본 형식 사용:
```json
{
  "detail": "오류 메시지"
}
```

### 4.2 HTTP 상태 코드 매핑
| 상황 | 상태 코드 | detail 메시지 |
|------|:---------:|--------------|
| 리소스 미발견 | 404 | `"Not found"` |
| 입력 검증 실패 | 422 | FastAPI 자동 생성 (Pydantic) |
| 서버 내부 오류 | 500 | `"Internal server error"` |

### 4.3 Mock 단계 오류 처리
- Mock 단계에서는 오류 상황을 최소화
- 존재하지 않는 경로 → FastAPI 기본 404
- 잘못된 요청 본문 → FastAPI/Pydantic 자동 422
- 전역 예외 핸들러는 구조만 등록 (Unit 3에서 확장)

---

## 5. SSE Mock 이벤트 규칙

### 5.1 연결 동작
1. 클라이언트가 SSE 엔드포인트에 연결
2. 즉시 샘플 `order_created` 이벤트 1개 전송
3. 연결 유지 (추가 이벤트 없음)
4. 클라이언트 연결 해제 시 정리

### 5.2 Mock 이벤트 형식
```
event: order_created
data: {"order_id": "mock-order-001", "order_number": "20260209-00001", "table_number": 1, "status": "pending", "total_amount": 25000, "timestamp": "2026-02-09T12:00:00Z"}
```

### 5.3 Content-Type
- `text/event-stream; charset=utf-8`

---

## 6. Mock 응답 데이터 규칙

### 6.1 데이터 일관성
- 모든 Mock 응답은 인라인 dict로 정의 (라우터 함수 내부)
- Mock 데이터 간 참조 일관성 유지:
  - `store_id`: `"store001"` 고정
  - `table_number`: 1~3 범위
  - `session_id`: `"T01-20260209090000"` 형식
  - `order_id`: `"mock-order-001"` 형식
  - `menu_id`: `"mock-menu-001"` 형식

### 6.2 Mock 데이터 원칙
- 하드코딩된 정적 데이터만 사용
- 요청 파라미터(store_id, table_num 등)는 무시하고 동일한 Mock 응답 반환
- 상태 변경 요청(POST, PATCH, DELETE)도 정적 응답 반환 (실제 데이터 변경 없음)

### 6.3 날짜/시간 Mock 값
- 모든 날짜/시간은 고정값 사용: `"2026-02-09T12:00:00Z"`
- 만료 시각: `"2026-02-10T04:00:00Z"` (시작 + 16시간)

---

## 7. FastAPI 앱 구성 규칙

### 7.1 앱 초기화
```python
app = FastAPI(title="Table Order API", version="0.1.0")
```

### 7.2 라우터 등록 순서
1. CORS 미들웨어 추가
2. CustomerRouter 등록 (prefix: `/api/stores/{store_id}`)
3. AdminRouter 등록 (prefix: `/api/stores/{store_id}/admin`)
4. SSERouter 등록 (prefix: `/api/stores/{store_id}/events`)

### 7.3 Health Check
- `GET /health` → `{"status": "ok"}` (라우터 외부, 앱 레벨)
