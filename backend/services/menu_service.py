"""MenuService implementation for menu CRUD operations."""

from __future__ import annotations

import logging
import uuid

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError, ValidationError
from backend.models.schemas import utc_now

logger = logging.getLogger("table_order.menu")


class MenuService:
    """메뉴 관리 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore

    async def get_menus(self, store_id: str) -> list[dict]:
        """매장 전체 메뉴 목록 (sort_order 정렬)."""
        menus = await self._ds.read("menus", store_id)
        menus.sort(key=lambda m: m.get("sort_order", 0))
        return menus

    async def get_menus_by_category(self, store_id: str, category: str) -> list[dict]:
        """카테고리별 메뉴 조회."""
        menus = await self._ds.read("menus", store_id)
        filtered = [m for m in menus if m.get("category") == category]
        filtered.sort(key=lambda m: m.get("sort_order", 0))
        return filtered

    async def get_menu(self, store_id: str, menu_id: str) -> dict:
        """단일 메뉴 상세 조회."""
        menu = await self._ds.find_by_id("menus", store_id, menu_id)
        if not menu:
            raise NotFoundError("Menu", menu_id)
        return menu

    async def create_menu(self, store_id: str, data: dict) -> dict:
        """메뉴 등록."""
        self._validate_menu_data(data)
        now = utc_now()
        menu = {
            "id": str(uuid.uuid4()),
            "store_id": store_id,
            "name": data["name"],
            "price": data["price"],
            "description": data.get("description", ""),
            "category": data["category"],
            "image_url": data.get("image_url", ""),
            "is_available": data.get("is_available", True),
            "sort_order": data.get("sort_order", 0),
            "created_at": now,
            "updated_at": now,
        }
        await self._ds.append("menus", store_id, menu)
        return menu

    async def update_menu(self, store_id: str, menu_id: str, data: dict) -> dict:
        """메뉴 수정 (부분 업데이트)."""
        existing = await self._ds.find_by_id("menus", store_id, menu_id)
        if not existing:
            raise NotFoundError("Menu", menu_id)

        updates = {}
        for field in ("name", "price", "description", "category", "image_url", "is_available", "sort_order"):
            if field in data and data[field] is not None:
                updates[field] = data[field]

        if not updates:
            return existing

        if "name" in updates:
            name = updates["name"]
            if not name or len(name) > 100:
                raise ValidationError("name must be 1~100 characters")
        if "price" in updates and updates["price"] < 0:
            raise ValidationError("price must be >= 0")
        if "category" in updates and not updates["category"]:
            raise ValidationError("category must not be empty")

        updated = await self._ds.update("menus", store_id, menu_id, updates)
        return updated

    async def delete_menu(self, store_id: str, menu_id: str) -> None:
        """메뉴 소프트 삭제 (is_available = false)."""
        existing = await self._ds.find_by_id("menus", store_id, menu_id)
        if not existing:
            raise NotFoundError("Menu", menu_id)
        await self._ds.update("menus", store_id, menu_id, {"is_available": False})

    def _validate_menu_data(self, data: dict) -> None:
        name = data.get("name", "")
        if not name or len(name) > 100:
            raise ValidationError("name must be 1~100 characters")
        price = data.get("price")
        if price is None or price < 0:
            raise ValidationError("price must be >= 0")
        category = data.get("category", "")
        if not category:
            raise ValidationError("category must not be empty")
