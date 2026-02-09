"""Customer API router - service integration."""

from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.dependencies import auth_service, menu_service, order_service

router = APIRouter(prefix="/api/stores/{store_id}", tags=["customer"])


class TableAuthRequest(BaseModel):
    table_number: int
    password: str


class OrderItemRequest(BaseModel):
    menu_id: str
    quantity: int


class OrderCreateRequest(BaseModel):
    session_id: str
    items: list[OrderItemRequest]


@router.post("/tables/auth")
async def authenticate_table(store_id: str, body: TableAuthRequest) -> dict:
    return await auth_service.authenticate_table(
        store_id, body.table_number, body.password
    )


@router.get("/menus")
async def get_menus(
    store_id: str, category: str | None = Query(default=None)
) -> list[dict]:
    if category:
        return await menu_service.get_menus_by_category(store_id, category)
    return await menu_service.get_menus(store_id)


@router.post("/tables/{table_num}/orders", status_code=201)
async def create_order(
    store_id: str, table_num: int, body: OrderCreateRequest
) -> dict:
    items = [{"menu_id": i.menu_id, "quantity": i.quantity} for i in body.items]
    return await order_service.create_order(
        store_id, table_num, body.session_id, items
    )


@router.get("/sessions/{session_id}/orders")
async def get_orders_by_session(store_id: str, session_id: str) -> list[dict]:
    return await order_service.get_orders_by_session(store_id, session_id)


@router.get("/orders/{order_id}")
async def get_order(store_id: str, order_id: str) -> dict:
    return await order_service.get_order(store_id, order_id)
