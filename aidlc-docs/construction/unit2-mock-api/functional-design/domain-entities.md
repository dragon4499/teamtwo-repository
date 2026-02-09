# Domain Entities - Unit 2: Mock API & Core Structure

---

## 1. 요청/응답 DTO (Data Transfer Objects)

> Unit 2에서는 실제 데이터 모델(Unit 1)을 사용하지 않고, API 계층의 요청/응답 형식만 정의합니다.

### 1.1 고객 API DTO

#### TableAuthRequest (테이블 인증 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| table_number | int | ✓ | 테이블 번호 |
| password | string | ✓ | 테이블 비밀번호 |

#### TableAuthResponse (테이블 인증 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| session_id | string | 세션 ID |
| table_number | int | 테이블 번호 |
| store_id | string | 매장 ID |
| expires_at | string (ISO 8601) | 세션 만료 시각 |

#### MenuResponse (메뉴 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 메뉴 ID |
| name | string | 메뉴명 |
| price | int | 가격 (원) |
| description | string | 메뉴 설명 |
| category | string | 카테고리 |
| image_url | string | 이미지 URL |
| is_available | bool | 판매 가능 여부 |

#### OrderCreateRequest (주문 생성 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| session_id | string | ✓ | 세션 ID |
| items | list[OrderItemRequest] | ✓ | 주문 항목 목록 |

#### OrderItemRequest (주문 항목 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| menu_id | string | ✓ | 메뉴 ID |
| quantity | int | ✓ | 수량 |

#### OrderResponse (주문 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 주문 ID |
| order_number | string | 주문 번호 |
| table_number | int | 테이블 번호 |
| session_id | string | 세션 ID |
| items | list[OrderItemResponse] | 주문 항목 |
| total_amount | int | 총 금액 |
| status | string | 주문 상태 |
| created_at | string (ISO 8601) | 주문 시각 |

#### OrderItemResponse (주문 항목 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| menu_id | string | 메뉴 ID |
| menu_name | string | 메뉴명 |
| price | int | 단가 |
| quantity | int | 수량 |
| subtotal | int | 소계 |

---

### 1.2 관리자 API DTO

#### AdminLoginRequest (관리자 로그인 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| username | string | ✓ | 사용자명 |
| password | string | ✓ | 비밀번호 |

#### AdminLoginResponse (관리자 로그인 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| token | string | JWT 토큰 |
| user | AdminUserResponse | 관리자 정보 |

#### AdminUserResponse (관리자 정보 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 사용자 ID |
| username | string | 사용자명 |
| role | string | 역할 |

#### TableCreateRequest (테이블 생성 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| table_number | int | ✓ | 테이블 번호 |
| password | string | ✓ | 테이블 비밀번호 |

#### TableResponse (테이블 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 테이블 ID |
| table_number | int | 테이블 번호 |
| is_active | bool | 활성 상태 |
| current_session | SessionBrief \| null | 현재 세션 요약 |

#### SessionBrief (세션 요약)
| 필드 | 타입 | 설명 |
|------|------|------|
| session_id | string | 세션 ID |
| started_at | string (ISO 8601) | 시작 시각 |
| expires_at | string (ISO 8601) | 만료 시각 |

#### OrderStatusUpdateRequest (주문 상태 변경 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| status | string | ✓ | 변경할 상태 |

#### MenuCreateRequest (메뉴 생성 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ✓ | 메뉴명 |
| price | int | ✓ | 가격 |
| description | string | ✗ | 설명 |
| category | string | ✓ | 카테고리 |
| image_url | string | ✗ | 이미지 URL |
| is_available | bool | ✗ | 판매 가능 여부 (기본 true) |
| sort_order | int | ✗ | 노출 순서 (기본 0) |

#### MenuUpdateRequest (메뉴 수정 요청)
| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ✗ | 메뉴명 |
| price | int | ✗ | 가격 |
| description | string | ✗ | 설명 |
| category | string | ✗ | 카테고리 |
| image_url | string | ✗ | 이미지 URL |
| is_available | bool | ✗ | 판매 가능 여부 |
| sort_order | int | ✗ | 노출 순서 |

#### OrderHistoryResponse (주문 이력 응답)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 이력 ID |
| session_id | string | 세션 ID |
| orders | list[OrderResponse] | 주문 목록 |
| total_session_amount | int | 세션 총 금액 |
| session_started_at | string (ISO 8601) | 세션 시작 |
| session_ended_at | string (ISO 8601) | 세션 종료 |

---

### 1.3 SSE 이벤트 DTO

#### SSEEvent (SSE 이벤트)
| 필드 | 타입 | 설명 |
|------|------|------|
| event | string | 이벤트 타입 (`order_created`, `order_status_changed`, `order_deleted`) |
| data | dict | 이벤트 데이터 (JSON) |

