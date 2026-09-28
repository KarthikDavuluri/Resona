import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "RESONA Scientific Memory & Decision-Support Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "resona_secret_key_change_in_production"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    POSTGRES_USER: str = "resona_user"
    POSTGRES_PASSWORD: str = "resona_password"
    POSTGRES_DB: str = "resona_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql://resona_user:resona_password@localhost:5432/resona_db"
    
    USE_SQLITE_FALLBACK_IF_PG_UNAVAILABLE: bool = True
    SQLITE_DB_URL: str = "sqlite:///./resona_local.db"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Hindsight Experiential Memory Layer
    HINDSIGHT_API_KEY: Optional[str] = None
    HINDSIGHT_BASE_URL: str = "https://api.hindsight.ai/v1"
    HINDSIGHT_BANK_ID: str = "resona_materials_memory"
    HINDSIGHT_TIMEOUT: float = 10.0

    # ML & Embeddings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # Default Memory Mode for Ablation Studies
    DEFAULT_MEMORY_MODE: bool = True

settings = Settings()
