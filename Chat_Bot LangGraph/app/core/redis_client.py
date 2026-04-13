"""
redis_client.py — async Redis connection singleton for the Meetra chatbot.

WHY A SINGLETON:
    redis-py's asyncio client manages a connection pool internally. Creating one
    client per request would open a new TCP connection on every /chat call —
    wasteful and slow. Instead we create one client at startup (in main.py
    lifespan) and reuse it across all requests. This is the same pattern used
    by Motor (MongoDB async driver) in database.py.

HOW IT WORKS:
    - `connect()` is called once in main.py lifespan before the server starts
      accepting requests. It opens the pool and does a PING to fail fast if
      Redis is unreachable (misconfigured URI, Redis container not running, etc.)
    - `close()` is called on shutdown to cleanly drain the pool.
    - `redis` is the module-level client; imported directly in chat.py:
          from app.core import redis_client
          await redis_client.redis.get(key)

KEY OPTIONS:
    - decode_responses=True  → Redis returns str instead of bytes. This means
      we can store/retrieve plain JSON strings without manual .decode() calls.
    - The connection URL format is the standard redis:// URI:
          redis://[password@]host[:port][/db]
      In Docker Compose the host is the service name: redis://redis:6379/0
      In local dev (bare uvicorn): redis://localhost:6379/0
"""

import redis.asyncio as aioredis

from app.core.config import settings

# Module-level variable; None until connect() is called in main.py lifespan.
# Typed as Optional so callers know it could theoretically be unset, but in
# practice it is always set before the first request is handled.
redis: aioredis.Redis | None = None


async def connect() -> None:
    """
    Open the Redis connection pool and verify connectivity.

    Called once from main.py lifespan. Raises ConnectionError if Redis is
    unreachable — this intentionally crashes the app at startup rather than
    letting the first /chat request fail with a confusing 500.
    """
    global redis
    redis = aioredis.from_url(
        settings.REDIS_URI,
        encoding="utf-8",
        decode_responses=True,  # all get/set values are str, not bytes
    )
    # PING verifies the connection is live — fail fast at startup, not mid-request
    await redis.ping()


async def close() -> None:
    """
    Gracefully close the Redis connection pool on shutdown.

    Called from main.py lifespan after yield. Waits for in-flight commands
    to complete before closing, preventing data loss during restarts.
    """
    global redis
    if redis:
        await redis.aclose()
        redis = None
