import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "UrbanPulse AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    JWT_SECRET_KEY: str = "urbanpulse-super-secret-jwt-key-change-in-production-2026!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database configuration
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "urbanpulse_ai"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 5
    
    # Demo defaults
    DEMO_ADMIN_NAME: str = "Operations Supervisor (Demo)"
    DEMO_ADMIN_EMAIL: str = "admin@urbanpulse.ai"
    DEMO_ADMIN_PASSWORD: str = "AdminPassword123!"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
