"""Admin API router with mock responses."""

from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter(prefix="/api/stores/{store_id}/admin", tags=["admin"])


# --- Request Models ---


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class TableCreateRequest(BaseModel):
    table_number: int
    password: str


class OrderStatusUpdateRequest(BaseModel):
    status: str


class MenuCreateRequest(BaseModel):
    name: str
    price: int
    description: str = ""
    category: str
    image_url: str = ""
    is_available: bool = True
    sort_order: int = 0


class MenuUpdateRequest(BaseModel):
    name: str | None = None
    price: int | None = None
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    is_available: bool | None = None
    sort_order: int | None = None


# --- Auth Endpoints ---


@router.post("/login")
async def admin_login(store_id: str, body: AdminLoginRequest) -> dict:
    """관리자 로그인 (Mock)."""
    return {
        "token": "mock-jwt-token-admin",
        "user": {
            "id": "mock-admin-001",
            "username": "admin",
            "role": "admin",
        },
    }


@router.post("/logout")
async def admin_logout(store_id: str) -> dict:
    """관리자 로그아웃 (Mock)."""
    return {"message": "Logged out successfully"}


# --- Table Endpoints ---


@router.get("/tables")
async def get_tables(store_id: str) -> list[dict]:
    """테이블 목록 (Mock)."""
    return [
        {
            "id": "mock-table-001",
            "table_number": 1,
            "is_active": True,
            "current_session": {
                "session_id": "T01-20260209090000",
                "started_at": "2026-02-09T12:00:00Z",
                "expires_at": "2026-02-10T04:00:00Z",
            },
        },
        {
            "id": "mock-table-002",
            "table_number": 2,
            "is_active": True,
            "current_session": None,
        },
        {
            "id": "mock-table-003",
            "table_number": 3,
            "is_active": True,
            "current_session": None,
        },
    ]


@router.post("/tables", status_code=201)
async def create_table(store_id: str, body: TableCreateRequest) -> dict:
    """테이블 생성 (Mock)."""
    return {
        "id": "mock-table-new",
        "table_number": 4,
        "is_active": True,
        "current_session": None,
    }


@router.post("/tables/{table_num}/session/start")
async def start_session(store_id: str, table_num: int) -> dict:
    """세션 시작 (Mock)."""
    return {
        "session_id": "T01-20260209120000",
        "table_number": 1,
        "started_at": "2026-02-09T12:00:00Z",
        "expires_at": "2026-02-10T04:00:00Z",
        "status": "active",
    }


@router.post("/tables/{table_num}/session/end")
async def end_session(store_id: str, table_num: int) -> dict:
    """세션 종료 (Mock)."""
    return {"message": "Session ended successfully"}


# --- Order Endpoints ---


@router.get("/tables/{table_num}/orders")
async def get_table_orders(store_id: str, table_num: int) -> list[dict]:
    """테이블 주문 목록 (Mock)."""
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
        },
        {
            "id": "mock-order-002",
            "order_number": "20260209-00002",
            "table_number": 1,
            "session_id": "T01-20260209090000",
            "items": [
                {
                    "menu_id": "mock-menu-003",
                    "menu_name": "불고기 정식",
                    "price": 12000,
                    "quantity": 1,
                    "subtotal": 12000,
                }
            ],
            "total_amount": 12000,
            "status": "preparing",
            "created_at": "2026-02-09T12:05:00Z",
        },
    ]


@router.get("/tables/{table_num}/history")
async def get_table_history(store_id: str, table_num: int) -> list[dict]:
    """과거 주문 이력 (Mock)."""
    return [
        {
            "id": "mock-history-001",
            "session_id": "T01-20260208090000",
            "orders": [
                {
                    "id": "mock-hist-order-001",
                    "order_number": "20260208-00001",
                    "table_number": 1,
                    "session_id": "T01-20260208090000",
                    "items": [
                        {
                            "menu_id": "mock-menu-001",
                            "menu_name": "김치찌개",
                            "price": 9000,
                            "quantity": 1,
                            "subtotal": 9000,
                        }
                    ],
                    "total_amount": 9000,
                    "status": "completed",
                    "created_at": "2026-02-08T12:00:00Z",
                }
            ],
            "total_session_amount": 9000,
            "session_started_at": "2026-02-08T09:00:00Z",
            "session_ended_at": "2026-02-08T22:00:00Z",
        }
    ]


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    store_id: str, order_id: str, body: OrderStatusUpdateRequest
) -> dict:
    """주문 상태 변경 (Mock)."""
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
            }
        ],
        "total_amount": 18000,
        "status": "preparing",
        "created_at": "2026-02-09T12:00:00Z",
    }


@router.delete("/orders/{order_id}", status_code=204)
async def delete_order(store_id: str, order_id: str) -> Response:
    """주문 삭제 (Mock)."""
    return Response(status_code=204)


# --- Menu Endpoints ---


@router.get("/menus")
async def get_menus(store_id: str) -> list[dict]:
    """메뉴 목록 - 관리자 (Mock)."""
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


@router.post("/menus", status_code=201)
async def create_menu(store_id: str, body: MenuCreateRequest) -> dict:
    """메뉴 등록 (Mock)."""
    return {
        "id": "mock-menu-new",
        "name": "새 메뉴",
        "price": 10000,
        "description": "새로 등록된 메뉴",
        "category": "메인",
        "image_url": "",
        "is_available": True,
        "sort_order": 0,
        "created_at": "2026-02-09T12:00:00Z",
        "updated_at": "2026-02-09T12:00:00Z",
    }


@router.put("/menus/{menu_id}")
async def update_menu(store_id: str, menu_id: str, body: MenuUpdateRequest) -> dict:
    """메뉴 수정 (Mock)."""
    return {
        "id": "mock-menu-001",
        "name": "김치찌개 (수정됨)",
        "price": 10000,
        "description": "돼지고기와 묵은지로 끓인 김치찌개",
        "category": "메인",
        "image_url": "",
        "is_available": True,
        "sort_order": 0,
        "created_at": "2026-02-09T12:00:00Z",
        "updated_at": "2026-02-09T12:00:00Z",
    }


@router.delete("/menus/{menu_id}", status_code=204)
async def delete_menu(store_id: str, menu_id: str) -> Response:
    """메뉴 삭제 (Mock)."""
    return Response(status_code=204)
