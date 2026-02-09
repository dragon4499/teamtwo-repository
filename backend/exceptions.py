"""Custom exception classes for the table order system."""


class NotFoundError(Exception):
    """리소스를 찾을 수 없음 (404)."""

    def __init__(self, entity: str, id: str) -> None:
        self.entity = entity
        self.id = id
        super().__init__(f"{entity} with id '{id}' not found")


class ValidationError(Exception):
    """데이터 검증 실패 (400)."""

    def __init__(self, message: str) -> None:
        super().__init__(message)


class DuplicateError(Exception):
    """중복 데이터 (409)."""

    def __init__(self, entity: str, field: str, value: str) -> None:
        self.entity = entity
        self.field = field
        self.value = value
        super().__init__(f"{entity} with {field}='{value}' already exists")


class ConcurrencyError(Exception):
    """동시성 잠금 타임아웃 (409)."""

    def __init__(self, message: str) -> None:
        super().__init__(message)


class DataCorruptionError(Exception):
    """데이터 파일 손상 (500)."""

    def __init__(self, file_path: str, detail: str) -> None:
        self.file_path = file_path
        self.detail = detail
        super().__init__(f"Data corruption in '{file_path}': {detail}")
