"""AuthService - 인증 및 세션 관리 비즈니스 로직."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from backend.config import (
    ACCOUNT_LOCK_MINUTES,
    JWT_ALGORITHM,
    JWT_EXPIRY_HOURS,
    JWT_SECRET,
    MAX_LOGIN_ATTEMPTS,
    SESSION_EXPIRY_HOURS,
)
from backend.data.datastore import DataStore
from backend.exceptions import (
    AccountLockedError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
)
from backend.models.schemas import utc_now

logger = logging.getLogger("table_order")


class AuthService:
    """인증 및 세션 관리 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore

    # ── Admin Auth ──

    async def login_admin(self, store_id: str, username: str, password: str) -> dict:
        """관리자 로그인 → JWT 토큰 반환."""
        users = await self._ds.read("users", store_id)
        user = next((u for u in users if u["username"] == username), None)
        if not user:
            raise AuthenticationError("Invalid username or password")

        # 계정 잠금 확인
        if user.get("locked_until"):
            locked = datetime.fromisoformat(user["locked_until"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) < locked:
                raise AccountLockedError(user["locked_until"])
            # 잠금 해제
            user["locked_until"] = None
            user["login_attempts"] = 0

        # 비밀번호 검증
        if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            user["login_attempts"] = user.get("login_attempts", 0) + 1
            if user["login_attempts"] >= MAX_LOGIN_ATTEMPTS:
                lock_until = datetime.now(timezone.utc) + timedelta(minutes=ACCOUNT_LOCK_MINUTES)
                user["locked_until"] = lock_until.strftime("%Y-%m-%dT%H:%M:%SZ")
            await self._ds.write("users", store_id, users)
            raise AuthenticationError("Invalid username or password")

        # 로그인 성공 → 시도 횟수 리셋
        user["login_attempts"] = 0
        user["locked_until"] = None
        await self._ds.write("users", store_id, users)

        # JWT 생성
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user["id"],
            "store_id": store_id,
            "username": user["username"],
            "role": user["role"],
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=JWT_EXPIRY_HOURS)).timestamp()),
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return {
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "role": user["role"],
            },
        }

    async def logout_admin(self, token: str) -> None:
        """관리자 로그아웃 (stateless JWT이므로 서버 측 처리 없음)."""
        pass

    async def verify_admin_token(self, token: str) -> dict:
        """JWT 토큰 검증 → 관리자 정보 반환."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return {
                "id": payload["sub"],
                "store_id": payload["store_id"],
                "username": payload["username"],
                "role": payload["role"],
            }
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")

    # ── Table Auth ──

    async def authenticate_table(
        self, store_id: str, table_number: int, password: str
    ) -> dict:
        """테이블 인증 → 활성 세션 정보 반환."""
        tables = await self._ds.read("tables", store_id)
        table = next(
            (t for t in tables if t["table_number"] == table_number and t.get("is_active", True)),
            None,
        )
        if not table:
            raise NotFoundError("Table", str(table_number))

        if not bcrypt.checkpw(password.encode("utf-8"), table["password_hash"].encode("utf-8")):
            raise AuthenticationError("Invalid table password")

        # 활성 세션 찾기
        sessions = await self._ds.read("sessions", store_id)
        active_session = next(
            (s for s in sessions
             if s["table_number"] == table_number
             and s["status"] == "active"),
            None,
        )
        if not active_session:
            raise ValidationError(f"No active session for table {table_number}")

        # 만료 확인
        expires = datetime.fromisoformat(active_session["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) >= expires:
            raise ValidationError(f"Session expired for table {table_number}")

        return {
            "session_id": active_session["id"],
            "table_number": table_number,
            "store_id": store_id,
            "expires_at": active_session["expires_at"],
        }

    async def verify_table_session(self, store_id: str, session_id: str) -> dict:
        """테이블 세션 유효성 검증."""
        sessions = await self._ds.read("sessions", store_id)
        session = next((s for s in sessions if s["id"] == session_id), None)
        if not session:
            raise NotFoundError("Session", session_id)

        if session["status"] != "active":
            raise ValidationError("Session is not active")

        expires = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) >= expires:
            raise ValidationError("Session expired")

        return session
