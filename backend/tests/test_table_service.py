"""TableService unit tests."""

import pytest

from backend.data.datastore import DataStore
from backend.exceptions import DuplicateError, NotFoundError, ValidationError
from backend.services.event_bus import EventBus
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService
from backend.services.table_service import TableService


@pytest.fixture
async def ds(tmp_path):
    return DataStore(base_path=str(tmp_path / "data"))


@pytest.fixture
async def services(ds):
    eb = EventBus()
    menu_svc = MenuService(datastore=ds)
    order_svc = OrderService(datastore=ds, event_bus=eb, menu_service=menu_svc)
    table_svc = TableService(datastore=ds, order_service=order_svc)
    return {"ds": ds, "menu": menu_svc, "order": order_svc, "table": table_svc}


@pytest.mark.asyncio
async def test_create_table(services):
    table = await services["table"].create_table("store001", 1, "1234")
    assert table["table_number"] == 1
    assert "password_hash" not in table


@pytest.mark.asyncio
async def test_create_table_duplicate(services):
    await services["table"].create_table("store001", 1, "1234")
    with pytest.raises(DuplicateError):
        await services["table"].create_table("store001", 1, "5678")


@pytest.mark.asyncio
async def test_get_tables(services):
    await services["table"].create_table("store001", 1, "1234")
    await services["table"].create_table("store001", 2, "5678")
    tables = await services["table"].get_tables("store001")
    assert len(tables) == 2
    assert tables[0]["table_number"] == 1
    assert tables[0]["current_session"] is None


@pytest.mark.asyncio
async def test_start_session(services):
    await services["table"].create_table("store001", 1, "1234")
    session = await services["table"].start_session("store001", 1)
    assert session["status"] == "active"
    assert session["table_number"] == 1
    assert session["id"].startswith("T01-")


@pytest.mark.asyncio
async def test_start_session_already_active(services):
    await services["table"].create_table("store001", 1, "1234")
    await services["table"].start_session("store001", 1)
    with pytest.raises(ValidationError, match="already has an active session"):
        await services["table"].start_session("store001", 1)


@pytest.mark.asyncio
async def test_start_session_table_not_found(services):
    with pytest.raises(NotFoundError):
        await services["table"].start_session("store001", 99)


@pytest.mark.asyncio
async def test_end_session(services):
    ds = services["ds"]
    await services["table"].create_table("store001", 1, "1234")
    session = await services["table"].start_session("store001", 1)

    # 메뉴 + 주문 생성
    await ds.append("menus", "store001", {
        "id": "m1", "store_id": "store001", "name": "김치찌개",
        "price": 9000, "category": "메인", "is_available": True,
        "description": "", "image_url": "", "sort_order": 0,
        "created_at": "2026-02-09T00:00:00Z", "updated_at": "2026-02-09T00:00:00Z",
    })
    await services["order"].create_order("store001", 1, session["id"], [
        {"menu_id": "m1", "quantity": 2},
    ])

    # 세션 종료
    await services["table"].end_session("store001", 1)

    # 주문이 이력으로 이동했는지 확인
    orders = await services["order"].get_orders_by_session("store001", session["id"])
    assert len(orders) == 0

    history = await services["table"].get_order_history("store001", 1)
    assert len(history) == 1
    assert history[0]["total_session_amount"] == 18000


@pytest.mark.asyncio
async def test_end_session_no_active(services):
    await services["table"].create_table("store001", 1, "1234")
    with pytest.raises(ValidationError, match="No active session"):
        await services["table"].end_session("store001", 1)


@pytest.mark.asyncio
async def test_get_order_history_empty(services):
    history = await services["table"].get_order_history("store001", 1)
    assert history == []
