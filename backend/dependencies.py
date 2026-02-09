"""Dependency injection for FastAPI."""

from __future__ import annotations

from functools import lru_cache

from backend.config import DATA_DIR, LOCK_TIMEOUT
from backend.data.datastore import DataStore
from backend.services.auth_service import AuthService
from backend.services.event_bus import EventBus
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService
from backend.services.table_service import TableService


@lru_cache
def get_datastore() -> DataStore:
    return DataStore(base_path=DATA_DIR, lock_timeout=LOCK_TIMEOUT)


@lru_cache
def get_event_bus() -> EventBus:
    return EventBus()


def get_auth_service() -> AuthService:
    return AuthService(datastore=get_datastore())


def get_menu_service() -> MenuService:
    return MenuService(datastore=get_datastore())


def get_order_service() -> OrderService:
    return OrderService(
        datastore=get_datastore(),
        event_bus=get_event_bus(),
        menu_service=get_menu_service(),
    )


def get_table_service() -> TableService:
    return TableService(
        datastore=get_datastore(),
        order_service=get_order_service(),
    )
