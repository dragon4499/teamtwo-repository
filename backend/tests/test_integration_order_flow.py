"""Integration test: Order create → status change → event flow.

주문 생성부터 상태 변경까지의 전체 흐름을 서비스 레이어에서 검증합니다.
EventBus 이벤트 발행도 함께 확인합니다.
"""

import asyncio

import pytest

from backend.data.datastore import DataStore
from backend.data.seed import seed_data
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


async def _collect_events(eb: EventBus, store_id: str, event_types: list[str], count: int) -> list[dict]:
    """EventBus에서 count개의 이벤트를 수집 (타임아웃 2초)."""
    collected: list[dict] = []
    async for event in eb.subscribe(store_id, event_types):
        collected.append(event)
        if len(collected) >= count:
            break
    return collected


@pytest.mark.asyncio
async def test_full_order_lifecycle_with_events(env):
    """주문 생성 → preparing → completed 전체 흐름 + 이벤트 발행 검증."""
    eb = env["eb"]
    order_svc = env["order"]
    table_svc = env["table"]

    # 테이블 + 세션 준비
    await table_svc.create_table("store001", 1, "pw1234")
    session = await table_svc.start_session("store001", 1)
    session_id = session["id"]

    # 시드 메뉴 조회
    menus = await env["menu"].get_menus("store001")
    menu_id = menus[0]["id"]

    # 이벤트 수집 태스크 시작 (3개: created + 2 status changes)
    collector_task = asyncio.create_task(
        _collect_events(eb, "store001", ["order_created", "order_status_changed"], 3)
    )
    # 구독자가 등록될 시간 확보
    await asyncio.sleep(0.05)

    # 1) 주문 생성
    order = await order_svc.create_order(
        "store001", 1, session_id,
        [{"menu_id": menu_id, "quantity": 2}],
    )
    assert order["status"] == "pending"
    assert order["total_amount"] == menus[0]["price"] * 2

    # 2) pending → preparing
    updated = await order_svc.update_order_status("store001", order["id"], "preparing")
    assert updated["status"] == "preparing"

    # 3) preparing → completed
    updated = await order_svc.update_order_status("store001", order["id"], "completed")
    assert updated["status"] == "completed"

    # 이벤트 수집 결과 확인
    events = await asyncio.wait_for(collector_task, timeout=3.0)
    assert len(events) == 3
    assert events[0]["type"] == "order_created"
    assert events[0]["order_id"] == order["id"]
    assert events[1]["type"] == "order_status_changed"
    assert events[1]["new_status"] == "preparing"
    assert events[2]["type"] == "order_status_changed"
    assert events[2]["new_status"] == "completed"


@pytest.mark.asyncio
async def test_order_create_snapshots_menu_price(env):
    """주문 생성 시 메뉴 가격이 스냅샷으로 저장된다."""
    order_svc = env["order"]
    table_svc = env["table"]
    menu_svc = env["menu"]

    await table_svc.create_table("store001", 1, "pw1234")
    session = await table_svc.start_session("store001", 1)

    menus = await menu_svc.get_menus("store001")
    target_menu = menus[0]
    original_price = target_menu["price"]

    # 주문 생성
    order = await order_svc.create_order(
        "store001", 1, session["id"],
        [{"menu_id": target_menu["id"], "quantity": 1}],
    )
    assert order["items"][0]["price"] == original_price

    # 메뉴 가격 변경
    await menu_svc.update_menu("store001", target_menu["id"], {"price": original_price + 5000})

    # 기존 주문의 스냅샷 가격은 변하지 않음
    fetched = await order_svc.get_order("store001", order["id"])
    assert fetched["items"][0]["price"] == original_price


@pytest.mark.asyncio
async def test_multiple_orders_same_session(env):
    """같은 세션에서 여러 주문 생성 후 세션별 조회."""
    order_svc = env["order"]
    table_svc = env["table"]

    await table_svc.create_table("store001", 1, "pw1234")
    session = await table_svc.start_session("store001", 1)

    menus = await env["menu"].get_menus("store001")

    # 주문 2건 생성
    order1 = await order_svc.create_order(
        "store001", 1, session["id"],
        [{"menu_id": menus[0]["id"], "quantity": 1}],
    )
    order2 = await order_svc.create_order(
        "store001", 1, session["id"],
        [{"menu_id": menus[1]["id"], "quantity": 3}],
    )

    # 세션별 조회
    orders = await order_svc.get_orders_by_session("store001", session["id"])
    assert len(orders) == 2
    order_ids = {o["id"] for o in orders}
    assert order1["id"] in order_ids
    assert order2["id"] in order_ids


@pytest.mark.asyncio
async def test_order_number_sequential(env):
    """같은 날 주문번호가 순차적으로 증가한다."""
    order_svc = env["order"]
    table_svc = env["table"]

    await table_svc.create_table("store001", 1, "pw1234")
    session = await table_svc.start_session("store001", 1)

    menus = await env["menu"].get_menus("store001")
    menu_id = menus[0]["id"]

    o1 = await order_svc.create_order("store001", 1, session["id"], [{"menu_id": menu_id, "quantity": 1}])
    o2 = await order_svc.create_order("store001", 1, session["id"], [{"menu_id": menu_id, "quantity": 1}])

    # YYYYMMDD-NNNNN 형식
    assert o1["order_number"].endswith("-00001")
    assert o2["order_number"].endswith("-00002")


@pytest.mark.asyncio
async def test_delete_order_publishes_event(env):
    """주문 삭제 시 order_deleted 이벤트가 발행된다."""
    eb = env["eb"]
    order_svc = env["order"]
    table_svc = env["table"]

    await table_svc.create_table("store001", 1, "pw1234")
    session = await table_svc.start_session("store001", 1)
    menus = await env["menu"].get_menus("store001")

    order = await order_svc.create_order(
        "store001", 1, session["id"],
        [{"menu_id": menus[0]["id"], "quantity": 1}],
    )

    # 삭제 이벤트 수집
    collector_task = asyncio.create_task(
        _collect_events(eb, "store001", ["order_deleted"], 1)
    )
    await asyncio.sleep(0.05)

    await order_svc.delete_order("store001", order["id"])

    events = await asyncio.wait_for(collector_task, timeout=3.0)
    assert len(events) == 1
    assert events[0]["type"] == "order_deleted"
    assert events[0]["order_id"] == order["id"]
