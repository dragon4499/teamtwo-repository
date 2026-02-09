"""EventBus implementation using asyncio.Queue for in-memory pub/sub."""

from __future__ import annotations

import asyncio
import logging
import uuid
from collections.abc import AsyncGenerator

logger = logging.getLogger("table_order.event_bus")


class EventBus:
    """asyncio.Queue 기반 인메모리 이벤트 버스.

    매장(store_id) 단위로 구독자를 관리하며,
    이벤트를 모든 구독자에게 fan-out 전달합니다.
    """

    def __init__(self, queue_maxsize: int = 100) -> None:
        self._queue_maxsize = queue_maxsize
        # {store_id: {subscriber_id: asyncio.Queue}}
        self._subscribers: dict[str, dict[str, asyncio.Queue]] = {}

    async def publish(self, event: dict) -> None:
        """이벤트를 해당 매장의 모든 구독자에게 전달."""
        store_id = event.get("store_id", "")
        subscribers = self._subscribers.get(store_id, {})
        for sub_id, queue in list(subscribers.items()):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                logger.warning(
                    "event_dropped: subscriber=%s, event_type=%s",
                    sub_id, event.get("type"),
                )

    async def subscribe(
        self, store_id: str, event_types: list[str] | None = None,
    ) -> AsyncGenerator[dict, None]:
        """이벤트 구독. AsyncGenerator로 이벤트를 yield합니다."""
        subscriber_id = str(uuid.uuid4())
        queue: asyncio.Queue = asyncio.Queue(maxsize=self._queue_maxsize)

        if store_id not in self._subscribers:
            self._subscribers[store_id] = {}
        self._subscribers[store_id][subscriber_id] = queue

        logger.debug("subscribed: subscriber=%s, store=%s", subscriber_id, store_id)
        try:
            while True:
                event = await queue.get()
                if event_types and event.get("type") not in event_types:
                    continue
                yield event
        except asyncio.CancelledError:
            pass
        finally:
            await self.unsubscribe(subscriber_id)

    async def unsubscribe(self, subscriber_id: str) -> None:
        """구독 해제."""
        for store_id, subs in list(self._subscribers.items()):
            if subscriber_id in subs:
                del subs[subscriber_id]
                logger.debug("unsubscribed: subscriber=%s, store=%s", subscriber_id, store_id)
                if not subs:
                    del self._subscribers[store_id]
                break
