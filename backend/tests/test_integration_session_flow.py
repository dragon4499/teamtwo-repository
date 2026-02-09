"""Integration test: Table create → session start → order → session end → history.

테이블 생성부터 세션 종료 후 이력 아카이빙까지의 전체 흐름을 검증합니다.
"""

import pytest

from backend.data.datastore import DataStore
from backend.data.seed import seed_data
from backend.exceptions import ValidationError
from backend.services.event_bus import EventBus
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService
from backend.services.table_service import TableService


@pytest.fixture
async def env(tmp_path):
    """통합 테스트용 전체 서비스 환경."""
    ds = DataStore(base_path=str(tmp_path / "data"))
    await seed_data(ds)
    eb = EventBus()
    menu_svc = MenuService(datastore=ds)
    order_svc = OrderService(datastore=ds, event_bus=eb, menu_service=menu_svc)
    table_svc = TableService(datastore=ds, order_service=order_svc)
    return {
        "ds": ds, "eb": eb,
        "menu": menu_svc, "order": order_svc, "table": table_svc,
    }


@pytest.mark.asyncio
async def test_full_session_lifecycle(env):
    """테이블 생성 → 세션 시작 → 주문 → 세션 종료 → 이력 확인."""
    table_svc = env["table"]
    order_svc = env["order"]
    menu_svc = env["menu"]

    # 1) 테이블 생성
    table = await table_svc.create_table("store001", 5, "secret")
    assert table["table_number"] == 5

    # 2) 세션 시작
    session = await table_svc.start_session("store001", 5)
    assert session["status"] == "active"
    session_id = session["id"]

    # 3) 메뉴 조회 + 주문 2건 생성
    menus = await menu_svc.get_menus("store001")
    order1 = await order_svc.create_order(
        "store001", 5, session_id,
        [{"menu_id": menus[0]["id"], "quantity": 2}],
    )
    order2 = await order_svc.create_order(
        "store001", 5, session_id,
        [{"menu_id": menus[1]["id"], "quantity": 1}],
    )
    expected_total = order1["total_amount"] + order2["total_amount"]

    # 주문 상태 변경
    await order_svc.update_order_status("store001", order1["id"], "completed")

    # 4) 세션 종료
    await table_svc.end_session("store001", 5)

    # 5) 현재 주문은 비어있어야 함
    current_orders = await order_svc.get_orders_by_session("store001", session_id)
    assert len(current_orders) == 0

    # 6) 이력에 아카이빙 확인
    history = await table_svc.get_order_history("store001", 5)
    assert len(history) == 1
    assert history[0]["session_id"] == session_id
    assert history[0]["total_session_amount"] == expected_total
    assert len(history[0]["orders"]) == 2


@pytest.mark.asyncio
async def test_session_end_no_orders(env):
    """주문 없이 세션 종료 시 이력이 생성되지 않는다."""
    table_svc = env["table"]

    await table_svc.create_table("store001", 3, "pw")
    await table_svc.start_session("store001", 3)
    await table_svc.end_session("store001", 3)

    history = await table_svc.get_order_history("store001", 3)
    assert len(history) == 0


@pytest.mark.asyncio
async def test_multiple_sessions_accumulate_history(env):
    """여러 세션의 이력이 누적된다."""
    table_svc = env["table"]
    order_svc = env["order"]
    menus = await env["menu"].get_menus("store001")

    await table_svc.create_table("store001", 2, "pw")

    # 세션 1
    s1 = await table_svc.start_session("store001", 2)
    await order_svc.create_order(
        "store001", 2, s1["id"],
        [{"menu_id": menus[0]["id"], "quantity": 1}],
    )
    await table_svc.end_session("store001", 2)

    # 세션 2
    s2 = await table_svc.start_session("store001", 2)
    await order_svc.create_order(
        "store001", 2, s2["id"],
        [{"menu_id": menus[1]["id"], "quantity": 2}],
    )
    await table_svc.end_session("store001", 2)

    history = await table_svc.get_order_history("store001", 2)
    assert len(history) == 2
    # 최신 세션이 먼저 (역순 정렬)
    assert history[0]["session_id"] == s2["id"]
    assert history[1]["session_id"] == s1["id"]


@pytest.mark.asyncio
async def test_cannot_start_duplicate_session(env):
    """이미 활성 세션이 있는 테이블에 세션 시작 불가."""
    table_svc = env["table"]

    await table_svc.create_table("store001", 4, "pw")
    await table_svc.start_session("store001", 4)

    with pytest.raises(ValidationError, match="already has an active session"):
        await table_svc.start_session("store001", 4)


@pytest.mark.asyncio
async def test_session_reuse_after_end(env):
    """세션 종료 후 같은 테이블에서 새 세션 시작 가능."""
    table_svc = env["table"]

    await table_svc.create_table("store001", 6, "pw")
    s1 = await table_svc.start_session("store001", 6)
    await table_svc.end_session("store001", 6)

    # 새 세션 시작 가능
    s2 = await table_svc.start_session("store001", 6)
    assert s2["status"] == "active"
    assert s2["id"] != s1["id"]


@pytest.mark.asyncio
async def test_tables_list_shows_active_session(env):
    """테이블 목록에서 활성 세션 정보가 표시된다."""
    table_svc = env["table"]

    await table_svc.create_table("store001", 7, "pw1")
    await table_svc.create_table("store001", 8, "pw2")

    # 7번만 세션 시작
    session = await table_svc.start_session("store001", 7)

    tables = await table_svc.get_tables("store001")
    t7 = next(t for t in tables if t["table_number"] == 7)
    t8 = next(t for t in tables if t["table_number"] == 8)

    assert t7["current_session"] is not None
    assert t7["current_session"]["session_id"] == session["id"]
    assert t8["current_session"] is None
