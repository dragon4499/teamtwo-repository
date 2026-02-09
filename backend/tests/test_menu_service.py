"""MenuService unit tests."""

import pytest

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError, ValidationError
from backend.services.menu_service import MenuService


@pytest.fixture
async def ds(tmp_path):
    return DataStore(base_path=str(tmp_path / "data"))


@pytest.fixture
async def menu_svc(ds):
    return MenuService(datastore=ds)


@pytest.fixture
async def seeded_menu_svc(ds):
    await ds.append("menus", "store001", {
        "id": "menu-001",
        "store_id": "store001",
        "name": "김치찌개",
        "price": 9000,
        "description": "맛있는 김치찌개",
        "category": "메인",
        "image_url": "",
        "is_available": True,
        "sort_order": 1,
        "created_at": "2026-02-09T00:00:00Z",
        "updated_at": "2026-02-09T00:00:00Z",
    })
    await ds.append("menus", "store001", {
        "id": "menu-002",
        "store_id": "store001",
        "name": "콜라",
        "price": 2000,
        "description": "코카콜라",
        "category": "음료",
        "image_url": "",
        "is_available": True,
        "sort_order": 2,
        "created_at": "2026-02-09T00:00:00Z",
        "updated_at": "2026-02-09T00:00:00Z",
    })
    return MenuService(datastore=ds)


@pytest.mark.asyncio
async def test_get_menus(seeded_menu_svc):
    menus = await seeded_menu_svc.get_menus("store001")
    assert len(menus) == 2
    assert menus[0]["sort_order"] <= menus[1]["sort_order"]


@pytest.mark.asyncio
async def test_get_menus_by_category(seeded_menu_svc):
    menus = await seeded_menu_svc.get_menus_by_category("store001", "음료")
    assert len(menus) == 1
    assert menus[0]["name"] == "콜라"


@pytest.mark.asyncio
async def test_get_menu(seeded_menu_svc):
    menu = await seeded_menu_svc.get_menu("store001", "menu-001")
    assert menu["name"] == "김치찌개"


@pytest.mark.asyncio
async def test_get_menu_not_found(seeded_menu_svc):
    with pytest.raises(NotFoundError):
        await seeded_menu_svc.get_menu("store001", "nonexistent")


@pytest.mark.asyncio
async def test_create_menu(menu_svc):
    menu = await menu_svc.create_menu("store001", {
        "name": "된장찌개",
        "price": 8000,
        "category": "메인",
    })
    assert menu["name"] == "된장찌개"
    assert menu["id"]
    assert menu["is_available"] is True


@pytest.mark.asyncio
async def test_create_menu_validation_error(menu_svc):
    with pytest.raises(ValidationError):
        await menu_svc.create_menu("store001", {"name": "", "price": 8000, "category": "메인"})


@pytest.mark.asyncio
async def test_update_menu(seeded_menu_svc):
    updated = await seeded_menu_svc.update_menu("store001", "menu-001", {"price": 10000})
    assert updated["price"] == 10000


@pytest.mark.asyncio
async def test_delete_menu_soft(seeded_menu_svc):
    await seeded_menu_svc.delete_menu("store001", "menu-001")
    menu = await seeded_menu_svc.get_menu("store001", "menu-001")
    assert menu["is_available"] is False
