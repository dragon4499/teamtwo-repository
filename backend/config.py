"""Application configuration for the table order system."""

import os

APP_TITLE = "Table Order API"
APP_VERSION = "0.2.0"

CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
]

DATA_DIR = os.environ.get("DATA_BASE_PATH", "data")

# JWT
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ADMIN_TOKEN_EXPIRE_HOURS = int(os.environ.get("ADMIN_TOKEN_EXPIRE_HOURS", "24"))
TABLE_SESSION_EXPIRE_HOURS = int(os.environ.get("TABLE_SESSION_EXPIRE_HOURS", "16"))

# Security
BCRYPT_COST = int(os.environ.get("BCRYPT_COST", "10"))
LOCK_TIMEOUT = float(os.environ.get("LOCK_TIMEOUT", "5.0"))
