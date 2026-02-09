"""MenuService interface definition."""

from abc import ABC, abstractmethod


class MenuServiceBase(ABC):
    """메뉴 관리 서비스 인터페이스."""

    @abstractmethod
    async def get_menus(self, store_id: str) -> list[dict]:
        """매장 전체 메뉴 목록."""
        ...

    @abstractmethod
    async def get_menus_by_category(self, store_id: str, category: str) -> list[dict]:
        """카테고리별 메뉴 조회."""
        ...

    @abstractmethod
    async def get_menu(self, store_id: str, menu_id: str) -> dict:
        """단일 메뉴 상세."""
        ...

    @abstractmethod
    async def create_menu(self, store_id: str, data: dict) -> dict:
        """메뉴 등록."""
        ...

    @abstractmethod
    async def update_menu(self, store_id: str, menu_id: str, data: dict) -> dict:
        """메뉴 수정."""
        ...

    @abstractmethod
    async def delete_menu(self, store_id: str, menu_id: str) -> None:
        """메뉴 삭제."""
        ...
