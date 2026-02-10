"""Enum definitions for the table order system."""

from enum import StrEnum


class OrderStatus(StrEnum):
    """주문 상태."""

    PENDING = "pending"
    PREPARING = "preparing"
    COMPLETED = "completed"

    @classmethod
    def valid_transitions(cls) -> dict["OrderStatus", list["OrderStatus"]]:
        """허용된 상태 전이 맵."""
        return {
            cls.PENDING: [cls.PREPARING, cls.COMPLETED],
            cls.PREPARING: [cls.PENDING, cls.COMPLETED],
            cls.COMPLETED: [],
        }

    def can_transition_to(self, target: "OrderStatus") -> bool:
        """현재 상태에서 target 상태로 전이 가능한지 확인."""
        return target in self.valid_transitions().get(self, [])


class SessionStatus(StrEnum):
    """테이블 세션 상태."""

    ACTIVE = "active"
    ENDED = "ended"


class UserRole(StrEnum):
    """관리자 역할."""

    ADMIN = "admin"
    STAFF = "staff"
