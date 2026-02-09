"""FastAPI application entry point for the table order system."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from backend.data.seed import seed_data
from backend.dependencies import datastore
from backend.middleware.error_handler import ErrorHandlerMiddleware
from backend.routers import admin, customer, sse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작 시 시드 데이터 초기화."""
    await seed_data(datastore)
    yield


app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler middleware
app.add_middleware(ErrorHandlerMiddleware)

# Routers
app.include_router(customer.router)
app.include_router(admin.router)
app.include_router(sse.router)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
