"""Shared pytest fixtures for Unit 1: DataStore tests."""

from __future__ import annotations

import uuid

import pytest

from backend.data.datastore import DataStore
from backend.data.seed import seed_data
from backend.models.schemas import utc_now


@pytest.fixture
def datastore(tmp_path) -> DataStore:
    """임시 디렉토리 기반 격리된 DataStore 인스턴스."""
    return DataStore(base_path=str(tmp_path / "data"))


@pytest.fixture
async def seeded_datastore(datastore: DataStore) -> DataStore:
    """시드 데이터가 포함된 DataStore 인스턴스."""
    await seed_data(datastore)
    return datastore


@pytest.fixture
def sample_store() -> dict:
    """테스트용 Store dict."""
    return {
        "id": "teststore",
        "name": "테스트 매장",
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }


@pytest.fixture
def sample_menu() -> dict:
    """테스트용 Menu dict."""
    now = utc_now()
    return {
        "id": str(uuid.uuid4()),
        "store_id": "store001",
        "name": "테스트 메뉴",
        "price": 10000,
        "description": "테스트용 메뉴입니다",
        "category": "메인",
        "image_url": "",
        "is_available": True,
        "sort_order": 0,
        "created_at": now,
        "updated_at": now,
    }


# --- Unit 2: Mock API fixtures ---

from httpx import ASGITransport, AsyncClient

from backend.main import app


@pytest.fixture
async def client() -> AsyncClient:
    """FastAPI 테스트용 비동기 HTTP 클라이언트."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
