from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "GoldenSweep"
    APP_ENV: str = "development"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"

    OBJECT_STORAGE_BUCKET: str
    OBJECT_STORAGE_REGION: str = ""
    OBJECT_STORAGE_ENDPOINT_URL: str = ""
    OBJECT_STORAGE_PUBLIC_BASE_URL: str = ""
    OBJECT_STORAGE_ACCESS_KEY: str
    OBJECT_STORAGE_SECRET_KEY: str
    OBJECT_STORAGE_PUBLIC_READ: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
