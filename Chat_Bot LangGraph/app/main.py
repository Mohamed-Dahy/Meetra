import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.chat import router
from app.core.config import settings
from app.core.database import db
from app.core import redis_client

_start_time = time.monotonic()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── 1. Env var check — fail fast before accepting any requests ────────────
    required = ["MONGO_URI", "GEMINI_API_KEY", "JWT_SECRET", "REDIS_URI"]
    missing = [k for k in required if not getattr(settings, k, None)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    # ── 2. Connect to Redis ───────────────────────────────────────────────────
    # redis_client.connect() opens the async connection pool and does a PING.
    # If Redis is unreachable (wrong URI, container not started) this raises
    # immediately so the problem surfaces at startup rather than mid-request.
    # In Docker Compose, the chatbot service uses depends_on with
    # condition: service_healthy so Redis is guaranteed to be ready first.
    await redis_client.connect()

    # ── 3. Create MongoDB text index ─────────────────────────────────────────
    # Idempotent — no-op when the index already exists. Enables $text search
    # in search_meetings_by_keyword() instead of slow $regex.
    await db["meetings"].create_index(
        [("title", "text"), ("description", "text"), ("summary", "text")],
        name="meetings_text_search",
        default_language="english",
    )

    yield  # ← server is running; handle requests

    # ── 4. Graceful shutdown — drain Redis connection pool ───────────────────
    # Waits for any in-flight Redis commands to complete before closing the
    # pool. Prevents "connection closed" errors during rolling restarts.
    await redis_client.close()


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


# Health check — used by Docker HEALTHCHECK, UptimeRobot, and Render health checks.
# No auth required; just confirms the process is alive and accepting HTTP requests.
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "uptime": round(time.monotonic() - _start_time),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }