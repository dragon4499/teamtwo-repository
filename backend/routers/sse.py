"""SSE router with real EventBus integration."""

import asyncio
import json

from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse

from backend.dependencies import get_event_bus
from backend.services.event_bus import EventBus

router = APIRouter(prefix="/api/stores/{store_id}/events", tags=["sse"])


async def _event_generator(store_id: str, request: Request, event_bus: EventBus):
    """실제 EventBus에서 이벤트를 수신하여 SSE로 전달."""
    event_types = ["order_created", "order_status_changed", "order_deleted"]

    async def _stream():
        async for event in event_bus.subscribe(store_id, event_types):
            if await request.is_disconnected():
                break
            yield {
                "event": event.get("type", "message"),
                "data": json.dumps(event, ensure_ascii=False),
            }

    try:
        async for item in _stream():
            yield item
    except asyncio.CancelledError:
        pass


@router.get("/orders")
async def order_events(
    store_id: str,
    request: Request,
    event_bus: EventBus = Depends(get_event_bus),
) -> EventSourceResponse:
    """주문 실시간 이벤트 스트림 (SSE)."""
    return EventSourceResponse(_event_generator(store_id, request, event_bus))
