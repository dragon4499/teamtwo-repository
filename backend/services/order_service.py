"""OrderService implementation for order processing."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError, ValidationError
from backend.models.enums import OrderStatus
from backend.models.schemas import utc_now
from backend.services.event_bus import EventBus

logger = logging.getLogger("table_order.order")


class OrderService:
    """주문 처리 서비스."""

    def __init__(
        self,
        datastore: DataStore,
        event_bus: EventBus,
        menu_service: "MenuService",
    ) -> None:
        self._ds = datastore
        self._event_bus = event_bus
        self._menu_service = menu_service

    async def create_order(
        self,
        store_id: str,
        table_number: int,
        session_id: str,
        items: list[dict],
    ) -> dict:
        """주문 생성."""
        if not items:
            raise ValidationError("Order must have at least one item")

        # 메뉴 검증 및 스냅샷
        order_items = []
        for item in items:
            menu_id = item.get("menu_id", "")
            quantity = item.get("quantity", 0)
            if quantity < 1:
                raise ValidationError(f"quantity must be >= 1 for menu {menu_id}")

            menu = await self._menu_service.get_menu(store_id, menu_id)
            if not menu.get("is_available", False):
                raise ValidationError(f"Menu '{menu.get('name')}' is not available")

            subtotal = menu["price"] * quantity
            order_items.append({
                "menu_id": menu_id,
                "menu_name": menu["name"],
                "price": menu["price"],
                "quantity": quantity,
                "subtotal": subtotal,
            })

        total_amount = sum(i["subtotal"] for i in order_items)
        order_number = await self._generate_order_number(store_id)
        now = utc_now()

        order = {
            "id": str(uuid.uuid4()),
            "order_number": order_number,
            "store_id": store_id,
            "table_number": table_number,
            "session_id": session_id,
            "items": order_items,
            "total_amount": total_amount,
            "status": OrderStatus.PENDING,
            "created_at": now,
            "updated_at": now,
        }
        await self._ds.append("orders", store_id, order)
        logger.info(
            "order_created: number=%s, table=%d, total=%d",
            order_number, table_number, total_amount,
        )

        await self._event_bus.publish({
            "type": "order_created",
            "store_id": store_id,
            "order_id": order["id"],
            "order_number": order_number,
            "table_number": table_number,
            "status": OrderStatus.PENDING,
            "total_amount": total_amount,
            "timestamp": now,
        })
        return order

    async def get_order(self, store_id: str, order_id: str) -> dict:
        """단일 주문 조회."""
        order = await self._ds.find_by_id("orders", store_id, order_id)
        if not order:
            raise NotFoundError("Order", order_id)
        return order

    async def get_orders_by_session(self, store_id: str, session_id: str) -> list[dict]:
        """세션별 주문 목록."""
        orders = await self._ds.read("orders", store_id)
        return [o for o in orders if o.get("session_id") == session_id]

    async def get_orders_by_table(self, store_id: str, table_number: int) -> list[dict]:
        """테이블별 현재 주문 목록."""
        orders = await self._ds.read("orders", store_id)
        return [o for o in orders if o.get("table_number") == table_number]

    async def update_order_status(
        self, store_id: str, order_id: str, new_status: str,
    ) -> dict:
        """주문 상태 변경."""
        order = await self._ds.find_by_id("orders", store_id, order_id)
        if not order:
            raise NotFoundError("Order", order_id)

        current = OrderStatus(order["status"])
        target = OrderStatus(new_status)
        if not current.can_transition_to(target):
            raise ValidationError(
                f"Cannot transition from '{current}' to '{target}'"
            )

        now = utc_now()
        updated = await self._ds.update("orders", store_id, order_id, {
            "status": target.value,
            "updated_at": now,
        })
        logger.info("order_status_changed: id=%s, %s→%s", order_id, current, target)

        await self._event_bus.publish({
            "type": "order_status_changed",
            "store_id": store_id,
            "order_id": order_id,
            "order_number": order.get("order_number"),
            "table_number": order.get("table_number"),
            "old_status": current.value,
            "new_status": target.value,
            "timestamp": now,
        })
        return updated

    async def delete_order(self, store_id: str, order_id: str) -> None:
        """주문 삭제 (관리자)."""
        order = await self._ds.find_by_id("orders", store_id, order_id)
        if not order:
            raise NotFoundError("Order", order_id)

        await self._ds.delete("orders", store_id, order_id)
        now = utc_now()
        logger.info("order_deleted: id=%s, table=%s", order_id, order.get("table_number"))

        await self._event_bus.publish({
            "type": "order_deleted",
            "store_id": store_id,
            "order_id": order_id,
            "order_number": order.get("order_number"),
            "table_number": order.get("table_number"),
            "timestamp": now,
        })

    async def _generate_order_number(self, store_id: str) -> str:
        """당일 주문 수 기반 순번 생성: YYYYMMDD-NNNNN."""
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        orders = await self._ds.read("orders", store_id)
        today_count = sum(
            1 for o in orders
            if o.get("order_number", "").startswith(today)
        )
        return f"{today}-{today_count + 1:05d}"
