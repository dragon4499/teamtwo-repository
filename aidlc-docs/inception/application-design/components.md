# 테이블오더 시스템 - 컴포넌트 정의

## 시스템 개요

테이블오더 시스템은 크게 3개의 독립적인 애플리케이션으로 구성됩니다:
1. **Backend API Server** (Python/FastAPI)
2. **Customer Frontend** (React.js)
3. **Admin Frontend** (React.js)

---

## 1. Backend Components

### 1.1 API Layer

#### 1.1.1 CustomerRouter
- **목적**: 고객용 API 엔드포인트 제공
- **책임**:
  - 테이블 인증 및 세션 관리 엔드포인트
  - 메뉴 조회 엔드포인트
  - 장바구니는 클라이언트 로컬 관리 (서버 API 불필요)
  - 주문 생성 및 조회 엔드포인트
- **인터페이스**: REST API (`/api/stores/{store_id}/...`)

#### 1.1.2 AdminRouter
- **목적**: 관리자용 API 엔드포인트 제공
- **책임**:
  - 관리자 인증 (로그인/로그아웃) 엔드포인트
  - 주문 모니터링 및 상태 변경 엔드포인트
  - 테이블 관리 (생성, 세션 시작/종료) 엔드포인트
  - 메뉴 CRUD 엔드포인트
  - SSE 실시간 스트림 엔드포인트
- **인터페이스**: REST API (`/api/stores/{store_id}/admin/...`)

#### 1.1.3 SSERouter
- **목적**: Server-Sent Events 실시간 스트림 제공
- **책임**:
  - 관리자 대시보드용 주문 실시간 스트림
  - 연결 관리 및 자동 재연결 지원
  - 이벤트 필터링 (매장별)
- **인터페이스**: SSE Endpoint (`/api/stores/{store_id}/events/orders`)

### 1.2 Service Layer

#### 1.2.1 AuthService
- **목적**: 인증 및 세션 관리 비즈니스 로직
- **책임**:
  - 관리자 로그인/로그아웃 처리
  - JWT 토큰 생성 및 검증
  - 테이블 인증 (매장ID + 테이블번호 + 비밀번호)
  - 로그인 시도 제한
- **의존성**: DataStore (users, tables)

#### 1.2.2 MenuService
- **목적**: 메뉴 관리 비즈니스 로직
- **책임**:
  - 메뉴 CRUD 처리
  - 카테고리별 메뉴 조회
  - 메뉴 데이터 검증
- **의존성**: DataStore (menus)

#### 1.2.3 OrderService
- **목적**: 주문 처리 비즈니스 로직
- **책임**:
  - 주문 생성 및 검증
  - 주문 상태 변경 (대기중/준비중/완료)
  - 주문 삭제 (관리자)
  - 세션별 주문 조회
  - 주문 번호 생성
- **의존성**: DataStore (orders), EventBus, MenuService

#### 1.2.4 TableService
- **목적**: 테이블 및 세션 관리 비즈니스 로직
- **책임**:
  - 테이블 등록 및 설정
  - 세션 시작/종료
  - 세션 만료 관리 (16시간)
  - 과거 주문 이력 관리
- **의존성**: DataStore (tables, sessions), OrderService

#### 1.2.5 EventBus
- **목적**: 이벤트 기반 비동기 통신
- **책임**:
  - 이벤트 발행 (주문 생성, 상태 변경 등)
  - 이벤트 구독 관리
  - SSE 클라이언트에 이벤트 전달
- **구현**: Python asyncio.Queue 기반
- **의존성**: 없음 (독립적)

### 1.3 Data Layer

#### 1.3.1 DataStore
- **목적**: 파일 기반 데이터 영속화
- **책임**:
  - JSON 파일 읽기/쓰기
  - 엔티티별 개별 파일 관리
  - 동시성 제어 (파일 잠금)
  - 데이터 무결성 보장
- **데이터 파일**:
  - `data/stores.json` - 매장 정보
  - `data/users.json` - 관리자 계정
  - `data/menus.json` - 메뉴 데이터
  - `data/tables.json` - 테이블 정보
  - `data/sessions.json` - 세션 데이터
  - `data/orders.json` - 주문 데이터
  - `data/order_history.json` - 과거 주문 이력

### 1.4 Middleware

#### 1.4.1 AuthMiddleware
- **목적**: 요청 인증 및 권한 검증
- **책임**:
  - JWT 토큰 검증 (관리자)
  - 테이블 세션 검증 (고객)
  - 매장 접근 권한 확인

