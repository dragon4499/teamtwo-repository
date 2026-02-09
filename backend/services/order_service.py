"""OrderService - 주문 처리 비즈니스 로직."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from backend.data.datastore import DataStore
from backend.exceptions import InvalidStateTransitionError, NotFoundError, ValidationError
from backend.models.enums import OrderStatus
from backend.models.schemas import utc_now
from backend.services.event_bus import EventBus

logger = logging.getLogger("table_order")


class OrderService:
    """주문 처리 서비스."""

    def __init__(self, datastore: DataStore, event_bus: EventBus, menu_service=None) -> None:
        self._ds = datastore
        self._event_bus = event_bus
        self._menu_service = menu_service

    async def create_order(
        self, store_id: str, table_number: int, session_id: str, items: list[dict]
    ) -> dict:
        """주문 생성."""
        if not items:
            raise ValidationError("Order must have at least one item")

        # 메뉴 검증 및 스냅샷 생성
        order_items = []
        for item in items:
            menu = await self._ds.find_by_id("menus", store_id, item["menu_id"])
            if not menu:
                raise NotFoundError("Menu", item["menu_id"])
            if not menu.get("is_available", True):
                raise ValidationError(f"Menu '{menu['name']}' is not available")

            quantity = item.get("quantity", 1)
            if quantity < 1 or quantity > 99:
                raise ValidationError("Quantity must be between 1 and 99")
            subtotal = menu["price"] * quantity
            order_items.append({
                "menu_id": menu["id"],
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
            "status": OrderStatus.PENDING.value,
            "created_at": now,
            "updated_at": now,
        }
        await self._ds.append("orders", store_id, order)

        # 이벤트 발행
        await self._event_bus.publish(store_id, "order_created", order)
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

    async def update_order_status(self, store_id: str, order_id: str, status: str) -> dict:
        """주문 상태 변경."""
        order = await self._ds.find_by_id("orders", store_id, order_id)
        if not order:
            raise NotFoundError("Order", order_id)

        current = OrderStatus(order["status"])
        try:
            target = OrderStatus(status)
        except ValueError:
            raise ValidationError(f"Invalid order status: {status}")

        if not current.can_transition_to(target):
            raise InvalidStateTransitionError(current.value, target.value)

        updated = await self._ds.update("orders", store_id, order_id, {"status": target.value})

        await self._event_bus.publish(store_id, "order_status_changed", updated)
        return updated

    async def delete_order(self, store_id: str, order_id: str) -> None:
        """주문 삭제 (관리자)."""
        order = await self._ds.find_by_id("orders", store_id, order_id)
        if not order:
            raise NotFoundError("Order", order_id)

        await self._ds.delete("orders", store_id, order_id)
        await self._event_bus.publish(store_id, "order_deleted", {"order_id": order_id})

    async def _generate_order_number(self, store_id: str) -> str:
        """주문 번호 생성: YYYYMMDD-NNNNN."""
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        orders = await self._ds.read("orders", store_id)

        # 오늘 주문 중 최대 순번 찾기
        max_seq = 0
        prefix = f"{today}-"
        for o in orders:
            num = o.get("order_number", "")
            if num.startswith(prefix):
                try:
                    seq = int(num.split("-")[1])
                    max_seq = max(max_seq, seq)
                except (IndexError, ValueError):
                    pass

        return f"{today}-{max_seq + 1:05d}"
