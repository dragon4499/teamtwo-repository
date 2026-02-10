"""AuthService implementation for JWT authentication and session management."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from backend.config import (
    ADMIN_TOKEN_EXPIRE_HOURS,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    TABLE_SESSION_EXPIRE_HOURS,
)
from backend.data.datastore import DataStore
from backend.exceptions import AuthenticationError, NotFoundError

logger = logging.getLogger("table_order.auth")


class TokenBlacklist:
    """인메모리 토큰 블랙리스트."""

    def __init__(self) -> None:
        self._blacklist: dict[str, datetime] = {}  # token -> expires_at

    def add(self, token: str, expires_at: datetime) -> None:
        self._blacklist[token] = expires_at

    def is_blacklisted(self, token: str) -> bool:
        self._cleanup()
        return token in self._blacklist

    def _cleanup(self) -> None:
        now = datetime.now(timezone.utc)
        expired = [t for t, exp in self._blacklist.items() if exp <= now]
        for t in expired:
            del self._blacklist[t]


class AuthService:
    """인증 및 세션 관리 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore
        self._blacklist = TokenBlacklist()

    async def login_admin(self, store_id: str, username: str, password: str) -> dict:
        """관리자 로그인 → JWT 토큰 반환."""
        users = await self._ds.read("users", store_id)
        user = next((u for u in users if u.get("username") == username), None)
        if not user:
            logger.warning("login_failed: store=%s, user=%s, reason=not_found", store_id, username)
            raise AuthenticationError("Invalid username or password")

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            user["password_hash"].encode("utf-8"),
        ):
            logger.warning("login_failed: store=%s, user=%s, reason=bad_password", store_id, username)
            raise AuthenticationError("Invalid username or password")

        now = datetime.now(timezone.utc)
        exp = now + timedelta(hours=ADMIN_TOKEN_EXPIRE_HOURS)
        payload = {
            "sub": user["id"],
            "store_id": store_id,
            "role": user.get("role", "admin"),
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp()),
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        logger.info("login_success: store=%s, user=%s", store_id, username)
        return {
            "token": token,
            "user": {"id": user["id"], "username": user["username"], "role": user.get("role", "admin")},
        }

    async def logout_admin(self, token: str) -> None:
        """관리자 로그아웃."""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            self._blacklist.add(token, exp)
        except jwt.PyJWTError:
            pass  # 이미 만료된 토큰도 로그아웃 허용

    async def verify_admin_token(self, token: str) -> dict:
        """JWT 토큰 검증 → 관리자 정보 반환."""
        if self._blacklist.is_blacklisted(token):
            raise AuthenticationError("Token has been revoked")
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.PyJWTError:
            raise AuthenticationError("Invalid token")

        admin_id = payload.get("sub")
        store_id = payload.get("store_id")
        users = await self._ds.read("users", store_id)
        user = next((u for u in users if u.get("id") == admin_id), None)
        if not user:
            raise AuthenticationError("User not found")
        return {"id": user["id"], "username": user["username"], "store_id": store_id, "role": user.get("role", "admin")}

    async def authenticate_table(
        self, store_id: str, table_number: int, password: str,
    ) -> dict:
        """테이블 인증 → 세션 정보 반환."""
        tables = await self._ds.read("tables", store_id)
        table = next((t for t in tables if t.get("table_number") == table_number), None)
        if not table:
            logger.warning("table_auth_failed: store=%s, table=%d, reason=not_found", store_id, table_number)
            raise AuthenticationError("Invalid table or password")

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            table["password_hash"].encode("utf-8"),
        ):
            logger.warning("table_auth_failed: store=%s, table=%d, reason=bad_password", store_id, table_number)
            raise AuthenticationError("Invalid table or password")

        sessions = await self._ds.read("sessions", store_id)
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        active = next(
            (s for s in sessions
             if s.get("table_number") == table_number
             and s.get("status") == "active"
             and s.get("expires_at", "") > now),
            None,
        )
        if not active:
            raise AuthenticationError("No active session for this table")

        logger.info("table_auth_success: store=%s, table=%d", store_id, table_number)
        return {
            "session_id": active["id"],
            "table_number": table_number,
            "store_id": store_id,
            "expires_at": active["expires_at"],
        }

    async def verify_table_session(self, session_id: str, store_id: str) -> dict:
        """테이블 세션 유효성 검증."""
        sessions = await self._ds.read("sessions", store_id)
        session = next((s for s in sessions if s.get("id") == session_id), None)
        if not session:
            raise AuthenticationError("Session not found")
        if session.get("status") != "active":
            raise AuthenticationError("Session is not active")
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        if session.get("expires_at", "") <= now:
            raise AuthenticationError("Session has expired")
        return session
