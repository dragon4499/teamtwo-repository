# NFR Design Plan - Unit 1: DataStore

## 목적
NFR 요구사항을 DataStore 유닛의 설계 패턴과 논리적 컴포넌트로 구체화합니다.

---

## NFR 설계 질문

### 1. 오류 복구 전략
JSON 파일이 손상되었을 때 (파싱 실패) 빈 배열로 리셋하는 것이 현재 설계입니다. 손상된 파일의 백업 처리를 어떻게 할까요?

A) 백업 없음 - 빈 배열로 리셋만 수행 (MVP 단순화)
B) 백업 생성 - 손상 파일을 `.corrupted.{timestamp}` 확장자로 이름 변경 후 빈 배열로 리셋
C) 백업 + 알림 - 백업 생성 + 로그에 CRITICAL 레벨로 기록

[Answer]: A

### 2. Lock 구현 패턴
asyncio.Lock의 타임아웃 구현 방식을 선택해주세요.

A) asyncio.wait_for 래핑 - Lock.acquire()를 wait_for로 감싸서 타임아웃 (간단)
B) asyncio.Semaphore + 타이머 - 더 세밀한 제어 가능 (복잡)

[Answer]: A

### 3. 테스트 격리 전략
DataStore 테스트 시 파일 시스템 접근을 어떻게 격리할까요?

A) 임시 디렉토리 - 각 테스트마다 tempfile.mkdtemp() 사용, 테스트 후 삭제
B) 메모리 기반 Mock - 파일 I/O를 Mock으로 대체 (빠르지만 실제 I/O 미검증)
C) 혼합 - 단위 테스트는 임시 디렉토리, 통합 테스트도 임시 디렉토리 (실제 I/O 검증)

[Answer]: A

---

## 실행 계획

### Phase 1: 설계 패턴 정의
- [x] 신뢰성 패턴 설계 (원자적 쓰기, 오류 복구)
- [x] 동시성 패턴 설계 (Lock 관리, 타임아웃)
- [x] 보안 패턴 설계 (해싱, 입력 검증)
- [x] 로깅 패턴 설계 (구조화된 로깅)
- [x] `nfr-design-patterns.md` 생성

### Phase 2: 논리적 컴포넌트 정의
- [x] DataStore 내부 컴포넌트 분해
- [x] 테스트 인프라 컴포넌트 정의
- [x] `logical-components.md` 생성
