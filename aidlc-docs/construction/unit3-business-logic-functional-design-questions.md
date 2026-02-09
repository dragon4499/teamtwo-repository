# Unit 3: Backend Business Logic - Functional Design 질문

Unit 3의 비즈니스 로직 상세 설계를 위해 아래 질문에 답변해주세요.

---

## Question 1
주문 상태 전이 규칙을 어떻게 적용할까요?

A) 엄격한 순서만 허용: pending → preparing → completed (역방향 불가)
B) 유연한 전이 허용: pending ↔ preparing → completed (preparing에서 pending으로 되돌리기 가능)
C) 완전 자유: 어떤 상태에서든 다른 상태로 변경 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
관리자 로그인 시도 제한을 어떻게 처리할까요?

A) 5회 실패 시 30분 잠금
B) 3회 실패 시 15분 잠금
C) 제한 없음 (MVP에서는 생략)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3
주문 번호 생성 규칙은 어떻게 할까요?

A) 날짜 기반 순번: YYYYMMDD-NNNNN (예: 20260209-00001)
B) 매장별 일일 순번: {store_id}-YYYYMMDD-NNN
C) UUID 기반 (고유하지만 사람이 읽기 어려움)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
테이블 세션 종료 시 활성 주문(pending/preparing)이 남아있으면 어떻게 처리할까요?

A) 세션 종료 차단 - 모든 주문이 completed 상태여야만 종료 가능
B) 강제 종료 - 남은 주문을 자동으로 completed로 변경 후 이력 이동
C) 경고 후 종료 - 상태 그대로 이력으로 이동 (관리자 판단에 맡김)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
메뉴 삭제 시 해당 메뉴가 포함된 활성 주문이 있으면 어떻게 처리할까요?

A) 삭제 차단 - 활성 주문에 포함된 메뉴는 삭제 불가
B) 소프트 삭제 - is_available을 false로 변경 (데이터는 유지)
C) 강제 삭제 - 주문에는 메뉴 이름/가격이 이미 복사되어 있으므로 삭제 허용
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
JWT 토큰 설정은 어떻게 할까요?

A) 관리자 토큰 16시간, 테이블 세션 토큰 16시간 (동일)
B) 관리자 토큰 8시간, 테이블 세션 토큰 16시간 (분리)
C) 관리자 토큰 24시간, 테이블 세션 토큰 16시간
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 7
EventBus의 이벤트 전달 보장 수준은 어떻게 할까요?

A) Best-effort (이벤트 유실 가능, 단순 구현) - SSE 재연결 시 최신 상태만 제공
B) At-least-once (이벤트 버퍼링, 재연결 시 놓친 이벤트 재전송)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
비밀번호 해싱에 bcrypt를 사용하는데, 테이블 비밀번호도 동일하게 bcrypt로 해싱할까요?

A) 예, 관리자/테이블 모두 bcrypt 해싱
B) 관리자만 bcrypt, 테이블 비밀번호는 단순 비교 (4자리 PIN 등 간단한 경우)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

