"""Dependency injection for services."""

from backend.config import DATA_DIR
from backend.data.datastore import DataStore
from backend.services.analytics_service import AnalyticsService
from backend.services.auth_service import AuthService
from backend.services.event_bus import EventBus
from backend.services.menu_service import MenuService
from backend.services.order_service import OrderService
from backend.services.table_service import TableService

# Singleton instances
datastore = DataStore(base_path=DATA_DIR)
event_bus = EventBus()
analytics_service = AnalyticsService(datastore)
auth_service = AuthService(datastore)
menu_service = MenuService(datastore)
order_service = OrderService(datastore, event_bus)
table_service = TableService(datastore)
