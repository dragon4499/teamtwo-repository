"""Global error handler for the FastAPI application."""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("table_order")


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """미처리 예외를 캐치하여 500 응답을 반환합니다."""
    logger.error("Unhandled exception: %s", str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
