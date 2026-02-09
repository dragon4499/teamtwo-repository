"""Seed data tests."""

from __future__ import annotations

import pytest

from backend.data.datastore import DataStore
from backend.data.seed import seed_data


class TestSeedData:
    async def test_seed_creates_store(self, datastore: DataStore):
        await seed_data(datastore)
        stores = await datastore.read("stores", "")
        assert len(stores) == 1
        assert stores[0]["id"] == "store001"
        assert stores[0]["name"] == "맛있는 식당"

    async def test_seed_creates_admin(self, datastore: DataStore):
        await seed_data(datastore)
        users = await datastore.read("users", "store001")
        assert len(users) == 1
        assert users[0]["username"] == "admin"
        assert users[0]["role"] == "admin"
        assert users[0]["password_hash"].startswith("$2b$")

    async def test_seed_creates_28_menus(self, datastore: DataStore):
        await seed_data(datastore)
        menus = await datastore.read("menus", "store001")
        assert len(menus) == 28

    async def test_seed_menu_categories(self, datastore: DataStore):
        await seed_data(datastore)
        menus = await datastore.read("menus", "store001")
        categories = {m["category"] for m in menus}
        assert categories == {"메인", "세트메뉴", "사이드", "계절메뉴", "음료", "디저트"}

    async def test_seed_initializes_empty_entities(self, datastore: DataStore):
        await seed_data(datastore)
        for entity in ("tables", "sessions", "orders", "order_history"):
            data = await datastore.read(entity, "store001")
            assert data == []

    async def test_seed_is_idempotent(self, datastore: DataStore):
        """2회 실행해도 데이터가 중복되지 않음."""
        await seed_data(datastore)
        await seed_data(datastore)

        stores = await datastore.read("stores", "")
        assert len(stores) == 1

        users = await datastore.read("users", "store001")
        assert len(users) == 1

        menus = await datastore.read("menus", "store001")
        assert len(menus) == 28
