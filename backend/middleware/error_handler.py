"""Global error handler middleware for the FastAPI application."""

import logging
import traceback

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

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


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """모든 예외를 캐치하여 적절한 HTTP 응답으로 변환하는 미들웨어."""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except NotFoundError as exc:
            return JSONResponse(status_code=404, content={"detail": str(exc)})
        except ValidationError as exc:
            return JSONResponse(status_code=400, content={"detail": str(exc)})
        except AuthenticationError as exc:
            return JSONResponse(status_code=401, content={"detail": str(exc)})
        except AccountLockedError as exc:
            return JSONResponse(
                status_code=403,
                content={"detail": str(exc), "locked_until": exc.locked_until},
            )
        except InvalidStateTransitionError as exc:
            return JSONResponse(
                status_code=400,
                content={"detail": str(exc), "current": exc.current, "target": exc.target},
            )
        except DuplicateError as exc:
            return JSONResponse(status_code=409, content={"detail": str(exc)})
        except ConcurrencyError as exc:
            return JSONResponse(status_code=409, content={"detail": str(exc)})
        except Exception as exc:
            logger.error("Unhandled exception: %s\n%s", str(exc), traceback.format_exc())
            return JSONResponse(status_code=500, content={"detail": "Internal server error"})
