"""DataStore concurrency and lock tests."""

from __future__ import annotations

import asyncio

import pytest

from backend.data.datastore import DataStore
from backend.exceptions import ConcurrencyError


class TestConcurrency:
    async def test_concurrent_writes_are_serialized(self, datastore: DataStore):
        """동시 쓰기가 직렬화되어 데이터 손실이 없는지 검증."""
        async def append_item(i: int):
            await datastore.append("items", "s1", {"id": str(i), "value": i})

        tasks = [append_item(i) for i in range(10)]
        await asyncio.gather(*tasks)

        result = await datastore.read("items", "s1")
        assert len(result) == 10
        ids = {r["id"] for r in result}
        assert ids == {str(i) for i in range(10)}

    async def test_different_entities_can_run_in_parallel(self, datastore: DataStore):
        """서로 다른 엔티티는 병렬 접근 가능."""
        async def write_entity(entity: str):
            await datastore.write(entity, "s1", [{"id": "1"}])

        await asyncio.gather(
            write_entity("menus"),
            write_entity("orders"),
            write_entity("tables"),
        )

        for entity in ("menus", "orders", "tables"):
            result = await datastore.read(entity, "s1")
            assert len(result) == 1

    async def test_different_stores_can_run_in_parallel(self, datastore: DataStore):
        """서로 다른 매장은 병렬 접근 가능."""
        async def write_store(store_id: str):
            await datastore.write("menus", store_id, [{"id": "1"}])

        await asyncio.gather(
            write_store("store1"),
            write_store("store2"),
        )

        for sid in ("store1", "store2"):
            result = await datastore.read("menus", sid)
            assert len(result) == 1


class TestLockTimeout:
    async def test_lock_timeout_raises_concurrency_error(self, tmp_path):
        """Lock 타임아웃 시 ConcurrencyError 발생."""
        ds = DataStore(base_path=str(tmp_path / "data"), lock_timeout=0.1)

        # Lock을 수동으로 획득하여 점유
        lock = ds._get_lock("menus", "s1")
        await lock.acquire()

        try:
            with pytest.raises(ConcurrencyError):
                await ds.read("menus", "s1")
        finally:
            lock.release()
