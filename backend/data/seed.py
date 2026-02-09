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
    {"name": "김치찌개", "price": 9000, "category": "메인", "description": "돼지고기와 묵은지로 끓인 김치찌개"},
    {"name": "된장찌개", "price": 8000, "category": "메인", "description": "두부와 야채가 들어간 된장찌개"},
    {"name": "불고기 정식", "price": 12000, "category": "메인", "description": "양념 불고기와 반찬 세트"},
    {"name": "계란말이", "price": 5000, "category": "사이드", "description": "부드러운 계란말이"},
    {"name": "김치전", "price": 6000, "category": "사이드", "description": "바삭한 김치전"},
    {"name": "두부김치", "price": 7000, "category": "사이드", "description": "구운 두부와 볶음김치"},
    {"name": "콜라", "price": 2000, "category": "음료", "description": "코카콜라 355ml"},
    {"name": "사이다", "price": 2000, "category": "음료", "description": "칠성사이다 355ml"},
    {"name": "맥주", "price": 4000, "category": "음료", "description": "생맥주 500ml"},
    {"name": "식혜", "price": 3000, "category": "디저트", "description": "전통 식혜"},
    {"name": "아이스크림", "price": 2500, "category": "디저트", "description": "바닐라 아이스크림"},
    {"name": "떡", "price": 3500, "category": "디저트", "description": "모듬 떡"},
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
    """샘플 메뉴 12개 생성."""
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
            "image_url": "",
            "is_available": True,
            "sort_order": i,
            "created_at": now,
            "updated_at": now,
        })
    return menus


async def seed_data(datastore: DataStore) -> None:
    """초기 데이터 시딩. 멱등성 보장 (이미 데이터가 있으면 건너뜀).

    Args:
        datastore: DataStore 인스턴스
    """
    store_id = SEED_STORE["id"]

    # 1. 매장
    stores = await datastore.read("stores", "")
    if not stores:
        await datastore.write("stores", "", [SEED_STORE])
        logger.info("seed: store created - %s", store_id)
    else:
        logger.info("seed: stores already exist, skipping")

    # 2. 관리자 계정
    users = await datastore.read("users", store_id)
    if not users:
        admin = _build_admin_user(store_id)
        await datastore.write("users", store_id, [admin])
        logger.info("seed: admin user created - %s", admin["username"])
    else:
        logger.info("seed: users already exist, skipping")

    # 3. 메뉴
    menus = await datastore.read("menus", store_id)
    if not menus:
        menu_list = _build_menus(store_id)
        await datastore.write("menus", store_id, menu_list)
        logger.info("seed: %d menus created", len(menu_list))
    else:
        logger.info("seed: menus already exist, skipping")

    # 4. 빈 파일 초기화
    for entity in ("tables", "sessions", "orders", "order_history"):
        data = await datastore.read(entity, store_id)
        if not data:
            await datastore.write(entity, store_id, [])
            logger.info("seed: %s initialized (empty)", entity)
