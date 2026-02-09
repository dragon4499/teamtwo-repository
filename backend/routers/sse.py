"""SSE router - EventBus 연동 실시간 이벤트 스트림."""

import asyncio
import json

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from backend.dependencies import event_bus

router = APIRouter(prefix="/api/stores/{store_id}/events", tags=["sse"])


async def _event_generator(store_id: str, request: Request):
    """EventBus 구독 기반 SSE 이벤트 제너레이터."""
    subscriber_id, generator = await event_bus.subscribe(store_id)
    try:
        async for event in generator:
            if await request.is_disconnected():
                break
            yield {
                "event": event["event_type"],
                "data": json.dumps(event["data"], ensure_ascii=False),
            }
    except asyncio.CancelledError:
        pass
    finally:
        await event_bus.unsubscribe(store_id, subscriber_id)


@router.get("/orders")
async def order_events(store_id: str, request: Request) -> EventSourceResponse:
    """주문 실시간 이벤트 스트림 (SSE)."""
    return EventSourceResponse(_event_generator(store_id, request))
