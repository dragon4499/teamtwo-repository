# 테이블오더 시스템 - 서비스 정의 및 오케스트레이션

---

## 1. 서비스 아키텍처 개요

```
Client Request
      |
      v
+------------------+
|   FastAPI App     |
|  (ASGI Server)   |
+------------------+
      |
      v
+------------------+     +------------------+
|   API Routers    |---->|   Middleware      |
| (Customer/Admin) |     | (Auth/Error)     |
+------------------+     +------------------+
      |
      v
+------------------+     +------------------+
|  Service Layer   |---->|   EventBus       |
| (Business Logic) |     | (asyncio.Queue)  |
+------------------+     +------------------+
      |                         |
      v                         v
+------------------+     +------------------+
|   DataStore      |     |   SSE Stream     |
| (JSON File I/O)  |     | (Admin Clients)  |
+------------------+     +------------------+
```

---

## 2. 서비스 정의

### 2.1 AuthService
- **역할**: 인증 및 권한 관리 오케스트레이터
- **오케스트레이션 패턴**: 요청-응답 (동기)
- **흐름**:
  - 관리자 로그인: 자격증명 검증 → JWT 생성 → 토큰 반환
  - 테이블 인증: 매장/테이블/비밀번호 검증 → 세션 확인 → 세션 정보 반환
  - 토큰 검증: JWT 디코딩 → 만료 확인 → 사용자 정보 반환

### 2.2 MenuService
- **역할**: 메뉴 데이터 관리 오케스트레이터
- **오케스트레이션 패턴**: 요청-응답 (동기)
- **흐름**:
  - 메뉴 조회: DataStore 읽기 → 필터링/정렬 → 반환
  - 메뉴 생성: 데이터 검증 → DataStore 쓰기 → 반환
  - 메뉴 수정: 존재 확인 → 데이터 검증 → DataStore 업데이트 → 반환
  - 메뉴 삭제: 존재 확인 → DataStore 삭제

### 2.3 OrderService
- **역할**: 주문 처리 오케스트레이터 (핵심 서비스)
- **오케스트레이션 패턴**: 요청-응답 + 이벤트 발행 (비동기)
- **흐름**:
  - 주문 생성:
    1. 주문 항목 검증 (메뉴 존재 여부, 가격 확인)
    2. 주문 번호 생성
    3. DataStore에 주문 저장
    4. EventBus에 `order_created` 이벤트 발행
    5. 주문 정보 반환
  - 상태 변경:
    1. 주문 존재 확인
    2. 상태 전이 유효성 검증
    3. DataStore 업데이트
    4. EventBus에 `order_status_changed` 이벤트 발행
    5. 업데이트된 주문 반환
  - 주문 삭제:
    1. 주문 존재 확인
    2. DataStore에서 삭제
    3. EventBus에 `order_deleted` 이벤트 발행

### 2.4 TableService
- **역할**: 테이블 및 세션 생명주기 관리
- **오케스트레이션 패턴**: 요청-응답 (동기) + 복합 트랜잭션
- **흐름**:
  - 세션 시작:
    1. 테이블 존재 확인
    2. 기존 활성 세션 확인
    3. 새 세션 생성 (16시간 만료)
    4. DataStore 저장
  - 세션 종료:
    1. 활성 세션 확인
    2. 현재 주문들을 이력으로 이동
    3. 세션 상태를 종료로 변경
    4. DataStore 업데이트

### 2.5 EventBus
- **역할**: 비동기 이벤트 중개자
- **오케스트레이션 패턴**: 발행-구독 (Pub/Sub)
- **구현**: asyncio.Queue 기반 인메모리 이벤트 버스
- **이벤트 타입**:
  - `order_created` - 새 주문 생성됨
  - `order_status_changed` - 주문 상태 변경됨
  - `order_deleted` - 주문 삭제됨
- **흐름**:
  1. Service가 이벤트 발행 (publish)
  2. EventBus가 매장별 구독자에게 이벤트 전달
  3. SSE 핸들러가 이벤트를 클라이언트에 스트리밍

### 2.6 DataStore
- **역할**: 데이터 영속화 서비스
- **오케스트레이션 패턴**: 요청-응답 (동기)
- **구현**: 엔티티별 개별 JSON 파일
- **동시성 제어**: asyncio.Lock 기반 파일 잠금
- **파일 구조**:
  ```
  data/
  ├── stores.json
  ├── users.json
  ├── {store_id}/
  │   ├── menus.json
  │   ├── tables.json
  │   ├── sessions.json
  │   ├── orders.json
  │   └── order_history.json
  ```

---

## 3. 서비스 간 상호작용

### 3.1 주문 생성 시퀀스

```
Customer App → CustomerRouter → OrderService → MenuService (검증)
                                     |
                                     ├→ DataStore (저장)
                                     └→ EventBus (이벤트 발행)
                                            |
                                            └→ SSE Stream → Admin App
```

### 3.2 주문 상태 변경 시퀀스

```
Admin App → AdminRouter → OrderService → DataStore (업데이트)
                               |
                               └→ EventBus (이벤트 발행)
                                      |
                                      └→ SSE Stream → Admin App (다른 클라이언트)
```

### 3.3 테이블 세션 종료 시퀀스

```
Admin App → AdminRouter → TableService → OrderService (주문 이력 이동)
                               |
                               └→ DataStore (세션 종료, 이력 저장)
```

### 3.4 SSE 실시간 스트림 시퀀스

```
Admin App ←(SSE)← SSERouter ← EventBus.subscribe(store_id)
                                    ↑
                    OrderService.publish(event)
```

---

## 4. 오류 처리 전략

### 4.1 서비스 레벨 오류
- **ValidationError**: 입력 데이터 검증 실패 → 400 Bad Request
- **NotFoundError**: 리소스 미발견 → 404 Not Found
- **AuthenticationError**: 인증 실패 → 401 Unauthorized
- **ConflictError**: 동시성 충돌 → 409 Conflict
- **InternalError**: 서버 내부 오류 → 500 Internal Server Error

### 4.2 SSE 연결 오류
- 연결 끊김 시 클라이언트 자동 재연결 (EventSource 기본 동작)
- 서버 측 구독자 정리 (타임아웃 기반)

### 4.3 파일 I/O 오류
- 파일 잠금 실패 시 재시도 (최대 3회)
- 파일 손상 시 백업에서 복구
