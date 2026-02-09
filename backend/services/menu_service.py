"""MenuService - 메뉴 관리 비즈니스 로직."""

from __future__ import annotations

import logging
import uuid

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError, ValidationError
from backend.models.schemas import utc_now

logger = logging.getLogger("table_order")


class MenuService:
    """메뉴 관리 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore

    async def get_menus(self, store_id: str) -> list[dict]:
        """매장 전체 메뉴 목록 (sort_order 정렬)."""
        menus = await self._ds.read("menus", store_id)
        return sorted(menus, key=lambda m: m.get("sort_order", 0))

    async def get_menus_by_category(self, store_id: str, category: str) -> list[dict]:
        """카테고리별 메뉴 조회."""
        menus = await self.get_menus(store_id)
        return [m for m in menus if m.get("category") == category]

    async def get_menu(self, store_id: str, menu_id: str) -> dict:
        """단일 메뉴 상세."""
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
        """메뉴 수정."""
        existing = await self._ds.find_by_id("menus", store_id, menu_id)
        if not existing:
            raise NotFoundError("Menu", menu_id)

        updates = {k: v for k, v in data.items() if v is not None}
        if updates:
            self._validate_menu_updates(updates)
            return await self._ds.update("menus", store_id, menu_id, updates)
        return existing

    async def delete_menu(self, store_id: str, menu_id: str) -> None:
        """메뉴 삭제."""
        await self._ds.delete("menus", store_id, menu_id)

    def _validate_menu_data(self, data: dict) -> None:
        """메뉴 데이터 검증."""
        if not data.get("name") or not data["name"].strip():
            raise ValidationError("Menu name is required")
        if len(data["name"]) > 100:
            raise ValidationError("Menu name must be 100 characters or less")
        if "price" not in data or not isinstance(data["price"], int):
            raise ValidationError("Menu price must be an integer")
        if data["price"] < 0 or data["price"] > 1_000_000:
            raise ValidationError("Menu price must be between 0 and 1,000,000")
        if not data.get("category") or not data["category"].strip():
            raise ValidationError("Menu category is required")

    def _validate_menu_updates(self, data: dict) -> None:
        """메뉴 수정 데이터 검증."""
        if "name" in data and (not data["name"] or len(data["name"]) > 100):
            raise ValidationError("Menu name must be 1-100 characters")
        if "price" in data:
            if not isinstance(data["price"], int) or data["price"] < 0 or data["price"] > 1_000_000:
                raise ValidationError("Menu price must be between 0 and 1,000,000")
        if "category" in data and not data["category"]:
            raise ValidationError("Menu category cannot be empty")
