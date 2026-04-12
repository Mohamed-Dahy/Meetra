from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.chat import router
from app.core.config import settings
from app.core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast at startup — don't let missing secrets surface mid-request.
    required = ["MONGO_URI", "GEMINI_API_KEY", "JWT_SECRET"]
    missing = [k for k in required if not getattr(settings, k, None)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    # Create a compound text index on the meetings collection so that
    # search_meetings can use $text search (fast inverted index) instead of
    # $regex (slow full-collection scan). create_index is idempotent — safe to
    # call every startup; it's a no-op when the index already exists.
    await db["meetings"].create_index(
        [("title", "text"), ("description", "text"), ("summary", "text")],
        name="meetings_text_search",
        default_language="english",
    )

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