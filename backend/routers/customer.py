"""Customer API router with real service integration."""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from backend.dependencies import get_auth_service, get_menu_service, get_order_service
from backend.services.auth_service import AuthService
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService

router = APIRouter(prefix="/api/stores/{store_id}", tags=["customer"])


# --- Request Models ---


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
async def authenticate_table(
    store_id: str,
    body: TableAuthRequest,
    auth_svc: AuthService = Depends(get_auth_service),
) -> dict:
    """테이블 인증."""
    return await auth_svc.authenticate_table(store_id, body.table_number, body.password)


@router.get("/menus")
async def get_menus(
    store_id: str,
    category: str | None = Query(default=None),
    menu_svc: MenuService = Depends(get_menu_service),
) -> list[dict]:
    """메뉴 목록 조회."""
    if category:
        return await menu_svc.get_menus_by_category(store_id, category)
    return await menu_svc.get_menus(store_id)


@router.post("/tables/{table_num}/orders", status_code=201)
async def create_order(
    store_id: str,
    table_num: int,
    body: OrderCreateRequest,
    order_svc: OrderService = Depends(get_order_service),
) -> dict:
    """주문 생성."""
    items = [{"menu_id": i.menu_id, "quantity": i.quantity} for i in body.items]
    return await order_svc.create_order(store_id, table_num, body.session_id, items)


@router.get("/sessions/{session_id}/orders")
async def get_orders_by_session(
    store_id: str,
    session_id: str,
    order_svc: OrderService = Depends(get_order_service),
) -> list[dict]:
    """세션별 주문 조회."""
    return await order_svc.get_orders_by_session(store_id, session_id)


@router.get("/orders/{order_id}")
async def get_order(
    store_id: str,
    order_id: str,
    order_svc: OrderService = Depends(get_order_service),
) -> dict:
    """주문 상세 조회."""
    return await order_svc.get_order(store_id, order_id)
