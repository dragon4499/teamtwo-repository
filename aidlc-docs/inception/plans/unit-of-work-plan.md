# Unit of Work Plan - 테이블오더 시스템

## 목적
시스템을 관리 가능한 개발 단위(Unit of Work)로 분해하고, 개발 순서를 정의합니다.
사용자 지시에 따라 Mock API와 DB(DataStore) 영역을 선행 유닛으로 구성합니다.

---

## 분해 전략

사용자 지시 기반으로 다음과 같은 유닛 분해를 제안합니다:

### Unit 1: DataStore (파일 기반 데이터 저장소) - 선행
- DataStore 컴포넌트 (JSON 파일 I/O)
- 데이터 모델 정의 (Pydantic schemas)
- 초기 데이터 시딩
- 동시성 제어 (asyncio.Lock)

### Unit 2: Mock API & Core Services - 선행
- FastAPI 앱 기본 구조
- 모든 API 엔드포인트 스텁 (Mock 응답)
- AuthService, MenuService, OrderService, TableService 기본 구조
- EventBus 기본 구조
- Middleware (Auth, Error Handler)

### Unit 3: Backend Business Logic
- Service Layer 실제 비즈니스 로직 구현
- AuthService (JWT, 테이블 인증)
- MenuService (CRUD)
- OrderService (주문 생성/상태변경/삭제)
- TableService (세션 관리)
- EventBus + SSE 실시간 스트림

### Unit 4: Customer Frontend
- 고객용 React 앱 전체
- 페이지: TableSetup, Menu, Cart, OrderConfirm, OrderSuccess, OrderHistory
- Context: Auth, Cart, Menu
- API 연동

### Unit 5: Admin Frontend
- 관리자용 React 앱 전체
- 페이지: Login, Dashboard, TableDetail, TableManagement, MenuManagement
- Context: AdminAuth, Order, SSE
- SSE 실시간 연동

---

## 설계 질문

### 1. Mock API 응답 수준
Mock API의 응답 수준을 어떻게 설정할까요?

A) 하드코딩된 정적 JSON 응답 - 가장 빠른 구현, 프론트엔드 개발 즉시 시작 가능
B) DataStore 연동 Mock - Unit 1의 DataStore를 사용하여 실제 데이터 읽기/쓰기, 비즈니스 로직만 단순화
C) 완전한 스텁 - 엔드포인트만 정의, 빈 응답 반환

[Answer]: A

### 2. 프론트엔드 개발 시작 시점
프론트엔드 유닛(Unit 4, 5)의 개발 시작 시점을 어떻게 할까요?

A) Unit 2 (Mock API) 완료 후 즉시 시작 - Mock API 기반으로 프론트엔드 병렬 개발
B) Unit 3 (Business Logic) 완료 후 시작 - 실제 API 기반으로 개발
C) Unit 2 완료 후 시작하되, Unit 3과 병렬 진행 - Mock으로 시작, 실제 API로 전환

[Answer]: A

### 3. 테스트 전략 (유닛별)
각 유닛의 테스트 범위를 어떻게 설정할까요?

A) 각 유닛 완료 시 해당 유닛의 단위 테스트만 작성
B) 각 유닛 완료 시 단위 테스트 + 통합 테스트 작성
C) 모든 유닛 완료 후 일괄 테스트 작성

[Answer]: B

---

## 생성 실행 계획

### Phase 1: 유닛 정의 및 책임 할당
- [x] 5개 유닛의 상세 정의 및 책임 범위 확정
- [x] 각 유닛에 포함되는 컴포넌트 매핑
- [x] `unit-of-work.md` 생성

### Phase 2: 의존성 매트릭스
- [x] 유닛 간 의존성 관계 정의
- [x] 개발 순서 및 병렬 가능 여부 결정
- [x] `unit-of-work-dependency.md` 생성

### Phase 3: 스토리 매핑
- [x] 모든 사용자 스토리를 유닛에 할당
- [x] 미할당 스토리 없음 검증
- [x] `unit-of-work-story-map.md` 생성

### Phase 4: 검증
- [x] 모든 컴포넌트가 유닛에 할당되었는지 확인
- [x] 순환 의존성 없음 확인
- [x] 개발 순서 타당성 검증
