# Functional Design Plan - Unit 4: Customer Frontend

## 목적
고객용 React.js 웹 애플리케이션의 상세 비즈니스 로직 설계.
테이블 인증, 메뉴 탐색, 장바구니 관리, 주문 생성/확인, 주문 내역 조회가 핵심 기능입니다.

---

## 실행 계획

### Phase 1: 유닛 컨텍스트 분석
- [x] Unit 4 정의 및 책임 범위 확인 (unit-of-work.md)
- [x] 할당된 스토리 확인 (unit-of-work-story-map.md) - 20개 (17 MVP + 3 향후)
- [x] 의존성 확인 (Unit 2 Mock API 엔드포인트)
- [x] 고객 API DTO 및 응답 형식 확인

### Phase 2: 설계 질문 수집
- [x] 비즈니스 로직 관련 질문 생성
- [x] UI/UX 패턴 관련 질문 생성
- [x] 상태 관리 관련 질문 생성
- [x] 사용자 답변 수집 및 분석

### Phase 3: Domain Entities 설계
- [x] Page 컴포넌트 Props/State 정의
- [x] Shared 컴포넌트 Props 정의
- [x] Context State 모델 정의
- [x] API 서비스 인터페이스 정의

### Phase 4: Business Rules 설계
- [x] 테이블 인증 플로우 규칙 (초기 설정/자동 로그인)
- [x] 메뉴 탐색 규칙 (카테고리 필터링, 카드 표시)
- [x] 장바구니 관리 규칙 (추가/삭제/수량/영속화/총액)
- [x] 주문 생성 규칙 (확인/확정/성공/실패 플로우)
- [x] 주문 내역 조회 규칙 (세션별 목록/상세)
- [x] 라우팅 및 네비게이션 규칙
- [x] 오류 처리 및 사용자 피드백 규칙

### Phase 5: Business Logic Model 설계
- [x] AuthContext 상태 관리 로직
- [x] CartContext 장바구니 관리 로직
- [x] MenuContext 메뉴 데이터 관리 로직
- [x] API 서비스 호출 로직
- [x] 페이지별 비즈니스 로직 (6개 페이지)
- [x] 예외 처리 및 오류 복구 로직

### Phase 6: 산출물 생성 및 검증
- [x] domain-entities.md 생성
- [x] business-rules.md 생성
- [x] business-logic-model.md 생성
- [x] 산출물 검증 및 일관성 확인

---

## 설계 질문

### Question 1
메뉴 페이지의 카테고리 네비게이션 위치와 레이아웃을 어떻게 설계할까요?

A) 상단 가로 탭 - 화면 상단에 카테고리 탭을 가로로 배치, 스크롤 가능
B) 좌측 세로 사이드바 - 화면 좌측에 카테고리 목록을 세로로 고정 배치
C) 상단 필터 칩 - 카테고리를 필터 칩(pill) 형태로 가로 스크롤 배치
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
장바구니 접근 방식을 어떻게 설계할까요?

A) 하단 고정 바 - 화면 하단에 장바구니 요약(수량, 총액)과 "장바구니 보기" 버튼 고정
B) 플로팅 버튼 - 화면 우하단에 장바구니 아이콘 + 수량 배지 플로팅
C) 상단 헤더 아이콘 - 상단 네비게이션 바에 장바구니 아이콘 + 수량 배지
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
메뉴 카드에서 장바구니 추가 시 수량 선택 방식을 어떻게 설계할까요?

A) 즉시 1개 추가 - 버튼 클릭 시 바로 1개 추가, 수량 조절은 장바구니 페이지에서만
B) 수량 선택 후 추가 - 메뉴 카드에 +/- 버튼으로 수량 선택 후 추가
C) 모달 수량 선택 - 메뉴 카드 클릭 시 모달에서 수량 선택 후 추가
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
주문 확인 페이지(OrderConfirmPage)에서 수량 수정이 가능해야 할까요?

A) 수정 불가 - 확인만 가능, 수정하려면 장바구니로 돌아가야 함
B) 수량만 수정 가능 - 확인 페이지에서 수량 +/- 조절 가능
C) 전체 수정 가능 - 수량 조절 + 항목 삭제 모두 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 5
주문 성공 후 메뉴 화면 리다이렉트 방식을 어떻게 설계할까요?

A) 자동 리다이렉트 - 주문 번호 표시 후 5초 카운트다운 → 자동 이동
B) 수동 이동 - 주문 번호 표시 + "메뉴로 돌아가기" 버튼만 제공
C) 혼합 방식 - 5초 카운트다운 + 즉시 이동 버튼 모두 제공
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6
테이블 초기 설정(TableSetupPage)의 접근 방식을 어떻게 설계할까요?

A) 최초 1회 설정 - 설정 완료 후 localStorage에 저장, 이후 자동 로그인만 수행
B) 설정 + 리셋 - 최초 설정 후 숨겨진 관리자 메뉴에서 재설정 가능
C) 매번 확인 - 앱 시작 시 항상 저장된 설정 유효성 검증 후 자동 로그인 시도
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
고객 앱의 전체 네비게이션 구조를 어떻게 설계할까요?

A) 하단 탭 네비게이션 - 메뉴, 장바구니, 주문내역 3개 탭
B) 단일 플로우 - 메뉴가 기본 화면, 장바구니/주문내역은 버튼으로 이동
C) 상단 탭 + 하단 장바구니 바 - 상단에 메뉴/주문내역 탭, 하단에 장바구니 바
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 8
오류 발생 시 사용자 피드백 UI 패턴을 어떻게 설계할까요?

A) 토스트 알림 - 화면 상단/하단에 일시적 토스트 메시지 표시 (3초 후 자동 사라짐)
B) 인라인 메시지 - 오류 발생 위치에 직접 오류 메시지 표시
C) 모달 알림 - 중요 오류는 모달, 경미한 오류는 토스트로 구분
D) Other (please describe after [Answer]: tag below)

[Answer]: C

