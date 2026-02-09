"""OrderService unit tests."""

import pytest

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError, ValidationError
from backend.services.event_bus import EventBus
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService


@pytest.fixture
async def ds(tmp_path):
    return DataStore(base_path=str(tmp_path / "data"))


@pytest.fixture
async def event_bus():
    return EventBus()


@pytest.fixture
async def services(ds, event_bus):
    menu_svc = MenuService(datastore=ds)
    order_svc = OrderService(datastore=ds, event_bus=event_bus, menu_service=menu_svc)
    return {"ds": ds, "eb": event_bus, "menu": menu_svc, "order": order_svc}


@pytest.fixture
async def seeded_services(services):
    ds = services["ds"]
    await ds.append("menus", "store001", {
        "id": "menu-001", "store_id": "store001", "name": "김치찌개",
        "price": 9000, "category": "메인", "is_available": True,
        "description": "", "image_url": "", "sort_order": 0,
        "created_at": "2026-02-09T00:00:00Z", "updated_at": "2026-02-09T00:00:00Z",
    })
    await ds.append("menus", "store001", {
        "id": "menu-002", "store_id": "store001", "name": "콜라",
        "price": 2000, "category": "음료", "is_available": True,
        "description": "", "image_url": "", "sort_order": 1,
        "created_at": "2026-02-09T00:00:00Z", "updated_at": "2026-02-09T00:00:00Z",
    })
    await ds.append("menus", "store001", {
        "id": "menu-003", "store_id": "store001", "name": "품절메뉴",
        "price": 5000, "category": "메인", "is_available": False,
        "description": "", "image_url": "", "sort_order": 2,
        "created_at": "2026-02-09T00:00:00Z", "updated_at": "2026-02-09T00:00:00Z",
    })
    return services


@pytest.mark.asyncio
async def test_create_order(seeded_services):
    order_svc = seeded_services["order"]
    order = await order_svc.create_order("store001", 1, "session-001", [
        {"menu_id": "menu-001", "quantity": 2},
        {"menu_id": "menu-002", "quantity": 1},
    ])
    assert order["total_amount"] == 20000
    assert order["status"] == "pending"
    assert len(order["items"]) == 2
    assert order["items"][0]["menu_name"] == "김치찌개"


@pytest.mark.asyncio
async def test_create_order_empty_items(seeded_services):
    with pytest.raises(ValidationError, match="at least one item"):
        await seeded_services["order"].create_order("store001", 1, "s1", [])


@pytest.mark.asyncio
async def test_create_order_unavailable_menu(seeded_services):
    with pytest.raises(ValidationError, match="not available"):
        await seeded_services["order"].create_order("store001", 1, "s1", [
            {"menu_id": "menu-003", "quantity": 1},
        ])


@pytest.mark.asyncio
async def test_create_order_nonexistent_menu(seeded_services):
    with pytest.raises(NotFoundError):
        await seeded_services["order"].create_order("store001", 1, "s1", [
            {"menu_id": "nonexistent", "quantity": 1},
        ])


@pytest.mark.asyncio
async def test_update_order_status(seeded_services):
    order_svc = seeded_services["order"]
    order = await order_svc.create_order("store001", 1, "s1", [
        {"menu_id": "menu-001", "quantity": 1},
    ])
    updated = await order_svc.update_order_status("store001", order["id"], "preparing")
    assert updated["status"] == "preparing"


@pytest.mark.asyncio
async def test_update_order_status_reverse(seeded_services):
    """preparing → pending 되돌리기 허용."""
    order_svc = seeded_services["order"]
    order = await order_svc.create_order("store001", 1, "s1", [
        {"menu_id": "menu-001", "quantity": 1},
    ])
    await order_svc.update_order_status("store001", order["id"], "preparing")
    updated = await order_svc.update_order_status("store001", order["id"], "pending")
    assert updated["status"] == "pending"


@pytest.mark.asyncio
async def test_update_order_status_invalid_transition(seeded_services):
    """completed → pending 불허."""
    order_svc = seeded_services["order"]
    order = await order_svc.create_order("store001", 1, "s1", [
        {"menu_id": "menu-001", "quantity": 1},
    ])
    await order_svc.update_order_status("store001", order["id"], "completed")
    with pytest.raises(ValidationError, match="Cannot transition"):
        await order_svc.update_order_status("store001", order["id"], "pending")


@pytest.mark.asyncio
async def test_delete_order(seeded_services):
    order_svc = seeded_services["order"]
    order = await order_svc.create_order("store001", 1, "s1", [
        {"menu_id": "menu-001", "quantity": 1},
    ])
    await order_svc.delete_order("store001", order["id"])
    with pytest.raises(NotFoundError):
        await order_svc.get_order("store001", order["id"])


@pytest.mark.asyncio
async def test_get_orders_by_session(seeded_services):
    order_svc = seeded_services["order"]
    await order_svc.create_order("store001", 1, "s1", [{"menu_id": "menu-001", "quantity": 1}])
    await order_svc.create_order("store001", 1, "s1", [{"menu_id": "menu-002", "quantity": 2}])
    await order_svc.create_order("store001", 2, "s2", [{"menu_id": "menu-001", "quantity": 1}])

    orders = await order_svc.get_orders_by_session("store001", "s1")
    assert len(orders) == 2


@pytest.mark.asyncio
async def test_get_orders_by_table(seeded_services):
    order_svc = seeded_services["order"]
    await order_svc.create_order("store001", 1, "s1", [{"menu_id": "menu-001", "quantity": 1}])
    await order_svc.create_order("store001", 2, "s2", [{"menu_id": "menu-001", "quantity": 1}])

    orders = await order_svc.get_orders_by_table("store001", 1)
    assert len(orders) == 1
