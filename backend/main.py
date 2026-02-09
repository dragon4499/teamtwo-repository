"""FastAPI application entry point for the table order system."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from backend.middleware.error_handler import register_exception_handlers
from backend.routers import admin, customer, sse

app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
register_exception_handlers(app)

# Routers
app.include_router(customer.router)
app.include_router(admin.router)
app.include_router(sse.router)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
