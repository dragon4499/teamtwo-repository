"""Analytics API router - 매출 분석 및 KPI."""

from fastapi import APIRouter, Query

from backend.dependencies import analytics_service

router = APIRouter(prefix="/api/stores/{store_id}/admin/analytics", tags=["analytics"])


@router.get("/settlement")
async def get_settlement(
    store_id: str,
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
) -> dict:
    """정산 데이터 조회."""
    return await analytics_service.get_settlement(store_id, date_from, date_to)


@router.get("/kpi")
async def get_kpi(
    store_id: str,
    period: str = Query(default="daily", regex="^(hourly|daily|weekly|monthly)$"),
) -> dict:
    """시간대별/일별/주별/월별 KPI 시계열."""
    return await analytics_service.get_kpi_timeseries(store_id, period)


@router.get("/menus")
async def get_menu_analytics(store_id: str) -> dict:
    """메뉴별 판매 분석 및 전략 추천."""
    return await analytics_service.get_menu_analytics(store_id)
