"""Pydantic model validation tests."""

from __future__ import annotations

import uuid

import pytest
from pydantic import ValidationError

from backend.models.enums import OrderStatus, SessionStatus, UserRole
from backend.models.schemas import (
    AdminUser,
    Menu,
    Order,
    OrderItem,
    Store,
    Table,
    TableSession,
    utc_now,
)


class TestStore:
    def test_valid_store(self):
        s = Store(id="store001", name="테스트 매장")
        assert s.id == "store001"

    def test_invalid_id_too_short(self):
        with pytest.raises(ValidationError):
            Store(id="ab", name="매장")

    def test_invalid_id_special_chars(self):
        with pytest.raises(ValidationError):
            Store(id="store-001", name="매장")

    def test_empty_name_rejected(self):
        with pytest.raises(ValidationError):
            Store(id="store001", name="")


class TestAdminUser:
    def _make(self, **overrides) -> AdminUser:
        defaults = {
            "id": str(uuid.uuid4()),
            "store_id": "store001",
            "username": "admin",
            "password_hash": "$2b$10$fakehash",
            "role": UserRole.ADMIN,
        }
        defaults.update(overrides)
        return AdminUser(**defaults)

    def test_valid_admin(self):
        u = self._make()
        assert u.role == UserRole.ADMIN

    def test_invalid_username_too_short(self):
        with pytest.raises(ValidationError):
            self._make(username="ab")

    def test_invalid_username_special_chars(self):
        with pytest.raises(ValidationError):
            self._make(username="admin@1")

    def test_login_attempts_max(self):
        u = self._make(login_attempts=5)
        assert u.login_attempts == 5

    def test_login_attempts_over_max(self):
        with pytest.raises(ValidationError):
            self._make(login_attempts=6)


class TestMenu:
    def _make(self, **overrides) -> Menu:
        defaults = {
            "id": str(uuid.uuid4()),
            "store_id": "store001",
            "name": "김치찌개",
            "price": 9000,
            "category": "메인",
        }
        defaults.update(overrides)
        return Menu(**defaults)

    def test_valid_menu(self):
        m = self._make()
        assert m.price == 9000

    def test_price_zero_allowed(self):
        m = self._make(price=0)
        assert m.price == 0

    def test_price_max_allowed(self):
        m = self._make(price=1_000_000)
        assert m.price == 1_000_000

    def test_price_over_max_rejected(self):
        with pytest.raises(ValidationError):
            self._make(price=1_000_001)

    def test_price_negative_rejected(self):
        with pytest.raises(ValidationError):
            self._make(price=-1)

    def test_empty_name_rejected(self):
        with pytest.raises(ValidationError):
            self._make(name="")

    def test_valid_image_url(self):
        m = self._make(image_url="https://example.com/img.png")
        assert m.image_url.startswith("https://")

    def test_invalid_image_url_rejected(self):
        with pytest.raises(ValidationError):
            self._make(image_url="not-a-url")


class TestTable:
    def test_valid_table(self):
        t = Table(
            id=str(uuid.uuid4()),
            store_id="store001",
            table_number=1,
            password_hash="$2b$10$fakehash",
        )
        assert t.table_number == 1

    def test_table_number_zero_rejected(self):
        with pytest.raises(ValidationError):
            Table(
                id=str(uuid.uuid4()),
                store_id="store001",
                table_number=0,
                password_hash="hash",
            )


class TestTableSession:
    def test_valid_session(self):
        s = TableSession(
            id="T05-20260209143000",
            store_id="store001",
            table_number=5,
            expires_at="2026-02-10T06:30:00Z",
        )
        assert s.status == SessionStatus.ACTIVE

    def test_invalid_session_id_format(self):
        with pytest.raises(ValidationError):
            TableSession(
                id="INVALID-FORMAT",
                store_id="store001",
                table_number=5,
                expires_at="2026-02-10T06:30:00Z",
            )


class TestOrderItem:
    def test_valid_item(self):
        item = OrderItem(
            menu_id="m1", menu_name="김치찌개", price=9000, quantity=2, subtotal=18000
        )
        assert item.subtotal == 18000

    def test_subtotal_mismatch_rejected(self):
        with pytest.raises(ValidationError):
            OrderItem(
                menu_id="m1", menu_name="김치찌개", price=9000, quantity=2, subtotal=10000
            )

    def test_quantity_zero_rejected(self):
        with pytest.raises(ValidationError):
            OrderItem(
                menu_id="m1", menu_name="김치찌개", price=9000, quantity=0, subtotal=0
            )

    def test_quantity_max(self):
        item = OrderItem(
            menu_id="m1", menu_name="김치찌개", price=100, quantity=99, subtotal=9900
        )
        assert item.quantity == 99

    def test_quantity_over_max_rejected(self):
        with pytest.raises(ValidationError):
            OrderItem(
                menu_id="m1", menu_name="김치찌개", price=100, quantity=100, subtotal=10000
            )


class TestOrder:
    def _make_item(self, price=9000, qty=1):
        return {
            "menu_id": "m1",
            "menu_name": "김치찌개",
            "price": price,
            "quantity": qty,
            "subtotal": price * qty,
        }

    def test_valid_order(self):
        item = self._make_item()
        o = Order(
            id=str(uuid.uuid4()),
            order_number="20260209-00001",
            store_id="store001",
            table_number=1,
            session_id="T01-20260209090000",
            items=[item],
            total_amount=9000,
        )
        assert o.status == OrderStatus.PENDING

    def test_total_amount_mismatch_rejected(self):
        item = self._make_item()
        with pytest.raises(ValidationError):
            Order(
                id=str(uuid.uuid4()),
                order_number="20260209-00001",
                store_id="store001",
                table_number=1,
                session_id="T01-20260209090000",
                items=[item],
                total_amount=5000,
            )

    def test_empty_items_rejected(self):
        with pytest.raises(ValidationError):
            Order(
                id=str(uuid.uuid4()),
                order_number="20260209-00001",
                store_id="store001",
                table_number=1,
                session_id="T01-20260209090000",
                items=[],
                total_amount=0,
            )

    def test_invalid_order_number_format(self):
        item = self._make_item()
        with pytest.raises(ValidationError):
            Order(
                id=str(uuid.uuid4()),
                order_number="INVALID",
                store_id="store001",
                table_number=1,
                session_id="T01-20260209090000",
                items=[item],
                total_amount=9000,
            )


class TestEnums:
    def test_order_status_values(self):
        assert OrderStatus.PENDING == "pending"
        assert OrderStatus.PREPARING == "preparing"
        assert OrderStatus.COMPLETED == "completed"

    def test_order_status_transitions(self):
        assert OrderStatus.PENDING.can_transition_to(OrderStatus.PREPARING)
        assert OrderStatus.PENDING.can_transition_to(OrderStatus.COMPLETED)
        assert OrderStatus.PREPARING.can_transition_to(OrderStatus.COMPLETED)
        assert not OrderStatus.COMPLETED.can_transition_to(OrderStatus.PENDING)
        assert not OrderStatus.COMPLETED.can_transition_to(OrderStatus.PREPARING)
        assert not OrderStatus.PREPARING.can_transition_to(OrderStatus.PENDING)

    def test_session_status_values(self):
        assert SessionStatus.ACTIVE == "active"
        assert SessionStatus.ENDED == "ended"

    def test_user_role_values(self):
        assert UserRole.ADMIN == "admin"
        assert UserRole.STAFF == "staff"
