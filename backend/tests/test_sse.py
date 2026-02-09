"""SSE endpoint tests."""

import pytest
from httpx import AsyncClient

STORE_ID = "store001"


@pytest.mark.asyncio
async def test_sse_order_events(client: AsyncClient) -> None:
    """GET /events/orders → SSE 스트림, 첫 이벤트 수신 확인."""
    async with client.stream(
        "GET", f"/api/stores/{STORE_ID}/events/orders"
    ) as resp:
        assert resp.status_code == 200
        content_type = resp.headers.get("content-type", "")
        assert "text/event-stream" in content_type

        # 첫 번째 이벤트 데이터 수신
        lines_collected: list[str] = []
        async for line in resp.aiter_lines():
            lines_collected.append(line)
            # event + data 라인을 받으면 종료
            if len(lines_collected) >= 2:
                break

        full_text = "\n".join(lines_collected)
        assert "order_created" in full_text
        assert "mock-order-001" in full_text


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """GET /health → 200, ok."""
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
