"""Seed data initialization for the table order system."""

from __future__ import annotations

import logging
import uuid

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
    # 메인
    {"name": "김치찌개", "price": 9000, "category": "메인", "description": "돼지고기와 묵은지로 끓인 김치찌개", "image_url": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop"},
    {"name": "된장찌개", "price": 8000, "category": "메인", "description": "두부와 야채가 들어간 된장찌개", "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop"},
    {"name": "불고기 정식", "price": 12000, "category": "메인", "description": "양념 불고기와 반찬 세트", "image_url": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop"},
    {"name": "제육볶음", "price": 10000, "category": "메인", "description": "매콤한 돼지고기 제육볶음", "image_url": "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=400&h=300&fit=crop"},
    {"name": "비빔밥", "price": 9000, "category": "메인", "description": "신선한 야채와 고추장 비빔밥", "image_url": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop"},
    {"name": "순두부찌개", "price": 8500, "category": "메인", "description": "부드러운 순두부와 해물", "image_url": "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop"},
    # 세트메뉴
    {"name": "불고기+된장찌개 세트", "price": 15000, "category": "세트메뉴", "description": "불고기 정식 + 된장찌개 + 공기밥 (2,000원 할인)", "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"},
    {"name": "김치찌개+계란말이 세트", "price": 12000, "category": "세트메뉴", "description": "김치찌개 + 계란말이 + 공기밥 (2,000원 할인)", "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"},
    {"name": "제육+순두부 세트", "price": 14000, "category": "세트메뉴", "description": "제육볶음 + 순두부찌개 + 공기밥 (2,500원 할인)", "image_url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop"},
    {"name": "커플 세트", "price": 25000, "category": "세트메뉴", "description": "불고기 + 비빔밥 + 된장찌개 + 음료 2잔 (5,000원 할인)", "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"},
    # 사이드
    {"name": "계란말이", "price": 5000, "category": "사이드", "description": "부드러운 계란말이", "image_url": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop"},
    {"name": "김치전", "price": 6000, "category": "사이드", "description": "바삭한 김치전", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop"},
    {"name": "두부김치", "price": 7000, "category": "사이드", "description": "구운 두부와 볶음김치", "image_url": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop"},
    {"name": "잡채", "price": 8000, "category": "사이드", "description": "당면과 야채 잡채", "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop"},
    {"name": "해물파전", "price": 10000, "category": "사이드", "description": "해물이 듬뿍 들어간 파전", "image_url": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop"},
    # 계절메뉴
    {"name": "냉면 (여름)", "price": 9000, "category": "계절메뉴", "description": "시원한 물냉면 / 비빔냉면 선택", "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"},
    {"name": "팥빙수 (여름)", "price": 7000, "category": "계절메뉴", "description": "달콤한 팥과 얼음의 조화", "image_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop"},
    {"name": "어묵탕 (겨울)", "price": 6000, "category": "계절메뉴", "description": "따뜻한 어묵탕", "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop"},
    {"name": "호박죽 (겨울)", "price": 5000, "category": "계절메뉴", "description": "달콤하고 부드러운 호박죽", "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop"},
    # 음료
    {"name": "콜라", "price": 2000, "category": "음료", "description": "코카콜라 355ml", "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop"},
    {"name": "사이다", "price": 2000, "category": "음료", "description": "칠성사이다 355ml", "image_url": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop"},
    {"name": "맥주", "price": 4000, "category": "음료", "description": "생맥주 500ml", "image_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop"},
    {"name": "매실차", "price": 3000, "category": "음료", "description": "달콤한 매실차", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop"},
    {"name": "아메리카노", "price": 3500, "category": "음료", "description": "원두 아메리카노 (HOT/ICE)", "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop"},
    # 디저트
    {"name": "식혜", "price": 3000, "category": "디저트", "description": "전통 식혜", "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"},
    {"name": "아이스크림", "price": 2500, "category": "디저트", "description": "바닐라 아이스크림", "image_url": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop"},
    {"name": "떡", "price": 3500, "category": "디저트", "description": "모듬 떡", "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop"},
    {"name": "약과", "price": 4000, "category": "디저트", "description": "전통 약과 3개", "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop"},
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