#### 1.4.2 ErrorHandler
- **목적**: 전역 오류 처리
- **책임**:
  - 예외 캐치 및 표준화된 오류 응답
  - 오류 로깅
  - 사용자 친화적 오류 메시지 변환

---

## 2. Customer Frontend Components

### 2.1 Pages

#### 2.1.1 TableSetupPage
- **목적**: 테이블 태블릿 초기 설정 화면
- **책임**: 매장ID, 테이블번호, 비밀번호 입력 및 저장

#### 2.1.2 MenuPage
- **목적**: 메뉴 탐색 및 장바구니 관리 (기본 화면)
- **책임**: 카테고리별 메뉴 표시, 장바구니 추가

#### 2.1.3 CartPage
- **목적**: 장바구니 상세 관리
- **책임**: 수량 조절, 삭제, 총액 표시, 주문하기

#### 2.1.4 OrderConfirmPage
- **목적**: 주문 최종 확인
- **책임**: 주문 내역 확인, 확정/취소

#### 2.1.5 OrderSuccessPage
- **목적**: 주문 완료 화면
- **책임**: 주문 번호 표시, 메뉴 화면 리다이렉트

#### 2.1.6 OrderHistoryPage
- **목적**: 현재 세션 주문 내역 조회
- **책임**: 주문 목록 및 상세 정보 표시

### 2.2 Shared Components

#### 2.2.1 MenuCard
- **목적**: 개별 메뉴 카드 UI
- **책임**: 메뉴 정보 표시, 장바구니 추가 버튼

#### 2.2.2 CategoryNav
- **목적**: 카테고리 네비게이션
- **책임**: 카테고리 목록 표시, 선택 상태 관리

#### 2.2.3 CartBadge
- **목적**: 장바구니 아이콘 및 수량 배지
- **책임**: 장바구니 아이템 수 표시

#### 2.2.4 CartItem
- **목적**: 장바구니 내 개별 메뉴 항목
- **책임**: 수량 조절, 삭제, 소계 표시

### 2.3 State Management

#### 2.3.1 AuthContext
- **목적**: 테이블 인증 상태 관리
- **책임**: 로그인 정보 저장/복원, 세션 상태

#### 2.3.2 CartContext
- **목적**: 장바구니 상태 관리
- **책임**: 장바구니 CRUD, localStorage 동기화, 총액 계산

#### 2.3.3 MenuContext
- **목적**: 메뉴 데이터 캐싱
- **책임**: 메뉴 목록 로드, 카테고리 필터링

---

## 3. Admin Frontend Components

### 3.1 Pages

#### 3.1.1 LoginPage
- **목적**: 관리자 로그인 화면
- **책임**: 매장ID, 사용자명, 비밀번호 입력 및 인증

#### 3.1.2 DashboardPage
- **목적**: 실시간 주문 모니터링 대시보드
- **책임**: 테이블별 주문 그리드, SSE 실시간 업데이트

#### 3.1.3 TableDetailPage
- **목적**: 테이블 상세 주문 내역
- **책임**: 주문 목록, 상태 변경, 주문 삭제

#### 3.1.4 TableManagementPage
- **목적**: 테이블 관리
- **책임**: 테이블 추가, 세션 시작/종료, 과거 내역 조회

#### 3.1.5 MenuManagementPage
- **목적**: 메뉴 관리
- **책임**: 메뉴 CRUD, 카테고리 관리

### 3.2 Shared Components

#### 3.2.1 TableCard
- **목적**: 대시보드 테이블 카드
- **책임**: 테이블 상태, 최신 주문 미리보기, 총액 표시

#### 3.2.2 OrderCard
- **목적**: 주문 카드
- **책임**: 주문 정보 표시, 상태 변경 버튼

#### 3.2.3 OrderStatusBadge
- **목적**: 주문 상태 배지
- **책임**: 상태별 색상 표시 (대기중/준비중/완료)

#### 3.2.4 MenuForm
- **목적**: 메뉴 등록/수정 폼
- **책임**: 메뉴 정보 입력, 데이터 검증

### 3.3 State Management

#### 3.3.1 AdminAuthContext
- **목적**: 관리자 인증 상태 관리
- **책임**: JWT 토큰 관리 (localStorage), 세션 만료 감지

#### 3.3.2 OrderContext
- **목적**: 주문 데이터 상태 관리
- **책임**: SSE 이벤트 수신, 주문 목록 실시간 업데이트

#### 3.3.3 SSEContext
- **목적**: SSE 연결 상태 관리
- **책임**: SSE 연결/재연결, 이벤트 디스패치
