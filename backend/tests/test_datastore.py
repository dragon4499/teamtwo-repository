"""DataStore CRUD unit tests."""

from __future__ import annotations

import json

import pytest

from backend.data.datastore import DataStore
from backend.exceptions import NotFoundError


class TestRead:
    async def test_read_empty_returns_empty_list(self, datastore: DataStore):
        result = await datastore.read("menus", "store001")
        assert result == []

    async def test_read_existing_data(self, datastore: DataStore):
        records = [{"id": "1", "name": "test"}]
        await datastore.write("menus", "store001", records)
        result = await datastore.read("menus", "store001")
        assert result == records

    async def test_read_corrupted_json_returns_empty(self, datastore: DataStore):
        file_path = datastore._get_file_path("menus", "store001")
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text("not valid json{{{", encoding="utf-8")
        result = await datastore.read("menus", "store001")
        assert result == []

    async def test_read_stores_entity(self, datastore: DataStore):
        stores = [{"id": "s1", "name": "Store 1"}]
        await datastore.write("stores", "", stores)
        result = await datastore.read("stores", "")
        assert result == stores


class TestWrite:
    async def test_write_creates_file(self, datastore: DataStore):
        data = [{"id": "1", "name": "item"}]
        await datastore.write("menus", "store001", data)
        file_path = datastore._get_file_path("menus", "store001")
        assert file_path.exists()
        content = json.loads(file_path.read_text(encoding="utf-8"))
        assert content == data

    async def test_write_creates_directory(self, datastore: DataStore):
        await datastore.write("orders", "newstore", [])
        file_path = datastore._get_file_path("orders", "newstore")
        assert file_path.parent.exists()

    async def test_write_overwrites_existing(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1"}])
        await datastore.write("menus", "s1", [{"id": "2"}])
        result = await datastore.read("menus", "s1")
        assert len(result) == 1
        assert result[0]["id"] == "2"


class TestFindById:
    async def test_find_existing(self, datastore: DataStore):
        records = [{"id": "a1", "name": "A"}, {"id": "b2", "name": "B"}]
        await datastore.write("menus", "s1", records)
        result = await datastore.find_by_id("menus", "s1", "b2")
        assert result is not None
        assert result["name"] == "B"

    async def test_find_nonexistent_returns_none(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "a1"}])
        result = await datastore.find_by_id("menus", "s1", "missing")
        assert result is None

    async def test_find_in_empty_returns_none(self, datastore: DataStore):
        result = await datastore.find_by_id("menus", "s1", "any")
        assert result is None


class TestAppend:
    async def test_append_to_empty(self, datastore: DataStore):
        await datastore.append("menus", "s1", {"id": "1", "name": "A"})
        result = await datastore.read("menus", "s1")
        assert len(result) == 1
        assert result[0]["id"] == "1"

    async def test_append_to_existing(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1"}])
        await datastore.append("menus", "s1", {"id": "2"})
        result = await datastore.read("menus", "s1")
        assert len(result) == 2


class TestUpdate:
    async def test_update_existing(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1", "name": "old", "updated_at": ""}])
        result = await datastore.update("menus", "s1", "1", {"name": "new"})
        assert result["name"] == "new"
        assert result["updated_at"] != ""

    async def test_update_nonexistent_raises(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1"}])
        with pytest.raises(NotFoundError):
            await datastore.update("menus", "s1", "missing", {"name": "x"})


class TestDelete:
    async def test_delete_existing(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1"}, {"id": "2"}])
        await datastore.delete("menus", "s1", "1")
        result = await datastore.read("menus", "s1")
        assert len(result) == 1
        assert result[0]["id"] == "2"

    async def test_delete_nonexistent_raises(self, datastore: DataStore):
        await datastore.write("menus", "s1", [{"id": "1"}])
        with pytest.raises(NotFoundError):
            await datastore.delete("menus", "s1", "missing")
