"""SSE router with mock event stream."""

import asyncio
import json

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api/stores/{store_id}/events", tags=["sse"])

MOCK_ORDER_EVENT = {
    "order_id": "mock-order-001",
    "order_number": "20260209-00001",
    "table_number": 1,
    "status": "pending",
    "total_amount": 25000,
    "timestamp": "2026-02-09T12:00:00Z",
}


async def _event_generator(request: Request) -> None:
    """Mock SSE 이벤트 제너레이터."""
    # 초기 Mock 이벤트 1개 전송
    yield {
        "event": "order_created",
        "data": json.dumps(MOCK_ORDER_EVENT, ensure_ascii=False),
    }

    # keep-alive 루프
    try:
        while True:
            if await request.is_disconnected():
                break
            await asyncio.sleep(30)
            yield {"comment": "keep-alive"}
    except asyncio.CancelledError:
        pass


@router.get("/orders")
async def order_events(store_id: str, request: Request) -> EventSourceResponse:
    """주문 실시간 이벤트 스트림 (Mock SSE)."""
    return EventSourceResponse(_event_generator(request))
