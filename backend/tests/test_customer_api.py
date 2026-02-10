"""Customer API endpoint tests."""

import pytest
from httpx import AsyncClient

STORE_ID = "store001"
BASE = f"/api/stores/{STORE_ID}"


@pytest.mark.asyncio
async def test_table_auth(client: AsyncClient) -> None:
    """POST /tables/auth → 200, 세션 정보 반환."""
    resp = await client.post(
        f"{BASE}/tables/auth",
        json={"table_number": 1, "password": "1234"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert "table_number" in data
    assert "expires_at" in data


@pytest.mark.asyncio
async def test_get_menus(client: AsyncClient) -> None:
    """GET /menus → 200, 메뉴 리스트 반환."""
    resp = await client.get(f"{BASE}/menus")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    menu = data[0]
    assert "id" in menu
    assert "name" in menu
    assert "price" in menu
    assert "category" in menu


@pytest.mark.asyncio
async def test_get_menus_with_category(client: AsyncClient) -> None:
    """GET /menus?category=메인 → 200, 동일 Mock 응답."""
    resp = await client.get(f"{BASE}/menus", params={"category": "메인"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_order(client: AsyncClient) -> None:
    """POST /tables/1/orders → 201, 주문 생성 응답."""
    resp = await client.post(
        f"{BASE}/tables/1/orders",
        json={
            "session_id": "T01-20260209090000",
            "items": [{"menu_id": "mock-menu-001", "quantity": 2}],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "order_number" in data
    assert "items" in data
    assert "total_amount" in data
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_get_orders_by_session(client: AsyncClient) -> None:
    """GET /sessions/{id}/orders → 200, 주문 리스트."""
    resp = await client.get(f"{BASE}/sessions/T01-20260209090000/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_get_order(client: AsyncClient) -> None:
    """GET /orders/{id} → 200, 주문 상세."""
    resp = await client.get(f"{BASE}/orders/mock-order-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "mock-order-001"
    assert "items" in data
    assert "total_amount" in data
