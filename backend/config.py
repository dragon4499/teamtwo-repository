"""Application configuration for the table order system."""


APP_TITLE = "Table Order API"
APP_VERSION = "0.1.0"

CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
]

DATA_DIR = "data"
