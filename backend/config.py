"""Application configuration for the table order system."""


APP_TITLE = "Table Order API"
APP_VERSION = "0.1.0"

CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
]

DATA_DIR = "data"

# JWT settings
JWT_SECRET = "table-order-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 16

# Auth settings
MAX_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCK_MINUTES = 30

# Session settings
SESSION_EXPIRY_HOURS = 16
