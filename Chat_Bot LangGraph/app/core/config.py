from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    GEMINI_API_KEY: str
    JWT_SECRET: str
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost"
    PORT: int = 8000

    model_config = {"env_file": ".env"}

settings = Settings()