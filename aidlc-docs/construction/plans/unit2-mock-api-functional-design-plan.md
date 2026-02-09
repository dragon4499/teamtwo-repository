# Functional Design Plan - Unit 2: Mock API & Core Structure

## 목적
FastAPI 앱 기본 구조와 모든 API 엔드포인트의 하드코딩된 정적 Mock 응답을 설계합니다.

---

## 기능 설계 질문

### 1. Mock 응답 데이터 소스
Mock 응답에 사용할 데이터를 어떻게 관리할까요?

A) 라우터 파일 내 인라인 - 각 엔드포인트 함수 안에 dict 직접 정의 (가장 단순)
B) 별도 Mock 데이터 파일 - `mock_data.py`에 모든 Mock 응답을 모아서 관리
C) Unit 1 시드 데이터 재사용 - seed.py의 데이터 구조를 import하여 Mock 응답으로 활용

[Answer]: A

### 2. 인증 Mock 동작
Mock 단계에서 인증 미들웨어의 동작을 어떻게 할까요?

A) 완전 통과 - 모든 요청 인증 없이 통과 (가장 단순)
B) 토큰 존재 확인만 - Authorization 헤더에 아무 값이든 있으면 통과
C) 하드코딩 토큰 - 특정 문자열 (예: "mock-token")만 통과

[Answer]: A

### 3. SSE Mock 이벤트 방식
Mock SSE 엔드포인트에서 이벤트를 어떻게 생성할까요?

A) 단일 이벤트 후 종료 - 연결 시 샘플 이벤트 1개 전송 후 연결 유지 (단순)
B) 주기적 이벤트 - 5초마다 샘플 이벤트 반복 전송 (프론트엔드 테스트에 유용)

[Answer]: A

### 4. 오류 응답 형식
API 오류 응답의 JSON 형식을 어떻게 통일할까요?

A) FastAPI 기본 형식 - `{"detail": "error message"}` (FastAPI 기본)
B) 커스텀 형식 - `{"error": {"code": "NOT_FOUND", "message": "..."}}`

[Answer]: A

---

## 실행 계획

### Phase 1: API 엔드포인트 및 Mock 응답 설계
- [x] 고객 API 엔드포인트별 Mock 응답 구조 정의
- [x] 관리자 API 엔드포인트별 Mock 응답 구조 정의
- [x] SSE Mock 이벤트 구조 정의
- [x] `business-logic-model.md` 생성 (Mock 응답 로직)

### Phase 2: 라우팅 및 미들웨어 규칙
- [x] URL 라우팅 규칙 정의
- [x] CORS 설정 정의
- [x] 인증 미들웨어 Mock 동작 정의
- [x] 오류 처리 규칙 정의
- [x] `business-rules.md` 생성

### Phase 3: 서비스 인터페이스 정의
- [x] Service 추상 클래스/인터페이스 정의
- [x] 요청/응답 DTO 정의
- [x] `domain-entities.md` 생성 (DTO 및 인터페이스)
