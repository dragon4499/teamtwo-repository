"""Authentication dependencies for FastAPI."""

from __future__ import annotations

from fastapi import Header

from backend.exceptions import AuthenticationError


async def get_admin_token(authorization: str = Header(...)) -> str:
    """Authorization 헤더에서 Bearer 토큰 추출."""
    if not authorization.startswith("Bearer "):
        raise AuthenticationError("Invalid authorization header format")
    return authorization[7:]
