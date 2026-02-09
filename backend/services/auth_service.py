"""AuthService interface definition."""

from abc import ABC, abstractmethod


class AuthServiceBase(ABC):
    """인증 및 세션 관리 서비스 인터페이스."""

    @abstractmethod
    async def login_admin(self, store_id: str, username: str, password: str) -> dict:
        """관리자 로그인 → JWT 토큰 반환."""
        ...

    @abstractmethod
    async def logout_admin(self, token: str) -> None:
        """관리자 로그아웃."""
        ...

    @abstractmethod
    async def verify_admin_token(self, token: str) -> dict:
        """JWT 토큰 검증 → 관리자 정보 반환."""
        ...

    @abstractmethod
    async def authenticate_table(
        self, store_id: str, table_number: int, password: str
    ) -> dict:
        """테이블 인증 → 세션 정보 반환."""
        ...

    @abstractmethod
    async def verify_table_session(self, session_id: str) -> dict:
        """테이블 세션 유효성 검증."""
        ...
