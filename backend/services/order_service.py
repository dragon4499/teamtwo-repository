"""OrderService interface definition."""

from abc import ABC, abstractmethod


class OrderServiceBase(ABC):
    """주문 처리 서비스 인터페이스."""

    @abstractmethod
    async def create_order(
        self, store_id: str, table_number: int, session_id: str, items: list[dict]
    ) -> dict:
        """주문 생성."""
        ...

    @abstractmethod
    async def get_order(self, store_id: str, order_id: str) -> dict:
        """단일 주문 조회."""
        ...

    @abstractmethod
    async def get_orders_by_session(
        self, store_id: str, session_id: str
    ) -> list[dict]:
        """세션별 주문 목록."""
        ...

    @abstractmethod
    async def get_orders_by_table(
        self, store_id: str, table_number: int
    ) -> list[dict]:
        """테이블별 현재 주문 목록."""
        ...

    @abstractmethod
    async def update_order_status(
        self, store_id: str, order_id: str, status: str
    ) -> dict:
        """주문 상태 변경."""
        ...

    @abstractmethod
    async def delete_order(self, store_id: str, order_id: str) -> None:
        """주문 삭제."""
        ...
