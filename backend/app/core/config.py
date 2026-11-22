from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Значения берутся из переменных окружения / файла .env.

    app_name: str = "Грант.Навигатор API"
    debug: bool = True

    database_url: str = "postgresql+psycopg2://grant_user:grant_password@localhost:5432/grant_navigator"

    jwt_secret: str = "CHANGE_ME_USE_A_RANDOM_SECRET_AT_LEAST_32_CHARS"
    access_token_minutes: int = 15
    refresh_token_days: int = 7

    # Список разрешённых источников для CORS, через запятую в .env
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    # lru_cache — чтобы .env читался один раз, а не при каждом запросе
    return Settings()
