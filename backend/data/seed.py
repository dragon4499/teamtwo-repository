"""Seed data initialization for the table order system."""

from __future__ import annotations

import logging
import random
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt

from backend.data.datastore import DataStore
from backend.models.schemas import utc_now

logger = logging.getLogger("datastore")

SEED_STORE = {
    "id": "store001",
    "name": "맛있는 식당",
    "created_at": "2026-02-09T00:00:00Z",
    "updated_at": "2026-02-09T00:00:00Z",
}

SEED_MENUS = [
    # 메인 (Wikimedia Commons CC images)
    {"name": "김치찌개", "price": 9000, "category": "메인", "description": "돼지고기와 묵은지로 끓인 김치찌개", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Korean_stew-Kimchi_jjigae-05.jpg/400px-Korean_stew-Kimchi_jjigae-05.jpg"},
    {"name": "된장찌개", "price": 8000, "category": "메인", "description": "두부와 야채가 들어간 된장찌개", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Doenjang-jjigae_4.jpg/400px-Doenjang-jjigae_4.jpg"},
    {"name": "불고기 정식", "price": 12000, "category": "메인", "description": "양념 불고기와 반찬 세트", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Korean.cuisine-Bulgogi-01.jpg/400px-Korean.cuisine-Bulgogi-01.jpg"},
    {"name": "제육볶음", "price": 10000, "category": "메인", "description": "매콤한 돼지고기 제육볶음", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Jeyuk-bokkeum.jpg/400px-Jeyuk-bokkeum.jpg"},
    {"name": "비빔밥", "price": 9000, "category": "메인", "description": "신선한 야채와 고추장 비빔밥", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bibimbap_4.jpg/400px-Bibimbap_4.jpg"},
    {"name": "순두부찌개", "price": 8500, "category": "메인", "description": "부드러운 순두부와 해물", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Sundubu-jjigae.jpg/400px-Sundubu-jjigae.jpg"},
    # 세트메뉴 (텍스트 기반 placeholder 이미지)
    {"name": "불고기+된장찌개 세트", "price": 15000, "category": "세트메뉴", "description": "불고기 정식 + 된장찌개 + 공기밥 (2,000원 할인)", "image_url": "https://placehold.co/400x300/D97706/FFFFFF?font=noto&text=%EB%B6%88%EA%B3%A0%EA%B8%B0%2B%EB%90%9C%EC%9E%A5%EC%B0%8C%EA%B0%9C%0A%EC%84%B8%ED%8A%B8"},
    {"name": "김치찌개+계란말이 세트", "price": 12000, "category": "세트메뉴", "description": "김치찌개 + 계란말이 + 공기밥 (2,000원 할인)", "image_url": "https://placehold.co/400x300/DC2626/FFFFFF?font=noto&text=%EA%B9%80%EC%B9%98%EC%B0%8C%EA%B0%9C%2B%EA%B3%84%EB%9E%80%EB%A7%90%EC%9D%B4%0A%EC%84%B8%ED%8A%B8"},
    {"name": "제육+순두부 세트", "price": 14000, "category": "세트메뉴", "description": "제육볶음 + 순두부찌개 + 공기밥 (2,500원 할인)", "image_url": "https://placehold.co/400x300/EA580C/FFFFFF?font=noto&text=%EC%A0%9C%EC%9C%A1%2B%EC%88%9C%EB%91%90%EB%B6%80%0A%EC%84%B8%ED%8A%B8"},
    {"name": "커플 세트", "price": 25000, "category": "세트메뉴", "description": "불고기 + 비빔밥 + 된장찌개 + 음료 2잔 (5,000원 할인)", "image_url": "https://placehold.co/400x300/E11D48/FFFFFF?font=noto&text=%EC%BB%A4%ED%94%8C+%EC%84%B8%ED%8A%B8%0A%E2%9D%A4"},
    # 사이드
    {"name": "계란말이", "price": 5000, "category": "사이드", "description": "부드러운 계란말이", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Aehobak-gyeran-mari.jpg/400px-Aehobak-gyeran-mari.jpg"},
    {"name": "김치전", "price": 6000, "category": "사이드", "description": "바삭한 김치전", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Korean_pancake-Haemul_kimchijeon-01.jpg/400px-Korean_pancake-Haemul_kimchijeon-01.jpg"},
    {"name": "두부김치", "price": 7000, "category": "사이드", "description": "구운 두부와 볶음김치", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Korean_cuisine-Dubu_kimchi-01.jpg/400px-Korean_cuisine-Dubu_kimchi-01.jpg"},
    {"name": "잡채", "price": 8000, "category": "사이드", "description": "당면과 야채 잡채", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Korean.food-Japchae-03.jpg/400px-Korean.food-Japchae-03.jpg"},
    {"name": "해물파전", "price": 10000, "category": "사이드", "description": "해물이 듬뿍 들어간 파전", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Haemulpajeon.jpg/400px-Haemulpajeon.jpg"},
    # 계절메뉴 (여름: 5~9월)
    {"name": "냉면 (여름)", "price": 9000, "category": "계절메뉴", "description": "시원한 물냉면 / 비빔냉면 선택", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Korean_cuisine-Naengmyeon-01.jpg/400px-Korean_cuisine-Naengmyeon-01.jpg"},
    {"name": "콩국수 (여름)", "price": 8500, "category": "계절메뉴", "description": "고소한 콩국물에 면을 말아낸 여름 별미", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Korean_noodles-01.jpg/400px-Korean_noodles-01.jpg"},
    # 계절메뉴 (겨울: 10~3월)
    {"name": "김치수제비 (겨울)", "price": 8000, "category": "계절메뉴", "description": "칼칼한 김치 국물에 쫄깃한 수제비", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Jaecheop-sujebi.jpg/400px-Jaecheop-sujebi.jpg"},
    {"name": "갈비탕 (겨울)", "price": 13000, "category": "계절메뉴", "description": "소갈비를 푹 고아낸 진한 갈비탕", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Korean_soup-Galbi-nakji-yeonpo-tang.jpg/400px-Korean_soup-Galbi-nakji-yeonpo-tang.jpg"},
    # 사이드 (어묵탕은 상시 사이드로 이동)
    {"name": "어묵탕", "price": 6000, "category": "사이드", "description": "따뜻한 어묵탕", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Eomuk-bokkeum.jpg/400px-Eomuk-bokkeum.jpg"},
    # 음료
    {"name": "콜라", "price": 2000, "category": "음료", "description": "코카콜라 355ml", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Coca-Cola_bottles.jpg/400px-Coca-Cola_bottles.jpg"},
    {"name": "사이다", "price": 2000, "category": "음료", "description": "칠성사이다 355ml", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Lemon_lime_soda.jpg/400px-Lemon_lime_soda.jpg"},
    {"name": "맥주", "price": 4000, "category": "음료", "description": "생맥주 500ml", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Glass_of_beer.jpg/400px-Glass_of_beer.jpg"},
]


def _hash_password(password: str) -> str:
    """bcrypt로 비밀번호 해싱 (cost=10)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")


def _build_admin_user(store_id: str) -> dict:
    """기본 관리자 계정 생성."""
    return {
        "id": str(uuid.uuid4()),
        "store_id": store_id,
        "username": "admin",
        "password_hash": _hash_password("admin1234"),
        "role": "admin",
        "login_attempts": 0,
        "locked_until": None,
        "created_at": utc_now(),
    }


def _build_menus(store_id: str) -> list[dict]:
    """샘플 메뉴 생성."""
    now = utc_now()
    menus = []
    for i, m in enumerate(SEED_MENUS):
        menus.append({
            "id": str(uuid.uuid4()),
            "store_id": store_id,
            "name": m["name"],
            "price": m["price"],
            "description": m["description"],
            "category": m["category"],
            "image_url": m.get("image_url", ""),
            "is_available": True,
            "sort_order": i,
            "created_at": now,
            "updated_at": now,
        })
    return menus


async def seed_data(datastore: DataStore) -> None:
    """초기 데이터 시딩. 멱등성 보장 (이미 데이터가 있으면 건너뜀)."""
    store_id = SEED_STORE["id"]

    stores = await datastore.read("stores", "")
    if not stores:
        await datastore.write("stores", "", [SEED_STORE])
        logger.info("seed: store created - %s", store_id)
    else:
        logger.info("seed: stores already exist, skipping")

    users = await datastore.read("users", store_id)
    if not users:
        admin = _build_admin_user(store_id)
        await datastore.write("users", store_id, [admin])
        logger.info("seed: admin user created - %s", admin["username"])
    else:
        logger.info("seed: users already exist, skipping")

    menus = await datastore.read("menus", store_id)
    if not menus:
        menu_list = _build_menus(store_id)
        await datastore.write("menus", store_id, menu_list)
        logger.info("seed: %d menus created", len(menu_list))
    else:
        logger.info("seed: menus already exist, skipping")

    for entity in ("tables", "sessions", "orders", "order_history"):
        data = await datastore.read(entity, store_id)
        if not data:
            await datastore.write(entity, store_id, [])
            logger.info("seed: %s initialized (empty)", entity)

    # 과거 1년치 주문 이력 시딩
    history = await datastore.read("order_history", store_id)
    if not history:
        menus = await datastore.read("menus", store_id)
        history_data = _build_order_history(store_id, menus)
        await datastore.write("order_history", store_id, history_data)
        total_orders = sum(len(h["orders"]) for h in history_data)
        logger.info("seed: %d history sessions, %d orders created", len(history_data), total_orders)


# ---------------------------------------------------------------------------
# 과거 1년치 주문 이력 생성
# ---------------------------------------------------------------------------

# 메뉴별 인기도 가중치 (이름 기준)
_POPULARITY = {
    "김치찌개": 15, "된장찌개": 10, "불고기 정식": 14, "제육볶음": 12,
    "비빔밥": 11, "순두부찌개": 8,
    "불고기+된장찌개 세트": 9, "김치찌개+계란말이 세트": 7,
    "제육+순두부 세트": 6, "커플 세트": 5,
    "계란말이": 8, "김치전": 6, "두부김치": 5, "잡채": 4, "해물파전": 7,
    "어묵탕": 7,
    "냉면 (여름)": 8, "콩국수 (여름)": 6,
    "김치수제비 (겨울)": 7, "갈비탕 (겨울)": 9,
    "콜라": 12, "사이다": 8, "맥주": 14,
}

# 계절메뉴 판매 가능 월
_SEASONAL = {
    "냉면 (여름)": (5, 6, 7, 8, 9),
    "콩국수 (여름)": (5, 6, 7, 8, 9),
    "김치수제비 (겨울)": (10, 11, 12, 1, 2, 3),
    "갈비탕 (겨울)": (10, 11, 12, 1, 2, 3),
}

NUM_TABLES = 8


def _is_available(menu_name: str, month: int) -> bool:
    """계절메뉴 판매 가능 여부."""
    if menu_name in _SEASONAL:
        return month in _SEASONAL[menu_name]
    return True


def _pick_order_items(menus: list[dict], month: int, rng: random.Random) -> list[dict]:
    """주문 항목 1~4개 랜덤 선택 (가중치 + 계절 반영)."""
    available = [m for m in menus if _is_available(m["name"], month)]
    weights = [_POPULARITY.get(m["name"], 5) for m in available]
    count = rng.choices([1, 2, 3, 4], weights=[20, 40, 30, 10])[0]
    count = min(count, len(available))
    chosen = rng.sample(list(zip(available, weights)), k=count)
    items = []
    for menu, _ in chosen:
        qty = rng.choices([1, 2, 3], weights=[60, 30, 10])[0]
        items.append({
            "menu_id": menu["id"],
            "menu_name": menu["name"],
            "price": menu["price"],
            "quantity": qty,
            "subtotal": menu["price"] * qty,
        })
    return items


def _orders_per_day(dt: datetime, rng: random.Random) -> int:
    """요일/시즌에 따른 일일 주문 수."""
    weekday = dt.weekday()
    month = dt.month
    base = 12 if weekday < 5 else 20  # 주말 증가
    # 여름/겨울 성수기 보정
    if month in (7, 8, 12):
        base = int(base * 1.3)
    elif month in (1, 2, 3):
        base = int(base * 0.85)
    return rng.randint(max(5, base - 5), base + 8)


def _build_order_history(store_id: str, menus: list[dict]) -> list[dict]:
    """과거 365일치 주문 이력 생성."""
    rng = random.Random(42)  # 재현 가능한 시드
    now = datetime(2026, 2, 9, tzinfo=timezone.utc)
    start = now - timedelta(days=365)
    history = []
    order_seq = 0

    day = start
    while day < now:
        n_orders = _orders_per_day(day, rng)
        # 하루에 여러 세션 (테이블별)
        tables_today = rng.sample(range(1, NUM_TABLES + 1), k=min(rng.randint(3, NUM_TABLES), NUM_TABLES))

        for table_num in tables_today:
            session_start = day.replace(
                hour=rng.choice([11, 12, 12, 13, 18, 18, 19, 19, 20]),
                minute=rng.randint(0, 59),
            )
            session_id = f"T{table_num:02d}-{session_start.strftime('%Y%m%d%H%M%S')}"
            session_end = session_start + timedelta(minutes=rng.randint(30, 90))

            # 세션당 1~3건 주문
            session_orders = []
            n_session_orders = rng.choices([1, 2, 3], weights=[40, 45, 15])[0]
            for _ in range(n_session_orders):
                if order_seq >= n_orders * 2:
                    break
                order_seq += 1
                order_time = session_start + timedelta(minutes=rng.randint(0, 30))
                order_number = f"{order_time.strftime('%Y%m%d')}-{order_seq:05d}"
                items = _pick_order_items(menus, day.month, rng)
                total = sum(i["subtotal"] for i in items)
                session_orders.append({
                    "id": str(uuid.uuid4()),
                    "order_number": order_number,
                    "store_id": store_id,
                    "table_number": table_num,
                    "session_id": session_id,
                    "items": items,
                    "total_amount": total,
                    "status": "completed",
                    "created_at": order_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "updated_at": session_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                })

            if session_orders:
                session_total = sum(o["total_amount"] for o in session_orders)
                history.append({
                    "id": str(uuid.uuid4()),
                    "store_id": store_id,
                    "table_number": table_num,
                    "session_id": session_id,
                    "orders": session_orders,
                    "total_session_amount": session_total,
                    "session_started_at": session_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "session_ended_at": session_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "archived_at": session_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                })

        order_seq = 0
        day += timedelta(days=1)

    return history
