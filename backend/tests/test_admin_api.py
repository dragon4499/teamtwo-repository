"""Admin API endpoint tests."""

import pytest
from httpx import AsyncClient

STORE_ID = "store001"
BASE = f"/api/stores/{STORE_ID}/admin"


@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient) -> None:
    """POST /admin/login → 200, 토큰 반환."""
    resp = await client.post(
        f"{BASE}/login",
        json={"username": "admin", "password": "admin1234"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["role"] == "admin"


@pytest.mark.asyncio
async def test_admin_logout(client: AsyncClient) -> None:
    """POST /admin/logout → 200."""
    resp = await client.post(f"{BASE}/logout")
    assert resp.status_code == 200
    assert "message" in resp.json()


@pytest.mark.asyncio
async def test_get_tables(client: AsyncClient) -> None:
    """GET /admin/tables → 200, 테이블 리스트."""
    resp = await client.get(f"{BASE}/tables")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 3


@pytest.mark.asyncio
async def test_create_table(client: AsyncClient) -> None:
    """POST /admin/tables → 201."""
    resp = await client.post(
        f"{BASE}/tables",
        json={"table_number": 4, "password": "1234"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "table_number" in data


@pytest.mark.asyncio
async def test_start_session(client: AsyncClient) -> None:
    """POST /admin/tables/1/session/start → 200."""
    resp = await client.post(f"{BASE}/tables/1/session/start")
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_end_session(client: AsyncClient) -> None:
    """POST /admin/tables/1/session/end → 200."""
    resp = await client.post(f"{BASE}/tables/1/session/end")
    assert resp.status_code == 200
    assert "message" in resp.json()


@pytest.mark.asyncio
async def test_get_table_orders(client: AsyncClient) -> None:
    """GET /admin/tables/1/orders → 200, 주문 리스트."""
    resp = await client.get(f"{BASE}/tables/1/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_table_history(client: AsyncClient) -> None:
    """GET /admin/tables/1/history → 200, 이력 리스트."""
    resp = await client.get(f"{BASE}/tables/1/history")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "orders" in data[0]


@pytest.mark.asyncio
async def test_update_order_status(client: AsyncClient) -> None:
    """PATCH /admin/orders/{id}/status → 200."""
    resp = await client.patch(
        f"{BASE}/orders/mock-order-001/status",
        json={"status": "preparing"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "preparing"


@pytest.mark.asyncio
async def test_delete_order(client: AsyncClient) -> None:
    """DELETE /admin/orders/{id} → 204."""
    resp = await client.delete(f"{BASE}/orders/mock-order-001")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_get_admin_menus(client: AsyncClient) -> None:
    """GET /admin/menus → 200, 메뉴 리스트."""
    resp = await client.get(f"{BASE}/menus")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_create_menu(client: AsyncClient) -> None:
    """POST /admin/menus → 201."""
    resp = await client.post(
        f"{BASE}/menus",
        json={"name": "새 메뉴", "price": 10000, "category": "메인"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_update_menu(client: AsyncClient) -> None:
    """PUT /admin/menus/{id} → 200."""
    resp = await client.put(
        f"{BASE}/menus/mock-menu-001",
        json={"name": "김치찌개 (수정됨)", "price": 10000},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "김치찌개 (수정됨)"


@pytest.mark.asyncio
async def test_delete_menu(client: AsyncClient) -> None:
    """DELETE /admin/menus/{id} → 204."""
    resp = await client.delete(f"{BASE}/menus/mock-menu-001")
    assert resp.status_code == 204
