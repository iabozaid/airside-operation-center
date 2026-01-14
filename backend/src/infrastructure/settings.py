from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # Core
    DATABASE_URL: str
    REDIS_URL: str

    # Security secret (required by AuthService)
    AUTH_SECRET: str

    # Demo / Compatibility flags
    # If true, forces Redis Streams features off (e.g., Redis 3.0 compatibility)
    DEMO_NO_REDIS_STREAMS: bool = False
    # If true, disables ALL Redis usage (In-Memory EventBus/Consumers)
    DEMO_NO_REDIS: bool = False

    # Feature Flags
    AUTO_MIGRATE: bool = False
    SEED_ADMIN: bool = False

    # Admin Seed Config
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin"

    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Pydantic v2 config
    # extra="ignore" prevents crashes when env has extra keys
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
