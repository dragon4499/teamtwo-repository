"""TableService interface definition."""

from abc import ABC, abstractmethod


class TableServiceBase(ABC):
    """테이블 및 세션 관리 서비스 인터페이스."""

    @abstractmethod
    async def create_table(
        self, store_id: str, table_number: int, password: str
    ) -> dict:
        """테이블 등록."""
        ...

    @abstractmethod
    async def get_tables(self, store_id: str) -> list[dict]:
        """매장 전체 테이블 목록."""
        ...

    @abstractmethod
    async def start_session(self, store_id: str, table_number: int) -> dict:
        """세션 시작."""
        ...

    @abstractmethod
    async def end_session(self, store_id: str, table_number: int) -> None:
        """세션 종료."""
        ...

    @abstractmethod
    async def get_order_history(
        self,
        store_id: str,
        table_number: int,
        date_from: str | None,
        date_to: str | None,
    ) -> list[dict]:
        """과거 주문 이력 조회."""
        ...
