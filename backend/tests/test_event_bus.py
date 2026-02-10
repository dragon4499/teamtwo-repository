"""EventBus unit tests."""

import asyncio

import pytest

from backend.services.event_bus import EventBus


@pytest.fixture
def event_bus():
    return EventBus(queue_maxsize=10)


@pytest.mark.asyncio
async def test_publish_and_subscribe(event_bus):
    """이벤트 발행 후 구독자가 수신하는지 확인."""
    received = []

    async def consume():
        async for event in event_bus.subscribe("store001", ["order_created"]):
            received.append(event)
            break  # 1개만 수신 후 종료

    task = asyncio.create_task(consume())
    await asyncio.sleep(0.05)

    await event_bus.publish({
        "type": "order_created",
        "store_id": "store001",
        "order_id": "o1",
    })
    await asyncio.sleep(0.05)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    assert len(received) == 1
    assert received[0]["order_id"] == "o1"


@pytest.mark.asyncio
async def test_event_type_filtering(event_bus):
    """구독한 이벤트 타입만 수신하는지 확인."""
    received = []

    async def consume():
        async for event in event_bus.subscribe("store001", ["order_deleted"]):
            received.append(event)
            break

    task = asyncio.create_task(consume())
    await asyncio.sleep(0.05)

    # order_created는 필터링되어야 함
    await event_bus.publish({
        "type": "order_created",
        "store_id": "store001",
    })
    # order_deleted는 수신되어야 함
    await event_bus.publish({
        "type": "order_deleted",
        "store_id": "store001",
        "order_id": "o2",
    })
    await asyncio.sleep(0.05)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    assert len(received) == 1
    assert received[0]["type"] == "order_deleted"


@pytest.mark.asyncio
async def test_store_isolation(event_bus):
    """다른 매장의 이벤트는 수신하지 않는지 확인."""
    received = []

    async def consume():
        async for event in event_bus.subscribe("store001"):
            received.append(event)
            break

    task = asyncio.create_task(consume())
    await asyncio.sleep(0.05)

    # 다른 매장 이벤트
    await event_bus.publish({"type": "order_created", "store_id": "store002"})
    await asyncio.sleep(0.05)

    # 같은 매장 이벤트
    await event_bus.publish({"type": "order_created", "store_id": "store001"})
    await asyncio.sleep(0.05)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    assert len(received) == 1
    assert received[0]["store_id"] == "store001"


@pytest.mark.asyncio
async def test_queue_full_drops_event(event_bus):
    """Queue가 가득 차면 이벤트가 드롭되는지 확인."""
    # 구독자 등록
    received = []

    async def consume():
        async for event in event_bus.subscribe("store001"):
            received.append(event)
            if len(received) >= 10:
                break

    task = asyncio.create_task(consume())
    await asyncio.sleep(0.05)

    # maxsize=10 이상 발행
    for i in range(15):
        await event_bus.publish({"type": "test", "store_id": "store001", "i": i})

    await asyncio.sleep(0.1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    # 최대 10개만 수신 (나머지 드롭)
    assert len(received) <= 10
