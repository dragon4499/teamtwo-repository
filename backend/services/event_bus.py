"""EventBus implementation using asyncio.Queue for pub/sub."""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from collections.abc import AsyncGenerator
from typing import Any

logger = logging.getLogger("table_order")


class EventBus:
    """asyncio.Queue 기반 인메모리 이벤트 버스.

    매장별 구독자 관리 및 이벤트 발행/구독을 제공합니다.
    """

    def __init__(self) -> None:
        # {store_id: {subscriber_id: asyncio.Queue}}
        self._subscribers: dict[str, dict[str, asyncio.Queue]] = {}

    async def publish(self, store_id: str, event_type: str, data: dict[str, Any]) -> None:
        """이벤트를 해당 매장의 모든 구독자에게 발행."""
        event = {
            "event_type": event_type,
            "store_id": store_id,
            "data": data,
        }
        subscribers = self._subscribers.get(store_id, {})
        for sub_id, queue in list(subscribers.items()):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning("queue_full: subscriber=%s, dropping event", sub_id)

    async def subscribe(self, store_id: str) -> tuple[str, AsyncGenerator[dict, None]]:
        """매장 이벤트 구독. (subscriber_id, event_generator) 반환."""
        subscriber_id = str(uuid.uuid4())
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)

        if store_id not in self._subscribers:
            self._subscribers[store_id] = {}
        self._subscribers[store_id][subscriber_id] = queue

        async def _generator() -> AsyncGenerator[dict, None]:
            try:
                while True:
                    event = await queue.get()
                    yield event
            except asyncio.CancelledError:
                pass
            finally:
                await self.unsubscribe(store_id, subscriber_id)

        return subscriber_id, _generator()

    async def unsubscribe(self, store_id: str, subscriber_id: str) -> None:
        """구독 해제."""
        subscribers = self._subscribers.get(store_id, {})
        subscribers.pop(subscriber_id, None)
        if not subscribers and store_id in self._subscribers:
            del self._subscribers[store_id]
