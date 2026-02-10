"""TableService implementation for table and session management."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt

from backend.config import BCRYPT_COST, TABLE_SESSION_EXPIRE_HOURS
from backend.data.datastore import DataStore
from backend.exceptions import DuplicateError, NotFoundError, ValidationError
from backend.models.schemas import utc_now

logger = logging.getLogger("table_order.table")


class TableService:
    """테이블 및 세션 생명주기 관리 서비스."""

    def __init__(self, datastore: DataStore, order_service: "OrderService") -> None:
        self._ds = datastore
        self._order_service = order_service

    async def create_table(
        self, store_id: str, table_number: int, password: str,
    ) -> dict:
        """테이블 등록."""
        tables = await self._ds.read("tables", store_id)
        if any(t.get("table_number") == table_number for t in tables):
            raise DuplicateError("Table", "table_number", str(table_number))

        hashed = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(rounds=BCRYPT_COST),
        ).decode("utf-8")

        table = {
            "id": str(uuid.uuid4()),
            "store_id": store_id,
            "table_number": table_number,
            "password_hash": hashed,
            "is_active": True,
            "created_at": utc_now(),
        }
        await self._ds.append("tables", store_id, table)

        # password_hash 제외하고 반환
        result = {k: v for k, v in table.items() if k != "password_hash"}
        return result

    async def get_tables(self, store_id: str) -> list[dict]:
        """매장 전체 테이블 목록 (활성 세션 정보 포함)."""
        tables = await self._ds.read("tables", store_id)
        sessions = await self._ds.read("sessions", store_id)
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        result = []
        for t in sorted(tables, key=lambda x: x.get("table_number", 0)):
            active_session = next(
                (s for s in sessions
                 if s.get("table_number") == t.get("table_number")
                 and s.get("status") == "active"
                 and s.get("expires_at", "") > now),
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
        return result

    async def start_session(self, store_id: str, table_number: int) -> dict:
        """테이블 세션 시작."""
        tables = await self._ds.read("tables", store_id)
        table = next((t for t in tables if t.get("table_number") == table_number), None)
        if not table:
            raise NotFoundError("Table", str(table_number))

        sessions = await self._ds.read("sessions", store_id)
        now_dt = datetime.now(timezone.utc)
        now_str = now_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        active = next(
            (s for s in sessions
             if s.get("table_number") == table_number
             and s.get("status") == "active"
             and s.get("expires_at", "") > now_str),
            None,
        )
        if active:
            raise ValidationError("Table already has an active session")

        expires = now_dt + timedelta(hours=TABLE_SESSION_EXPIRE_HOURS)
        session_id = f"T{table_number:02d}-{now_dt.strftime('%Y%m%d%H%M%S')}"

        session = {
            "id": session_id,
            "store_id": store_id,
            "table_number": table_number,
            "status": "active",
            "started_at": now_str,
            "expires_at": expires.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "ended_at": None,
        }
        await self._ds.append("sessions", store_id, session)
        logger.info("session_started: id=%s, table=%d", session_id, table_number)
        return session

    async def end_session(self, store_id: str, table_number: int) -> None:
        """테이블 세션 종료 (주문 이력 이동)."""
        sessions = await self._ds.read("sessions", store_id)
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        active = next(
            (s for s in sessions
             if s.get("table_number") == table_number
             and s.get("status") == "active"),
            None,
        )
        if not active:
            raise ValidationError("No active session for this table")

        session_id = active["id"]
        orders = await self._order_service.get_orders_by_session(store_id, session_id)

        # OrderHistory 생성
        if orders:
            total_session_amount = sum(o.get("total_amount", 0) for o in orders)
            history = {
                "id": str(uuid.uuid4()),
                "store_id": store_id,
                "table_number": table_number,
                "session_id": session_id,
                "orders": orders,
                "total_session_amount": total_session_amount,
                "session_started_at": active["started_at"],
                "session_ended_at": now_str,
                "archived_at": now_str,
            }
            await self._ds.append("order_history", store_id, history)

            # 현재 주문 삭제
            for order in orders:
                try:
                    await self._ds.delete("orders", store_id, order["id"])
                except Exception:
                    pass  # best-effort 삭제

        # 세션 종료 처리
        all_sessions = await self._ds.read("sessions", store_id)
        for s in all_sessions:
            if s.get("id") == session_id:
                s["status"] = "ended"
                s["ended_at"] = now_str
                break
        await self._ds.write("sessions", store_id, all_sessions)

        order_count = len(orders)
        total = sum(o.get("total_amount", 0) for o in orders) if orders else 0
        logger.info(
            "session_ended: id=%s, orders=%d, total=%d",
            session_id, order_count, total,
        )

    async def get_order_history(
        self,
        store_id: str,
        table_number: int,
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> list[dict]:
        """과거 주문 이력 조회."""
        history = await self._ds.read("order_history", store_id)
        filtered = [h for h in history if h.get("table_number") == table_number]

        if date_from:
            filtered = [h for h in filtered if h.get("session_ended_at", "") >= date_from]
        if date_to:
            filtered = [h for h in filtered if h.get("session_ended_at", "") <= date_to]

        filtered.sort(key=lambda h: h.get("session_ended_at", ""), reverse=True)
        return filtered