#### SSEOrderEventData (주문 이벤트 데이터)
| 필드 | 타입 | 설명 |
|------|------|------|
| order_id | string | 주문 ID |
| order_number | string | 주문 번호 |
| table_number | int | 테이블 번호 |
| status | string | 주문 상태 |
| total_amount | int | 총 금액 |
| timestamp | string (ISO 8601) | 이벤트 발생 시각 |

---

## 2. Service 인터페이스 정의

> Unit 2에서는 인터페이스(추상 클래스)만 정의합니다. 실제 구현은 Unit 3에서 수행합니다.

### 2.1 AuthService (인터페이스)

```python
from abc import ABC, abstractmethod

class AuthServiceBase(ABC):
    @abstractmethod
    async def login_admin(self, store_id: str, username: str, password: str) -> dict:
        """관리자 로그인 → JWT 토큰 반환"""
        ...

    @abstractmethod
    async def logout_admin(self, token: str) -> None:
        """관리자 로그아웃"""
        ...

    @abstractmethod
    async def verify_admin_token(self, token: str) -> dict:
        """JWT 토큰 검증 → 관리자 정보 반환"""
        ...

    @abstractmethod
    async def authenticate_table(self, store_id: str, table_number: int, password: str) -> dict:
        """테이블 인증 → 세션 정보 반환"""
        ...

    @abstractmethod
    async def verify_table_session(self, session_id: str) -> dict:
        """테이블 세션 유효성 검증"""
        ...
```

### 2.2 MenuService (인터페이스)

```python
class MenuServiceBase(ABC):
    @abstractmethod
    async def get_menus(self, store_id: str) -> list[dict]:
        """매장 전체 메뉴 목록"""
        ...

    @abstractmethod
    async def get_menus_by_category(self, store_id: str, category: str) -> list[dict]:
        """카테고리별 메뉴 조회"""
        ...

    @abstractmethod
    async def get_menu(self, store_id: str, menu_id: str) -> dict:
        """단일 메뉴 상세"""
        ...

    @abstractmethod
    async def create_menu(self, store_id: str, data: dict) -> dict:
        """메뉴 등록"""
        ...

    @abstractmethod
    async def update_menu(self, store_id: str, menu_id: str, data: dict) -> dict:
        """메뉴 수정"""
        ...

    @abstractmethod
    async def delete_menu(self, store_id: str, menu_id: str) -> None:
        """메뉴 삭제"""
        ...
```

### 2.3 OrderService (인터페이스)

```python
class OrderServiceBase(ABC):
    @abstractmethod
    async def create_order(self, store_id: str, table_number: int, session_id: str, items: list[dict]) -> dict:
        """주문 생성"""
        ...

    @abstractmethod
    async def get_order(self, store_id: str, order_id: str) -> dict:
        """단일 주문 조회"""
        ...

    @abstractmethod
    async def get_orders_by_session(self, store_id: str, session_id: str) -> list[dict]:
        """세션별 주문 목록"""
        ...

    @abstractmethod
    async def get_orders_by_table(self, store_id: str, table_number: int) -> list[dict]:
        """테이블별 현재 주문 목록"""
        ...

    @abstractmethod
    async def update_order_status(self, store_id: str, order_id: str, status: str) -> dict:
        """주문 상태 변경"""
        ...

    @abstractmethod
    async def delete_order(self, store_id: str, order_id: str) -> None:
        """주문 삭제"""
        ...
```

### 2.4 TableService (인터페이스)

```python
class TableServiceBase(ABC):
    @abstractmethod
    async def create_table(self, store_id: str, table_number: int, password: str) -> dict:
        """테이블 등록"""
        ...

    @abstractmethod
    async def get_tables(self, store_id: str) -> list[dict]:
        """매장 전체 테이블 목록"""
        ...

    @abstractmethod
    async def start_session(self, store_id: str, table_number: int) -> dict:
        """세션 시작"""
        ...

    @abstractmethod
    async def end_session(self, store_id: str, table_number: int) -> None:
        """세션 종료"""
        ...

    @abstractmethod
    async def get_order_history(self, store_id: str, table_number: int, date_from: str | None, date_to: str | None) -> list[dict]:
        """과거 주문 이력 조회"""
        ...
```

### 2.5 EventBus (인터페이스)

```python
from typing import AsyncGenerator

class EventBusBase(ABC):
    @abstractmethod
    async def publish(self, event: dict) -> None:
        """이벤트 발행"""
        ...

    @abstractmethod
    async def subscribe(self, store_id: str, event_types: list[str]) -> AsyncGenerator[dict, None]:
        """이벤트 구독 (SSE 스트림용)"""
        ...

    @abstractmethod
    async def unsubscribe(self, subscriber_id: str) -> None:
        """구독 해제"""
        ...
```

---

## 3. 설정 모델

### 3.1 AppConfig (앱 설정)
| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| app_title | string | "Table Order API" | FastAPI 앱 제목 |
| app_version | string | "0.1.0" | 앱 버전 |
| cors_origins | list[string] | ["http://localhost:3000", "http://localhost:3001"] | CORS 허용 오리진 |
| data_dir | string | "data" | 데이터 디렉토리 경로 |
