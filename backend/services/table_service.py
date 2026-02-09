"""TableService - 테이블 및 세션 관리 비즈니스 로직."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt

from backend.config import SESSION_EXPIRY_HOURS
from backend.data.datastore import DataStore
from backend.exceptions import DuplicateError, NotFoundError, ValidationError
from backend.models.schemas import utc_now

logger = logging.getLogger("table_order")


class TableService:
    """테이블 및 세션 관리 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore

    async def create_table(self, store_id: str, table_number: int, password: str) -> dict:
        """테이블 등록."""
        if table_number < 1:
            raise ValidationError("Table number must be >= 1")
        if not password or len(password) < 4:
            raise ValidationError("Table password must be at least 4 characters")

        tables = await self._ds.read("tables", store_id)
        if any(t["table_number"] == table_number for t in tables):
            raise DuplicateError("Table", "table_number", str(table_number))

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt(rounds=10)
        ).decode("utf-8")

        table = {
            "id": str(uuid.uuid4()),
            "store_id": store_id,
            "table_number": table_number,
            "password_hash": password_hash,
            "is_active": True,
            "created_at": utc_now(),
        }
        await self._ds.append("tables", store_id, table)
        return {
            "id": table["id"],
            "table_number": table["table_number"],
            "is_active": table["is_active"],
            "current_session": None,
        }

    async def get_tables(self, store_id: str) -> list[dict]:
        """매장 전체 테이블 목록 (활성 세션 포함)."""
        tables = await self._ds.read("tables", store_id)
        sessions = await self._ds.read("sessions", store_id)

        result = []
        for t in tables:
            active_session = next(
                (s for s in sessions
                 if s["table_number"] == t["table_number"]
                 and s["status"] == "active"),
                None,
            )
            entry = {
                "id": t["id"],
                "table_number": t["table_number"],
                "is_active": t.get("is_active", True),
                "current_session": None,
            }
            if active_session:
                entry["current_session"] = {
                    "session_id": active_session["id"],
                    "started_at": active_session["started_at"],
                    "expires_at": active_session["expires_at"],
                }
            result.append(entry)
        return sorted(result, key=lambda x: x["table_number"])

    async def start_session(self, store_id: str, table_number: int) -> dict:
        """테이블 세션 시작."""
        tables = await self._ds.read("tables", store_id)
        table = next((t for t in tables if t["table_number"] == table_number), None)
        if not table:
            raise NotFoundError("Table", str(table_number))

        # 기존 활성 세션 확인
        sessions = await self._ds.read("sessions", store_id)
        active = next(
            (s for s in sessions
             if s["table_number"] == table_number and s["status"] == "active"),
            None,
        )
        if active:
            raise ValidationError(f"Table {table_number} already has an active session")

        now = datetime.now(timezone.utc)
        expires = now + timedelta(hours=SESSION_EXPIRY_HOURS)
        session_id = f"T{table_number:02d}-{now.strftime('%Y%m%d%H%M%S')}"

        session = {
            "id": session_id,
            "store_id": store_id,
            "table_number": table_number,
            "status": "active",
            "started_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expires_at": expires.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "ended_at": None,
        }
        await self._ds.append("sessions", store_id, session)
        return session

    async def end_session(self, store_id: str, table_number: int) -> None:
        """테이블 세션 종료 + 주문 이력 이동."""
        sessions = await self._ds.read("sessions", store_id)
        active = next(
            (s for s in sessions
             if s["table_number"] == table_number and s["status"] == "active"),
            None,
        )
        if not active:
            raise ValidationError(f"No active session for table {table_number}")

        session_id = active["id"]
        now = utc_now()

        # 현재 주문들을 이력으로 이동
        orders = await self._ds.read("orders", store_id)
        session_orders = [o for o in orders if o.get("session_id") == session_id]

        if session_orders:
            total = sum(o.get("total_amount", 0) for o in session_orders)
            history_entry = {
                "id": str(uuid.uuid4()),
                "store_id": store_id,
                "table_number": table_number,
                "session_id": session_id,
                "orders": session_orders,
                "total_session_amount": total,
                "session_started_at": active["started_at"],
                "session_ended_at": now,
                "archived_at": now,
            }
            await self._ds.append("order_history", store_id, history_entry)

            # 현재 주문에서 제거
            remaining = [o for o in orders if o.get("session_id") != session_id]
            await self._ds.write("orders", store_id, remaining)

        # 세션 종료 처리
        active["status"] = "ended"
        active["ended_at"] = now
        await self._ds.write("sessions", store_id, sessions)

    async def get_order_history(
        self, store_id: str, table_number: int,
        date_from: str | None = None, date_to: str | None = None
    ) -> list[dict]:
        """과거 주문 이력 조회."""
        history = await self._ds.read("order_history", store_id)
        result = [h for h in history if h.get("table_number") == table_number]

        if date_from:
            result = [h for h in result if h.get("session_ended_at", "") >= date_from]
        if date_to:
            result = [h for h in result if h.get("session_ended_at", "") <= date_to]

        return sorted(result, key=lambda h: h.get("session_ended_at", ""), reverse=True)
