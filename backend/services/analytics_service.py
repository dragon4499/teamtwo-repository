"""AnalyticsService - 매출 분석 및 KPI 비즈니스 로직."""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from backend.data.datastore import DataStore

logger = logging.getLogger("table_order")


class AnalyticsService:
    """매출 분석 및 KPI 서비스."""

    def __init__(self, datastore: DataStore) -> None:
        self._ds = datastore

    async def _get_all_order_data(self, store_id: str) -> list[dict]:
        """현재 주문 + 이력 주문 모두 수집."""
        current_orders = await self._ds.read("orders", store_id)
        history = await self._ds.read("order_history", store_id)
        all_orders = list(current_orders)
        for h in history:
            all_orders.extend(h.get("orders", []))
        return all_orders

    async def get_settlement(self, store_id: str, date_from: str | None = None, date_to: str | None = None) -> dict:
        """정산 데이터 조회."""
        orders = await self._get_all_order_data(store_id)
        if date_from:
            orders = [o for o in orders if o.get("created_at", "") >= date_from]
        if date_to:
            orders = [o for o in orders if o.get("created_at", "") <= date_to]

        total_revenue = sum(o.get("total_amount", 0) for o in orders)
        total_orders = len(orders)
        completed = [o for o in orders if o.get("status") == "completed"]
        pending = [o for o in orders if o.get("status") == "pending"]
        preparing = [o for o in orders if o.get("status") == "preparing"]

        # 테이블별 매출
        table_revenue = defaultdict(int)
        for o in orders:
            table_revenue[o.get("table_number", 0)] += o.get("total_amount", 0)

        return {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "avg_order_amount": total_revenue // total_orders if total_orders else 0,
            "completed_orders": len(completed),
            "pending_orders": len(pending),
            "preparing_orders": len(preparing),
            "completed_revenue": sum(o.get("total_amount", 0) for o in completed),
            "table_revenue": [
                {"table_number": k, "revenue": v}
                for k, v in sorted(table_revenue.items())
            ],
            "date_from": date_from,
            "date_to": date_to,
        }

    async def get_revenue_summary(self, store_id: str) -> dict:
        """오늘/이번주/이번달 매출 요약 (정확한 기간 집계)."""
        orders = await self._get_all_order_data(store_id)
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        # 이번 주 월요일
        week_start = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
        # 이번 달 1일
        month_start = now.strftime("%Y-%m-01")

        daily_rev = 0
        daily_orders = 0
        weekly_rev = 0
        weekly_orders = 0
        monthly_rev = 0
        monthly_orders = 0

        for o in orders:
            created = o.get("created_at", "")
            if not created:
                continue
            order_date = created[:10]  # YYYY-MM-DD
            amt = o.get("total_amount", 0)
            if order_date == today_str:
                daily_rev += amt
                daily_orders += 1
            if order_date >= week_start:
                weekly_rev += amt
                weekly_orders += 1
            if order_date >= month_start:
                monthly_rev += amt
                monthly_orders += 1

        return {
            "daily": {"revenue": daily_rev, "orders": daily_orders, "date": today_str},
            "weekly": {"revenue": weekly_rev, "orders": weekly_orders, "start": week_start},
            "monthly": {"revenue": monthly_rev, "orders": monthly_orders, "start": month_start},
        }

    async def get_kpi_timeseries(self, store_id: str, period: str = "hourly") -> dict:
        """시간대별/일별/주별/월별 KPI 시계열 데이터."""
        orders = await self._get_all_order_data(store_id)
        buckets = defaultdict(lambda: {"revenue": 0, "orders": 0, "items": 0})

        for o in orders:
            created = o.get("created_at", "")
            if not created:
                continue
            try:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                continue

            if period == "hourly":
                key = dt.strftime("%Y-%m-%d %H:00")
            elif period == "daily":
                key = dt.strftime("%Y-%m-%d")
            elif period == "weekly":
                iso = dt.isocalendar()
                key = f"{iso[0]}-W{iso[1]:02d}"
            elif period == "monthly":
                key = dt.strftime("%Y-%m")
            else:
                key = dt.strftime("%Y-%m-%d")

            buckets[key]["revenue"] += o.get("total_amount", 0)
            buckets[key]["orders"] += 1
            buckets[key]["items"] += sum(
                item.get("quantity", 0) for item in o.get("items", [])
            )

        series = [
            {"period": k, **v}
            for k, v in sorted(buckets.items())
        ]
        return {"period_type": period, "data": series}

    async def get_menu_analytics(self, store_id: str) -> dict:
        """메뉴별 판매 분석 (인기/비인기 메뉴)."""
        orders = await self._get_all_order_data(store_id)
        menus = await self._ds.read("menus", store_id)
        menu_map = {m["id"]: m for m in menus}

        # 메뉴별 판매 집계
        menu_sales = defaultdict(lambda: {"quantity": 0, "revenue": 0, "order_count": 0})
        for o in orders:
            for item in o.get("items", []):
                mid = item.get("menu_id", "")
                menu_sales[mid]["quantity"] += item.get("quantity", 0)
                menu_sales[mid]["revenue"] += item.get("subtotal", 0)
                menu_sales[mid]["order_count"] += 1

        # 카테고리별 집계
        category_sales = defaultdict(lambda: {"quantity": 0, "revenue": 0})
        rankings = []
        for mid, stats in menu_sales.items():
            menu = menu_map.get(mid, {})
            name = menu.get("name", item.get("menu_name", "알 수 없음"))
            cat = menu.get("category", "기타")
            category_sales[cat]["quantity"] += stats["quantity"]
            category_sales[cat]["revenue"] += stats["revenue"]
            rankings.append({
                "menu_id": mid,
                "menu_name": name,
                "category": cat,
                "price": menu.get("price", 0),
                **stats,
            })

        rankings.sort(key=lambda x: x["revenue"], reverse=True)
        total_revenue = sum(r["revenue"] for r in rankings)

        # 인기/비인기 분류
        popular = rankings[:5] if rankings else []
        unpopular = list(reversed(rankings[-5:])) if len(rankings) > 5 else []

        # 판매 전략 추천 생성
        strategies = self._generate_strategies(rankings, category_sales, total_revenue, menus, menu_sales)

        return {
            "rankings": rankings,
            "popular": popular,
            "unpopular": unpopular,
            "category_sales": [
                {"category": k, **v}
                for k, v in sorted(category_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)
            ],
            "total_menu_count": len(menus),
            "sold_menu_count": len(menu_sales),
            "strategies": strategies,
        }

    def _generate_strategies(self, rankings, category_sales, total_revenue, menus, menu_sales) -> list[dict]:
        """정량적 근거 기반 판매 전략 추천."""
        strategies = []
        if not rankings:
            return [{"type": "info", "title": "데이터 부족", "description": "주문 데이터가 쌓이면 전략을 추천합니다.", "evidence": "현재 주문 0건"}]

        # 1. 인기 메뉴 기반 세트 추천
        top3 = rankings[:3]
        if len(top3) >= 2:
            names = ", ".join(r["menu_name"] for r in top3)
            rev_pct = sum(r["revenue"] for r in top3) / total_revenue * 100 if total_revenue else 0
            strategies.append({
                "type": "upsell",
                "title": "인기 메뉴 세트 구성 강화",
                "description": f"상위 3개 메뉴({names})를 활용한 세트 메뉴를 강화하세요.",
                "evidence": f"상위 3개 메뉴가 전체 매출의 {rev_pct:.1f}%를 차지합니다.",
            })

        # 2. 비인기 메뉴 개선/제거
        if len(rankings) > 5:
            bottom3 = rankings[-3:]
            bottom_rev = sum(r["revenue"] for r in bottom3)
            bottom_pct = bottom_rev / total_revenue * 100 if total_revenue else 0
            names = ", ".join(r["menu_name"] for r in bottom3)
            strategies.append({
                "type": "optimize",
                "title": "저성과 메뉴 개선 또는 교체",
                "description": f"하위 3개 메뉴({names})의 가격/구성을 재검토하세요.",
                "evidence": f"하위 3개 메뉴 매출 비중 {bottom_pct:.1f}% ({bottom_rev:,}원).",
            })

        # 3. 카테고리 불균형 분석
        cat_list = sorted(category_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)
        if len(cat_list) >= 2:
            top_cat = cat_list[0]
            low_cat = cat_list[-1]
            strategies.append({
                "type": "balance",
                "title": f"'{low_cat[0]}' 카테고리 활성화",
                "description": f"'{top_cat[0]}' 대비 '{low_cat[0]}' 매출이 낮습니다. 프로모션을 고려하세요.",
                "evidence": f"'{top_cat[0]}' 매출 {top_cat[1]['revenue']:,}원 vs '{low_cat[0]}' 매출 {low_cat[1]['revenue']:,}원.",
            })

        # 4. 미판매 메뉴 경고
        unsold = [m for m in menus if m["id"] not in menu_sales]
        if unsold:
            names = ", ".join(m["name"] for m in unsold[:5])
            strategies.append({
                "type": "warning",
                "title": f"미판매 메뉴 {len(unsold)}개 발견",
                "description": f"판매 이력이 없는 메뉴: {names}",
                "evidence": f"전체 {len(menus)}개 메뉴 중 {len(unsold)}개가 미판매 상태입니다.",
            })

        # 5. 객단가 분석
        if rankings:
            avg_price = total_revenue / sum(r["quantity"] for r in rankings) if sum(r["quantity"] for r in rankings) else 0
            strategies.append({
                "type": "pricing",
                "title": "객단가 최적화",
                "description": f"현재 평균 단가 {avg_price:,.0f}원입니다. 사이드/음료 추가 주문을 유도하세요.",
                "evidence": f"총 매출 {total_revenue:,}원 / 총 판매 수량 {sum(r['quantity'] for r in rankings)}개.",
            })

        return strategies
