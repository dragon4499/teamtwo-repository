# Domain Entities - Unit 1: DataStore

---

## 1. Store (매장)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 매장 고유 식별자 | 영숫자, 3-20자 |
| name | string | ✓ | 매장 이름 | 1-100자 |
| created_at | string (ISO 8601) | ✓ | 생성 시각 | 자동 생성 |
| updated_at | string (ISO 8601) | ✓ | 수정 시각 | 자동 갱신 |

---

## 2. AdminUser (관리자 계정)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 사용자 고유 ID | UUID v4 |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| username | string | ✓ | 사용자명 | 영숫자, 3-30자, 매장 내 고유 |
| password_hash | string | ✓ | bcrypt 해시 비밀번호 | bcrypt 해시 |
| role | string | ✓ | 역할 | "admin" 또는 "staff" |
| login_attempts | int | ✓ | 연속 로그인 실패 횟수 | 기본값 0, 최대 5 |
| locked_until | string (ISO 8601) \| null | ✗ | 계정 잠금 해제 시각 | null이면 잠금 없음 |
| created_at | string (ISO 8601) | ✓ | 생성 시각 | 자동 생성 |

---

## 3. Menu (메뉴)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 메뉴 고유 ID | UUID v4 |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| name | string | ✓ | 메뉴명 | 1-100자 |
| price | int | ✓ | 가격 (원 단위) | 0 이상, 최대 1,000,000 |
| description | string | ✗ | 메뉴 설명 | 최대 500자 |
| category | string | ✓ | 카테고리 | 1-50자 |
| image_url | string | ✗ | 이미지 URL | URL 형식 또는 빈 문자열 |
| is_available | bool | ✓ | 판매 가능 여부 | 기본값 true |
| sort_order | int | ✓ | 노출 순서 | 0 이상, 기본값 0 |
| created_at | string (ISO 8601) | ✓ | 생성 시각 | 자동 생성 |
| updated_at | string (ISO 8601) | ✓ | 수정 시각 | 자동 갱신 |

---

## 4. Table (테이블)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 테이블 고유 ID | UUID v4 |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| table_number | int | ✓ | 테이블 번호 | 1 이상, 매장 내 고유 |
| password_hash | string | ✓ | bcrypt 해시 비밀번호 | bcrypt 해시 |
| is_active | bool | ✓ | 활성 상태 | 기본값 true |
| created_at | string (ISO 8601) | ✓ | 생성 시각 | 자동 생성 |

---

## 5. TableSession (테이블 세션)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 세션 ID | 형식: T{테이블번호}-{YYYYMMDDHHmmss} |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| table_number | int | ✓ | 테이블 번호 | Table.table_number 참조 |
| status | string | ✓ | 세션 상태 | "active" 또는 "ended" |
| started_at | string (ISO 8601) | ✓ | 세션 시작 시각 | 자동 생성 |
| expires_at | string (ISO 8601) | ✓ | 세션 만료 시각 | started_at + 16시간 |
| ended_at | string (ISO 8601) \| null | ✗ | 세션 종료 시각 | 종료 시 기록 |

---

## 6. Order (주문)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 주문 고유 ID | UUID v4 |
| order_number | string | ✓ | 주문 번호 | 형식: YYYYMMDD-NNNNN (5자리 순번) |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| table_number | int | ✓ | 테이블 번호 | Table.table_number 참조 |
| session_id | string | ✓ | 세션 ID | TableSession.id 참조 |
| items | list[OrderItem] | ✓ | 주문 항목 목록 | 최소 1개 |
| total_amount | int | ✓ | 총 주문 금액 (원) | items 합계와 일치 |
| status | string | ✓ | 주문 상태 | OrderStatus enum |
| created_at | string (ISO 8601) | ✓ | 주문 시각 | 자동 생성 |
| updated_at | string (ISO 8601) | ✓ | 수정 시각 | 자동 갱신 |

---

## 7. OrderItem (주문 항목)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| menu_id | string | ✓ | 메뉴 ID | Menu.id 참조 |
| menu_name | string | ✓ | 메뉴명 (스냅샷) | 주문 시점 메뉴명 |
| price | int | ✓ | 단가 (원, 스냅샷) | 주문 시점 가격 |
| quantity | int | ✓ | 수량 | 1 이상, 최대 99 |
| subtotal | int | ✓ | 소계 (원) | price × quantity |

---

## 8. OrderHistory (과거 주문 이력)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| id | string | ✓ | 이력 고유 ID | UUID v4 |
| store_id | string | ✓ | 소속 매장 ID | Store.id 참조 |
| table_number | int | ✓ | 테이블 번호 | |
| session_id | string | ✓ | 세션 ID | |
| orders | list[Order] | ✓ | 해당 세션의 주문 목록 | |
| total_session_amount | int | ✓ | 세션 총 금액 (원) | orders 합계 |
| session_started_at | string (ISO 8601) | ✓ | 세션 시작 시각 | |
| session_ended_at | string (ISO 8601) | ✓ | 세션 종료 시각 | |
| archived_at | string (ISO 8601) | ✓ | 이력 저장 시각 | 자동 생성 |

---

## 9. Enums

### OrderStatus
| 값 | 설명 |
|----|------|
| `pending` | 대기중 |
| `preparing` | 준비중 |
| `completed` | 완료 |

### SessionStatus
| 값 | 설명 |
|----|------|
| `active` | 활성 |
| `ended` | 종료 |

### UserRole
| 값 | 설명 |
|----|------|
| `admin` | 관리자 |
| `staff` | 직원 |

---

## 10. 엔티티 관계도

```
Store (1) ──── (N) AdminUser
  |
  ├──── (N) Menu
  |
  ├──── (N) Table ──── (N) TableSession
  |                          |
  ├──── (N) Order ───────────┘
  |          |
  |          └──── (N) OrderItem ──── Menu (참조)
  |
  └──── (N) OrderHistory
               |
               └──── (N) Order (스냅샷)
```

### 관계 설명
- Store → AdminUser: 1:N (매장에 여러 관리자)
- Store → Menu: 1:N (매장에 여러 메뉴)
- Store → Table: 1:N (매장에 여러 테이블)
- Table → TableSession: 1:N (테이블에 여러 세션, 시간순)
- TableSession → Order: 1:N (세션에 여러 주문)
- Order → OrderItem: 1:N (주문에 여러 항목)
- OrderItem → Menu: N:1 (항목이 메뉴 참조, 스냅샷)
- Store → OrderHistory: 1:N (매장에 여러 이력)
