"""Admin API router with real service integration."""

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from backend.dependencies import (
    get_auth_service,
    get_menu_service,
    get_order_service,
    get_table_service,
)
from backend.middleware.auth import get_admin_token
from backend.services.auth_service import AuthService
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService
from backend.services.table_service import TableService

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


# --- Auth Endpoints (공개) ---


@router.post("/login")
async def admin_login(
    store_id: str,
    body: AdminLoginRequest,
    auth_svc: AuthService = Depends(get_auth_service),
) -> dict:
    """관리자 로그인."""
    return await auth_svc.login_admin(store_id, body.username, body.password)


@router.post("/logout")
async def admin_logout(
    store_id: str,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
) -> dict:
    """관리자 로그아웃."""
    await auth_svc.logout_admin(token)
    return {"message": "Logged out successfully"}


# --- Table Endpoints (인증 필요) ---


@router.get("/tables")
async def get_tables(
    store_id: str,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    table_svc: TableService = Depends(get_table_service),
) -> list[dict]:
    """테이블 목록."""
    await auth_svc.verify_admin_token(token)
    return await table_svc.get_tables(store_id)


@router.post("/tables", status_code=201)
async def create_table(
    store_id: str,
    body: TableCreateRequest,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    table_svc: TableService = Depends(get_table_service),
) -> dict:
    """테이블 생성."""
    await auth_svc.verify_admin_token(token)
    return await table_svc.create_table(store_id, body.table_number, body.password)


@router.post("/tables/{table_num}/session/start")
async def start_session(
    store_id: str,
    table_num: int,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    table_svc: TableService = Depends(get_table_service),
) -> dict:
    """세션 시작."""
    await auth_svc.verify_admin_token(token)
    return await table_svc.start_session(store_id, table_num)


@router.post("/tables/{table_num}/session/end")
async def end_session(
    store_id: str,
    table_num: int,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    table_svc: TableService = Depends(get_table_service),
) -> dict:
    """세션 종료."""
    await auth_svc.verify_admin_token(token)
    await table_svc.end_session(store_id, table_num)
    return {"message": "Session ended successfully"}


# --- Order Endpoints (인증 필요) ---


@router.get("/tables/{table_num}/orders")
async def get_table_orders(
    store_id: str,
    table_num: int,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    order_svc: OrderService = Depends(get_order_service),
) -> list[dict]:
    """테이블 주문 목록."""
    await auth_svc.verify_admin_token(token)
    return await order_svc.get_orders_by_table(store_id, table_num)


@router.get("/tables/{table_num}/history")
async def get_table_history(
    store_id: str,
    table_num: int,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    table_svc: TableService = Depends(get_table_service),
) -> list[dict]:
    """과거 주문 이력."""
    await auth_svc.verify_admin_token(token)
    return await table_svc.get_order_history(store_id, table_num)


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    store_id: str,
    order_id: str,
    body: OrderStatusUpdateRequest,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    order_svc: OrderService = Depends(get_order_service),
) -> dict:
    """주문 상태 변경."""
    await auth_svc.verify_admin_token(token)
    return await order_svc.update_order_status(store_id, order_id, body.status)


@router.delete("/orders/{order_id}", status_code=204)
async def delete_order(
    store_id: str,
    order_id: str,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    order_svc: OrderService = Depends(get_order_service),
) -> Response:
    """주문 삭제."""
    await auth_svc.verify_admin_token(token)
    await order_svc.delete_order(store_id, order_id)
    return Response(status_code=204)


# --- Menu Endpoints (인증 필요) ---


@router.get("/menus")
async def get_menus(
    store_id: str,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    menu_svc: MenuService = Depends(get_menu_service),
) -> list[dict]:
    """메뉴 목록 - 관리자."""
    await auth_svc.verify_admin_token(token)
    return await menu_svc.get_menus(store_id)


@router.post("/menus", status_code=201)
async def create_menu(
    store_id: str,
    body: MenuCreateRequest,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    menu_svc: MenuService = Depends(get_menu_service),
) -> dict:
    """메뉴 등록."""
    await auth_svc.verify_admin_token(token)
    return await menu_svc.create_menu(store_id, body.model_dump())


@router.put("/menus/{menu_id}")
async def update_menu(
    store_id: str,
    menu_id: str,
    body: MenuUpdateRequest,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    menu_svc: MenuService = Depends(get_menu_service),
) -> dict:
    """메뉴 수정."""
    await auth_svc.verify_admin_token(token)
    return await menu_svc.update_menu(store_id, menu_id, body.model_dump(exclude_unset=True))


@router.delete("/menus/{menu_id}", status_code=204)
async def delete_menu(
    store_id: str,
    menu_id: str,
    token: str = Depends(get_admin_token),
    auth_svc: AuthService = Depends(get_auth_service),
    menu_svc: MenuService = Depends(get_menu_service),
) -> Response:
    """메뉴 삭제 (소프트 삭제)."""
    await auth_svc.verify_admin_token(token)
    await menu_svc.delete_menu(store_id, menu_id)
    return Response(status_code=204)
