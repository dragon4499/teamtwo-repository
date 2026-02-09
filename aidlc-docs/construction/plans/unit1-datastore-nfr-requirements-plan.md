# NFR Requirements Plan - Unit 1: DataStore

## 목적
DataStore 유닛의 비기능 요구사항 (성능, 보안, 신뢰성)과 기술 스택 세부 결정을 정의합니다.

---

## NFR 질문

### 1. 데이터 파일 크기 제한
단일 JSON 파일의 최대 크기를 어떻게 관리할까요?

A) 제한 없음 - 파일이 커져도 전체 읽기/쓰기 (MVP 단순화)
B) 경고 로그 - 파일이 10MB 초과 시 경고 로그 출력, 동작은 유지
C) 파일 분할 - 일정 크기 초과 시 자동 분할 (복잡도 높음)

[Answer]: A

### 2. 비밀번호 해싱 비용
bcrypt 해싱의 cost factor를 어떻게 설정할까요?

A) 10 (기본값) - 빠른 해싱, 일반적인 보안 수준
B) 12 (권장) - 적절한 보안과 성능 균형
C) 14 (높은 보안) - 느린 해싱, 높은 보안

[Answer]: A

### 3. 로깅 수준
DataStore 연산의 로깅 수준을 어떻게 설정할까요?

A) 최소 - 오류만 로깅
B) 표준 - 오류 + 쓰기 연산 로깅
C) 상세 - 모든 읽기/쓰기 연산 로깅 (디버깅용)

[Answer]: B

### 4. Python 버전 및 주요 라이브러리
Python 버전과 핵심 라이브러리를 확인합니다.

A) Python 3.11 + Pydantic v2 + aiofiles
B) Python 3.12 + Pydantic v2 + aiofiles
C) Python 3.13 + Pydantic v2 + aiofiles

[Answer]: C

---

## 실행 계획

### Phase 1: NFR 요구사항 정의
- [x] 성능 요구사항 정의
- [x] 보안 요구사항 정의
- [x] 신뢰성 요구사항 정의
- [x] `nfr-requirements.md` 생성

### Phase 2: 기술 스택 결정
- [x] Python 버전 및 라이브러리 확정
- [x] 테스트 프레임워크 결정
- [x] `tech-stack-decisions.md` 생성
