"""File-based data store with async I/O and concurrency control."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import aiofiles

from backend.exceptions import ConcurrencyError, NotFoundError

logger = logging.getLogger("datastore")


class DataStore:
    """JSON 파일 기반 데이터 저장소.

    엔티티별 개별 JSON 파일을 관리하며, asyncio.Lock 기반
    동시성 제어와 원자적 쓰기를 제공합니다.
    """

    def __init__(self, base_path: str = "data", lock_timeout: float = 5.0) -> None:
        self._base_path = Path(base_path)
        self._lock_timeout = lock_timeout
        self._locks: dict[str, asyncio.Lock] = {}
        self._base_path.mkdir(parents=True, exist_ok=True)

    # ── Lock Management ──

    def _get_lock(self, entity: str, store_id: str) -> asyncio.Lock:
        key = f"{entity}_{store_id}"
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]

    async def _acquire_lock(self, entity: str, store_id: str) -> asyncio.Lock:
        lock = self._get_lock(entity, store_id)
        try:
            await asyncio.wait_for(lock.acquire(), timeout=self._lock_timeout)
        except asyncio.TimeoutError:
            logger.error(
                "lock_timeout: entity=%s, store_id=%s, timeout=%ss",
                entity, store_id, self._lock_timeout,
            )
            raise ConcurrencyError(
                f"Lock timeout for {entity}_{store_id} "
                f"after {self._lock_timeout}s"
            )
        return lock

    @asynccontextmanager
    async def _locked(self, entity: str, store_id: str) -> AsyncIterator[None]:
        lock = await self._acquire_lock(entity, store_id)
        try:
            yield
        finally:
            lock.release()

    # ── Path Resolution ──

    def _get_file_path(self, entity: str, store_id: str) -> Path:
        if entity == "stores":
            return self._base_path / "stores.json"
        return self._base_path / store_id / f"{entity}.json"

    def _ensure_directory(self, file_path: Path) -> None:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        if file_path.parent != self._base_path:
            logger.info("directory_created: path=%s", file_path.parent)

    # ── File I/O ──

    async def _read_file(self, file_path: Path) -> list[dict]:
        if not file_path.exists():
            return []
        try:
            async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                content = await f.read()
            return json.loads(content)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(
                "json_parse_failed: file=%s, error=%s", file_path, str(e)
            )
            return []

    async def _atomic_write(self, file_path: Path, data: list[dict]) -> None:
        self._ensure_directory(file_path)
        tmp_path = file_path.with_suffix(file_path.suffix + ".tmp")
        try:
            async with aiofiles.open(tmp_path, "w", encoding="utf-8") as f:
                await f.write(json.dumps(data, ensure_ascii=False, indent=2))
            os.replace(str(tmp_path), str(file_path))
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            raise

    # ── Public API ──

    async def read(self, entity: str, store_id: str) -> list[dict]:
        """엔티티 전체 데이터 읽기."""
        async with self._locked(entity, store_id):
            file_path = self._get_file_path(entity, store_id)
            return await self._read_file(file_path)

    async def write(self, entity: str, store_id: str, data: list[dict]) -> None:
        """엔티티 전체 데이터 쓰기 (덮어쓰기)."""
        async with self._locked(entity, store_id):
            file_path = self._get_file_path(entity, store_id)
            await self._atomic_write(file_path, data)
            logger.info(
                "write: entity=%s, store_id=%s, records=%d",
                entity, store_id, len(data),
            )

    async def find_by_id(
        self, entity: str, store_id: str, id: str
    ) -> dict | None:
        """ID로 단건 조회."""
        data = await self.read(entity, store_id)
        for record in data:
            if record.get("id") == id:
                return record
        return None

    async def append(self, entity: str, store_id: str, record: dict) -> None:
        """레코드 추가."""
        async with self._locked(entity, store_id):
            file_path = self._get_file_path(entity, store_id)
            data = await self._read_file(file_path)
            data.append(record)
            await self._atomic_write(file_path, data)
            logger.info(
                "append: entity=%s, store_id=%s, records=%d",
                entity, store_id, len(data),
            )

    async def update(
        self, entity: str, store_id: str, id: str, updates: dict
    ) -> dict:
        """레코드 수정. 수정된 레코드를 반환."""
        from backend.models.schemas import utc_now

        async with self._locked(entity, store_id):
            file_path = self._get_file_path(entity, store_id)
            data = await self._read_file(file_path)
            for record in data:
                if record.get("id") == id:
                    record.update(updates)
                    record["updated_at"] = utc_now()
                    await self._atomic_write(file_path, data)
                    logger.info(
                        "update: entity=%s, store_id=%s, id=%s",
                        entity, store_id, id,
                    )
                    return record
            raise NotFoundError(entity, id)

    async def delete(self, entity: str, store_id: str, id: str) -> None:
        """레코드 삭제."""
        async with self._locked(entity, store_id):
            file_path = self._get_file_path(entity, store_id)
            data = await self._read_file(file_path)
            original_len = len(data)
            data = [r for r in data if r.get("id") != id]
            if len(data) == original_len:
                raise NotFoundError(entity, id)
            await self._atomic_write(file_path, data)
            logger.info(
                "delete: entity=%s, store_id=%s, id=%s",
                entity, store_id, id,
            )
