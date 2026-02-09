# Application Design Plan

## 목적
테이블오더 시스템의 고수준 컴포넌트 식별, 서비스 레이어 설계, 컴포넌트 간 의존성 및 통신 패턴 정의

## 설계 범위
- 요구사항 문서 기반 컴포넌트 식별
- 서비스 레이어 오케스트레이션 설계
- 컴포넌트 메서드 시그니처 정의
- 컴포넌트 간 의존성 및 통신 패턴

---

## 설계 질문

### 1. 백엔드 프레임워크 선택
요구사항에서 Python with Django/FastAPI로 결정되었습니다. 구체적으로 어떤 프레임워크를 사용할까요?

A) FastAPI 단독 - 비동기 처리, SSE 네이티브 지원, 경량 프레임워크
B) Django + Django REST Framework - 풍부한 ORM, 관리자 패널 내장
C) Django + FastAPI 혼합 - Django ORM + FastAPI 비동기 엔드포인트

[Answer]: A

### 2. 프론트엔드 상태 관리
React.js 프론트엔드에서 상태 관리 방식을 선택해주세요.

A) React Context API + useReducer - 가벼운 내장 솔루션, 소규모 앱에 적합
B) Redux Toolkit - 예측 가능한 상태 관리, 미들웨어 지원, 대규모 앱에 적합
C) Zustand - 간결한 API, 보일러플레이트 최소화, 중소규모 앱에 적합

[Answer]: A

### 3. 파일 기반 데이터 저장소 구조
파일 I/O 기반 저장소의 데이터 포맷을 선택해주세요.

A) JSON 파일 - 각 엔티티(메뉴, 주문, 테이블 등)별 개별 JSON 파일
B) JSON 파일 - 하나의 통합 JSON 파일에 모든 데이터 저장
C) JSONL (JSON Lines) - 각 레코드를 한 줄씩 저장, 추가 쓰기에 유리

[Answer]: A

### 4. 고객/관리자 프론트엔드 구조
고객용과 관리자용 프론트엔드를 어떻게 구성할까요?

A) 단일 React 앱 - 라우팅으로 고객/관리자 화면 분리
B) 별도 React 앱 2개 - 고객용, 관리자용 완전 분리
C) 모노레포 구조 - 공통 컴포넌트 공유, 빌드는 별도

[Answer]: B

### 5. API 라우팅 구조
백엔드 API 엔드포인트 구조를 어떻게 설계할까요?

A) 리소스 기반 REST - `/api/stores/{id}/tables/{id}/orders` 형태의 중첩 리소스
B) 플랫 REST - `/api/orders`, `/api/tables`, `/api/menus` 형태의 평면 구조
C) 도메인 기반 그룹핑 - `/api/customer/...`, `/api/admin/...` 형태로 역할별 분리

[Answer]: A

### 6. 이벤트 기반 아키텍처 구현 방식
요구사항에서 메시지 큐 기반 이벤트 아키텍처로 결정되었습니다. 구현 방식을 선택해주세요.

A) Python asyncio.Queue - 인메모리 비동기 큐, 외부 의존성 없음, 단일 프로세스
B) Redis Pub/Sub - 외부 메시지 브로커, 다중 프로세스 지원
C) 간단한 Observer 패턴 - 인메모리 이벤트 버스, 가장 단순한 구현

[Answer]: A

### 7. 인증 토큰 저장 방식
관리자 JWT 토큰을 프론트엔드에서 어떻게 저장할까요?

A) HttpOnly Cookie - 보안성 높음, XSS 방어, CSRF 대응 필요
B) localStorage - 구현 간단, XSS 취약, 새로고침 시 유지
C) sessionStorage - 탭 닫으면 삭제, XSS 취약, 구현 간단

[Answer]: B

---

## 설계 실행 계획

### Phase 1: 컴포넌트 식별 및 정의
- [x] 백엔드 컴포넌트 식별 (API Layer, Service Layer, Data Layer, Event System)
- [x] 프론트엔드 컴포넌트 식별 (고객 UI, 관리자 UI, 공통 컴포넌트)
- [x] 컴포넌트 책임 및 인터페이스 정의
- [x] `components.md` 생성

### Phase 2: 컴포넌트 메서드 정의
- [x] 각 컴포넌트의 메서드 시그니처 정의
- [x] 입출력 타입 정의
- [x] 메서드 간 호출 관계 정의
- [x] `component-methods.md` 생성

### Phase 3: 서비스 레이어 설계
- [x] 서비스 정의 및 오케스트레이션 패턴
- [x] 서비스 간 상호작용 설계
- [x] SSE 실시간 통신 서비스 설계
- [x] `services.md` 생성

### Phase 4: 의존성 및 통신 패턴
- [x] 컴포넌트 간 의존성 매트릭스
- [x] 통신 패턴 (동기/비동기) 정의
- [x] 데이터 흐름 다이어그램
- [x] `component-dependency.md` 생성

### Phase 5: 검증 및 완료
- [x] 설계 완전성 검증
- [x] 요구사항 대비 설계 커버리지 확인
- [x] 사용자 스토리 대비 설계 매핑 확인
