from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.chat import router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast at startup — don't let missing secrets surface mid-request.
    required = ["MONGO_URI", "GEMINI_API_KEY", "JWT_SECRET"]
    missing = [k for k in required if not getattr(settings, k, None)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
    yield


app = FastAPI(title="Meetra Chatbot", lifespan=lifespan)

allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.include_router(router)