from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    GEMINI_API_KEY: str
    PORT: int = 8000

    model_config = {"env_file": ".env"}

settings = Settings()