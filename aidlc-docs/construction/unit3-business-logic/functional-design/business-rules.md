# Unit 3: Backend Business Logic - 비즈니스 규칙

---

## 1. 인증 규칙

### BR-AUTH-01: 관리자 JWT 토큰
- 알고리즘: HS256
- 만료 시간: 24시간
- Payload: `{ sub: admin_id, store_id, role: "admin", iat, exp }`
- Secret: 환경변수 `JWT_SECRET_KEY`

### BR-AUTH-02: 테이블 세션
- 세션 ID 형식: `T{table_number:02d}-{YYYYMMDDHHMMSS}`
- 만료 시간: 16시간
- 상태: `active` | `ended`

### BR-AUTH-03: 비밀번호 해싱
- 관리자, 테이블 모두 bcrypt 해싱 적용
- bcrypt rounds: 기본값 (12)

### BR-AUTH-04: 토큰 블랙리스트
- 로그아웃 시 인메모리 set에 토큰 추가
- 토큰 만료 시간까지만 블랙리스트 유지

---

## 2. 주문 규칙

### BR-ORDER-01: 주문 번호 생성
- 형식: `YYYYMMDD-NNNNN` (예: 20260209-00001)
- 당일 주문 수 기반 순번 (매일 00001부터 시작)
- 5자리 zero-padding

### BR-ORDER-02: 주문 상태 전이 (유연한 전이)
```
허용되는 전이:
  pending → preparing     ✅ (조리 시작)
  pending → completed     ✅ (빠른 완료)
  preparing → completed   ✅ (조리 완료)
  preparing → pending     ✅ (되돌리기)

불허되는 전이:
  completed → pending     ❌
  completed → preparing   ❌
```

### BR-ORDER-03: 주문 항목 검증
- 최소 1개 이상의 항목 필수
- 각 항목의 quantity > 0
- 메뉴 존재 여부 확인
- 메뉴 is_available == true 확인

### BR-ORDER-04: 주문 금액 계산
- subtotal = price × quantity (항목별)
- total_amount = sum(subtotal) (전체)
- 가격은 주문 시점의 메뉴 가격을 복사하여 저장

### BR-ORDER-05: 주문 삭제
- 관리자만 삭제 가능 (AdminRouter 경유)
- 상태와 무관하게 삭제 가능
- 삭제 시 EventBus에 이벤트 발행

---

## 3. 메뉴 규칙

### BR-MENU-01: 메뉴 데이터 검증
- name: 필수, 1~100자
- price: 필수, 0 이상 정수
- category: 필수, 빈 문자열 불가
- description: 선택, 최대 500자
- image_url: 선택
- is_available: 기본값 true
- sort_order: 기본값 0

### BR-MENU-02: 메뉴 삭제 방식
- 소프트 삭제: `is_available = false`로 변경
- 실제 데이터는 유지 (활성 주문의 메뉴 참조 보존)
- 삭제된 메뉴는 고객 메뉴 목록에서 제외 (is_available 필터)

### BR-MENU-03: 메뉴 수정
- 부분 업데이트 지원 (제공된 필드만 변경)
- updated_at 자동 갱신

---

## 4. 테이블/세션 규칙

### BR-TABLE-01: 테이블 번호
- 매장 내 고유 (store_id + table_number)
- 중복 등록 시 DuplicateError

### BR-TABLE-02: 세션 생명주기
```
생성 조건: 활성 세션이 없는 테이블만 가능
만료 시간: 시작 시점 + 16시간
종료 조건: 관리자가 수동 종료 (활성 주문 상태 무관)
```

### BR-TABLE-03: 세션 종료 처리
1. 현재 세션의 주문들을 OrderHistory로 이동
2. 주문 상태는 그대로 유지 (관리자 판단에 맡김)
3. 현재 주문 데이터 삭제
4. 세션 상태를 `ended`로 변경

### BR-TABLE-04: 테이블 인증 조건
- 테이블 존재 + 비밀번호 일치 + 활성 세션 존재
- 세 가지 조건 모두 충족해야 인증 성공

---

## 5. 이벤트 규칙

### BR-EVENT-01: 이벤트 발행 시점
- 주문 생성 시: `order_created`
- 주문 상태 변경 시: `order_status_changed`
- 주문 삭제 시: `order_deleted`

### BR-EVENT-02: 이벤트 전달 보장
- Best-effort 방식
- Queue 가득 참 시 이벤트 드롭
- SSE 재연결 시 최신 상태만 제공 (놓친 이벤트 재전송 없음)

### BR-EVENT-03: 구독 범위
- 매장(store_id) 단위 구독
- 이벤트 타입별 필터링 지원

---

## 6. 오류 처리 규칙

### BR-ERROR-01: HTTP 상태 코드 매핑
| Exception | HTTP Status | 설명 |
|-----------|:-----------:|------|
| ValidationError | 400 | 입력 데이터 검증 실패 |
| AuthenticationError | 401 | 인증 실패 |
| NotFoundError | 404 | 리소스 미발견 |
| DuplicateError | 409 | 중복 데이터 |
| ConcurrencyError | 409 | 동시성 충돌 |
| DataCorruptionError | 500 | 데이터 파일 손상 |

### BR-ERROR-02: 오류 응답 형식
```json
{
  "detail": "오류 메시지"
}
```
