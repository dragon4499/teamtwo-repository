"""Admin API router - 실제 서비스 연동."""

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel

from backend.dependencies import (
    auth_service,
    menu_service,
    order_service,
    table_service,
)

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
    """관리자 로그인."""
    return await auth_service.login_admin(store_id, body.username, body.password)


@router.post("/logout")
async def admin_logout(store_id: str) -> dict:
    """관리자 로그아웃."""
    await auth_service.logout_admin("")
    return {"message": "Logged out successfully"}


# --- Table Endpoints ---


@router.get("/tables")
async def get_tables(store_id: str) -> list[dict]:
    """테이블 목록."""
    return await table_service.get_tables(store_id)


@router.post("/tables", status_code=201)
async def create_table(store_id: str, body: TableCreateRequest) -> dict:
    """테이블 생성."""
    return await table_service.create_table(store_id, body.table_number, body.password)


@router.post("/tables/{table_num}/session/start")
async def start_session(store_id: str, table_num: int) -> dict:
    """세션 시작."""
    return await table_service.start_session(store_id, table_num)


@router.post("/tables/{table_num}/session/end")
async def end_session(store_id: str, table_num: int) -> dict:
    """세션 종료."""
    await table_service.end_session(store_id, table_num)
    return {"message": "Session ended successfully"}


# --- Order Endpoints ---


@router.get("/tables/{table_num}/orders")
async def get_table_orders(store_id: str, table_num: int) -> list[dict]:
    """테이블 주문 목록."""
    return await order_service.get_orders_by_table(store_id, table_num)


@router.get("/tables/{table_num}/history")
async def get_table_history(
    store_id: str,
    table_num: int,
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
) -> list[dict]:
    """과거 주문 이력."""
    return await table_service.get_order_history(
        store_id, table_num, date_from, date_to
    )


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    store_id: str, order_id: str, body: OrderStatusUpdateRequest
) -> dict:
    """주문 상태 변경."""
    return await order_service.update_order_status(store_id, order_id, body.status)


@router.delete("/orders/{order_id}", status_code=204)
async def delete_order(store_id: str, order_id: str) -> Response:
    """주문 삭제."""
    await order_service.delete_order(store_id, order_id)
    return Response(status_code=204)


# --- Menu Endpoints ---


@router.get("/menus")
async def get_menus(store_id: str) -> list[dict]:
    """메뉴 목록 (관리자)."""
    return await menu_service.get_menus(store_id)


@router.post("/menus", status_code=201)
async def create_menu(store_id: str, body: MenuCreateRequest) -> dict:
    """메뉴 등록."""
    return await menu_service.create_menu(store_id, body.model_dump())


@router.put("/menus/{menu_id}")
async def update_menu(store_id: str, menu_id: str, body: MenuUpdateRequest) -> dict:
    """메뉴 수정."""
    return await menu_service.update_menu(
        store_id, menu_id, body.model_dump(exclude_none=True)
    )


@router.delete("/menus/{menu_id}", status_code=204)
async def delete_menu(store_id: str, menu_id: str) -> Response:
    """메뉴 삭제."""
    await menu_service.delete_menu(store_id, menu_id)
    return Response(status_code=204)
