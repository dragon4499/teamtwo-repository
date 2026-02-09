"""Customer API router with mock responses."""

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/stores/{store_id}", tags=["customer"])


# --- Request/Response Models ---


class TableAuthRequest(BaseModel):
    table_number: int
    password: str


class OrderItemRequest(BaseModel):
    menu_id: str
    quantity: int


class OrderCreateRequest(BaseModel):
    session_id: str
    items: list[OrderItemRequest]


# --- Endpoints ---


@router.post("/tables/auth")
async def authenticate_table(store_id: str, body: TableAuthRequest) -> dict:
    """테이블 인증 (Mock)."""
    return {
        "session_id": "T01-20260209090000",
        "table_number": 1,
        "store_id": "store001",
        "expires_at": "2026-02-10T04:00:00Z",
    }


@router.get("/menus")
async def get_menus(
    store_id: str, category: str | None = Query(default=None)
) -> list[dict]:
    """메뉴 목록 조회 (Mock)."""
    return [
        {
            "id": "mock-menu-001",
            "name": "김치찌개",
            "price": 9000,
            "description": "돼지고기와 묵은지로 끓인 김치찌개",
            "category": "메인",
            "image_url": "",
            "is_available": True,
        },
        {
            "id": "mock-menu-002",
            "name": "된장찌개",
            "price": 8000,
            "description": "두부와 야채가 들어간 된장찌개",
            "category": "메인",
            "image_url": "",
            "is_available": True,
        },
        {
            "id": "mock-menu-003",
            "name": "불고기 정식",
            "price": 12000,
            "description": "양념 불고기와 반찬 세트",
            "category": "메인",
            "image_url": "",
            "is_available": True,
        },
        {
            "id": "mock-menu-004",
            "name": "콜라",
            "price": 2000,
            "description": "코카콜라 355ml",
            "category": "음료",
            "image_url": "",
            "is_available": True,
        },
        {
            "id": "mock-menu-005",
            "name": "맥주",
            "price": 4000,
            "description": "생맥주 500ml",
            "category": "음료",
            "image_url": "",
            "is_available": True,
        },
    ]


@router.post("/tables/{table_num}/orders", status_code=201)
async def create_order(
    store_id: str, table_num: int, body: OrderCreateRequest
) -> dict:
    """주문 생성 (Mock)."""
    return {
        "id": "mock-order-001",
        "order_number": "20260209-00001",
        "table_number": 1,
        "session_id": "T01-20260209090000",
        "items": [
            {
                "menu_id": "mock-menu-001",
                "menu_name": "김치찌개",
                "price": 9000,
                "quantity": 2,
                "subtotal": 18000,
            },
            {
                "menu_id": "mock-menu-004",
                "menu_name": "콜라",
                "price": 2000,
                "quantity": 1,
                "subtotal": 2000,
            },
        ],
        "total_amount": 20000,
        "status": "pending",
        "created_at": "2026-02-09T12:00:00Z",
    }


@router.get("/sessions/{session_id}/orders")
async def get_orders_by_session(store_id: str, session_id: str) -> list[dict]:
    """세션별 주문 조회 (Mock)."""
    return [
        {
            "id": "mock-order-001",
            "order_number": "20260209-00001",
            "table_number": 1,
            "session_id": "T01-20260209090000",
            "items": [
                {
                    "menu_id": "mock-menu-001",
                    "menu_name": "김치찌개",
                    "price": 9000,
                    "quantity": 2,
                    "subtotal": 18000,
                }
            ],
            "total_amount": 18000,
            "status": "pending",
            "created_at": "2026-02-09T12:00:00Z",
        }
    ]


@router.get("/orders/{order_id}")
async def get_order(store_id: str, order_id: str) -> dict:
    """주문 상세 조회 (Mock)."""
    return {
        "id": "mock-order-001",
        "order_number": "20260209-00001",
        "table_number": 1,
        "session_id": "T01-20260209090000",
        "items": [
            {
                "menu_id": "mock-menu-001",
                "menu_name": "김치찌개",
                "price": 9000,
                "quantity": 2,
                "subtotal": 18000,
            },
            {
                "menu_id": "mock-menu-004",
                "menu_name": "콜라",
                "price": 2000,
                "quantity": 1,
                "subtotal": 2000,
            },
        ],
        "total_amount": 20000,
        "status": "pending",
        "created_at": "2026-02-09T12:00:00Z",
    }
