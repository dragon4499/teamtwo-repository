"""EventBus interface definition."""

from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator


class EventBusBase(ABC):
    """이벤트 기반 비동기 통신 인터페이스."""

    @abstractmethod
    async def publish(self, event: dict) -> None:
        """이벤트 발행."""
        ...

    @abstractmethod
    async def subscribe(
        self, store_id: str, event_types: list[str]
    ) -> AsyncGenerator[dict, None]:
        """이벤트 구독 (SSE 스트림용)."""
        ...

    @abstractmethod
    async def unsubscribe(self, subscriber_id: str) -> None:
        """구독 해제."""
        ...
