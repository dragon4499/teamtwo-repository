"""Global error handlers for the FastAPI application."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.exceptions import (
    AuthenticationError,
    ConcurrencyError,
    DataCorruptionError,
    DuplicateError,
    NotFoundError,
    ValidationError,
)

logger = logging.getLogger("table_order")


def register_exception_handlers(app: FastAPI) -> None:
    """모든 커스텀 예외 핸들러를 앱에 등록."""

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(AuthenticationError)
    async def auth_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    @app.exception_handler(DuplicateError)
    async def duplicate_handler(request: Request, exc: DuplicateError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(ConcurrencyError)
    async def concurrency_handler(request: Request, exc: ConcurrencyError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(DataCorruptionError)
    async def corruption_handler(request: Request, exc: DataCorruptionError) -> JSONResponse:
        logger.error("Data corruption: %s", str(exc))
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    @app.exception_handler(Exception)
    async def global_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception: %s", str(exc))
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
