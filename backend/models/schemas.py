"""Pydantic data models for the table order system."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from pydantic import BaseModel, Field, field_validator, model_validator

from backend.models.enums import OrderStatus, SessionStatus, UserRole


def utc_now() -> str:
    """현재 UTC 시각을 ISO 8601 문자열로 반환."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Store(BaseModel):
    """매장."""

    id: str = Field(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9]+$")
    name: str = Field(..., min_length=1, max_length=100)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


class AdminUser(BaseModel):
    """관리자 계정."""

    id: str = Field(..., description="UUID v4")
    store_id: str = Field(..., min_length=3, max_length=20)
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9]+$")
    password_hash: str = Field(...)
    role: UserRole = Field(...)
    login_attempts: int = Field(default=0, ge=0, le=5)
    locked_until: str | None = Field(default=None)
    created_at: str = Field(default_factory=utc_now)


class Menu(BaseModel):
    """메뉴."""

    id: str = Field(..., description="UUID v4")
    store_id: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=0, le=1_000_000)
    description: str = Field(default="", max_length=500)
    category: str = Field(..., min_length=1, max_length=50)
    image_url: str = Field(default="")
    is_available: bool = Field(default=True)
    sort_order: int = Field(default=0, ge=0)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        if v and not (v.startswith("http://") or v.startswith("https://") or v == ""):
            raise ValueError("image_url must be a valid URL or empty string")
        return v


class Table(BaseModel):
    """테이블."""

    id: str = Field(..., description="UUID v4")
    store_id: str = Field(..., min_length=3, max_length=20)
    table_number: int = Field(..., ge=1)
    password_hash: str = Field(...)
    is_active: bool = Field(default=True)
    created_at: str = Field(default_factory=utc_now)


class TableSession(BaseModel):
    """테이블 세션."""

    id: str = Field(..., description="T{NN}-{YYYYMMDDHHmmss}")
    store_id: str = Field(..., min_length=3, max_length=20)
    table_number: int = Field(..., ge=1)
    status: SessionStatus = Field(default=SessionStatus.ACTIVE)
    started_at: str = Field(default_factory=utc_now)
    expires_at: str = Field(...)
    ended_at: str | None = Field(default=None)

    @field_validator("id")
    @classmethod
    def validate_session_id(cls, v: str) -> str:
        if not re.match(r"^T\d{2,}-\d{14}$", v):
            raise ValueError("Session ID must match format T{NN}-{YYYYMMDDHHmmss}")
        return v


class OrderItem(BaseModel):
    """주문 항목."""

    menu_id: str = Field(...)
    menu_name: str = Field(..., min_length=1)
    price: int = Field(..., ge=0)
    quantity: int = Field(..., ge=1, le=99)
    subtotal: int = Field(..., ge=0)

    @model_validator(mode="after")
    def validate_subtotal(self) -> "OrderItem":
        expected = self.price * self.quantity
        if self.subtotal != expected:
            raise ValueError(
                f"subtotal ({self.subtotal}) must equal price * quantity ({expected})"
            )
        return self


class Order(BaseModel):
    """주문."""

    id: str = Field(..., description="UUID v4")
    order_number: str = Field(..., pattern=r"^\d{8}-\d{5}$")
    store_id: str = Field(..., min_length=3, max_length=20)
    table_number: int = Field(..., ge=1)
    session_id: str = Field(...)
    items: list[OrderItem] = Field(..., min_length=1)
    total_amount: int = Field(..., ge=0)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    @model_validator(mode="after")
    def validate_total_amount(self) -> "Order":
        expected = sum(item.subtotal for item in self.items)
        if self.total_amount != expected:
            raise ValueError(
                f"total_amount ({self.total_amount}) must equal sum of subtotals ({expected})"
            )
        return self


class OrderHistory(BaseModel):
    """과거 주문 이력."""

    id: str = Field(..., description="UUID v4")
    store_id: str = Field(..., min_length=3, max_length=20)
    table_number: int = Field(..., ge=1)
    session_id: str = Field(...)
    orders: list[Order] = Field(...)
    total_session_amount: int = Field(..., ge=0)
    session_started_at: str = Field(...)
    session_ended_at: str = Field(...)
    archived_at: str = Field(default_factory=utc_now)
