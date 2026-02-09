"""Global error handler for the FastAPI application."""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.exceptions import (
    AccountLockedError,
    AuthenticationError,
    ConcurrencyError,
    DuplicateError,
    InvalidStateTransitionError,
    NotFoundError,
    ValidationError,
)

logger = logging.getLogger("table_order")


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """미처리 예외를 캐치하여 적절한 HTTP 응답을 반환합니다."""

    if isinstance(exc, NotFoundError):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    if isinstance(exc, ValidationError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    if isinstance(exc, AuthenticationError):
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    if isinstance(exc, AccountLockedError):
        return JSONResponse(
            status_code=403,
            content={"detail": str(exc), "locked_until": exc.locked_until},
        )

    if isinstance(exc, InvalidStateTransitionError):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc), "current": exc.current, "target": exc.target},
        )

    if isinstance(exc, DuplicateError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    if isinstance(exc, ConcurrencyError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    logger.error("Unhandled exception: %s", str(exc))
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
