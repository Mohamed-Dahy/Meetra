"""
chat.py — /chat and /chat/clear endpoints for the Meetra chatbot.

SESSION STORAGE (Redis):
    Conversation history is stored in Redis as a JSON string keyed by
    "session:{user_id}:{workspace_id}". Each key has a 7-day TTL that resets
    on every write — so active sessions never expire, idle ones clean up
    automatically without manual housekeeping.

    WHY REDIS INSTEAD OF MONGODB:
    The previous implementation stored sessions in a MongoDB `chat_sessions`
    collection. That works but has two problems:
      1. Every /chat request did a full document load + upsert of the entire
         serialized message list — slow as history grows.
      2. Restarting the container preserved history (good) but any crash between
         write and the next request could lose the last message.
    Redis is an in-memory store optimised for exactly this pattern: fast reads,
    fast writes, automatic expiry. The AOF persistence option (enabled in
    docker-compose.yml) means data survives clean restarts.

RATE LIMITING (Redis sorted set):
    The previous in-memory dict (_rate_store) worked only for a single container
    instance — two running chatbot replicas would each have their own counter,
    letting users double their request budget. A Redis sorted set is the
    industry-standard solution for multi-instance sliding-window rate limiting:

    - Each request adds an entry: ZADD rate:{user_id} <timestamp> <timestamp>
    - Expired entries are pruned: ZREMRANGEBYSCORE ... "-inf" <window_start>
    - Active count is checked: ZCARD rate:{user_id}
    All three operations run in a single atomic pipeline — no race conditions.

SLIDING WINDOW (unchanged):
    Only the last 20 messages are passed to the LLM graph to keep token cost
    constant. The full history is stored in Redis so nothing is lost.
"""

import json
import time

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, messages_from_dict, messages_to_dict
import jwt as pyjwt

from app.graph.builder import chatbot
from app.core.config import settings
from app.core import redis_client

router = APIRouter()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# How many messages are passed to the LLM per turn.
# Full history (all messages) is persisted to Redis; only the window is
# sent to Gemini so token cost stays flat as conversations grow.
_WINDOW = 20

# Session TTL in seconds — 7 days.
# The TTL is reset (extended) on every write so active sessions never expire.
# A session that has been idle for 7 days is automatically deleted by Redis,
# keeping memory usage bounded without manual cleanup jobs.
_SESSION_TTL = 60 * 60 * 24 * 7  # 7 days

# Rate limiting: max 20 /chat requests per user per 60-second window.
_RATE_LIMIT  = 20   # max requests per window
_RATE_WINDOW = 60   # window size in seconds


# ---------------------------------------------------------------------------
# Key helpers — centralised so any future schema change is one-line
# ---------------------------------------------------------------------------

def _session_key(user_id: str, workspace_id: str) -> str:
    """Redis key for a user's conversation history in one workspace."""
    return f"session:{user_id}:{workspace_id}"


def _rate_key(user_id: str) -> str:
    """Redis key for a user's rate-limit sorted set."""
    return f"rate:{user_id}"


# ---------------------------------------------------------------------------
# Session helpers
# ---------------------------------------------------------------------------

async def _load_session(key: str) -> list:
    """
    Load the full conversation history for a session key.

    Returns a list of LangChain message objects (HumanMessage, AIMessage, etc.)
    deserialized from the JSON stored in Redis. Returns an empty list if the
    session doesn't exist yet (new conversation).

    Redis GET is O(1) and returns None when the key doesn't exist — no
    exception to catch.
    """
    raw = await redis_client.redis.get(key)
    if not raw:
        return []
    return messages_from_dict(json.loads(raw))


async def _save_session(key: str, messages: list) -> None:
    """
    Persist the full conversation history for a session key.

    Serializes LangChain messages to a JSON string via messages_to_dict()
    (the standard LangChain serialization format) and stores it in Redis.

    The EX parameter resets the TTL on every write — the session expires
    _SESSION_TTL seconds after the LAST message, not after the first.
    Redis SET with EX is a single atomic O(1) command.
    """
    serialized = json.dumps(messages_to_dict(messages))
    await redis_client.redis.set(key, serialized, ex=_SESSION_TTL)


# ---------------------------------------------------------------------------
# Rate limiter — Redis sorted set (sliding window)
# ---------------------------------------------------------------------------

async def _check_rate_limit(user_id: str) -> None:
    """
    Enforce a per-user sliding-window rate limit using a Redis sorted set.

    HOW IT WORKS:
        A sorted set stores one entry per request. The member and score are
        both the current Unix timestamp (as a float). This lets us use
        ZREMRANGEBYSCORE to prune entries older than the window in O(log N).

        All four Redis commands run in a single MULTI/EXEC pipeline so the
        read-modify-write cycle is atomic — no race condition between two
        concurrent requests from the same user.

    COMMANDS:
        ZREMRANGEBYSCORE key -inf <window_start>  → prune expired entries
        ZADD key <now> <now>                      → record this request
        ZCARD key                                  → count in current window
        EXPIRE key <window>                        → auto-clean the key

    Raises HTTP 429 if count > _RATE_LIMIT after adding the current request.
    Note: the ZADD runs before the check so the current request is counted.
    If over limit the request is rejected but the entry stays — this is
    intentional (conservative) and matches standard rate-limiter behaviour.
    """
    key = _rate_key(user_id)
    now = time.time()
    window_start = now - _RATE_WINDOW

    async with redis_client.redis.pipeline(transaction=True) as pipe:
        # Step 1: remove timestamps that fell outside the sliding window
        pipe.zremrangebyscore(key, "-inf", window_start)
        # Step 2: record this request (score = timestamp, member = str(timestamp))
        # Using str(now) as member ensures uniqueness even if two requests
        # arrive in the same millisecond (float precision).
        pipe.zadd(key, {str(now): now})
        # Step 3: count how many requests are in the window (including this one)
        pipe.zcard(key)
        # Step 4: set TTL so the key doesn't linger after activity stops
        pipe.expire(key, _RATE_WINDOW)
        results = await pipe.execute()

    count = results[2]  # result of ZCARD
    if count > _RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests — max {_RATE_LIMIT} per {_RATE_WINDOW}s",
        )


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    workspace_id: str
    message: str


class ClearRequest(BaseModel):
    workspace_id: str


# ---------------------------------------------------------------------------
# Auth dependency
# ---------------------------------------------------------------------------

def _extract_text(content) -> str:
    """LangChain message content can be a plain string or a list of content
    blocks (e.g. Gemini returns [{type, text, extras}]).  Always return str."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
        )
    return str(content)


async def get_current_user(authorization: str = Header(...)) -> str:
    """Verify the Bearer JWT issued by the backend and return the user_id."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = pyjwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing user id")
        return str(user_id)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/chat")
async def chat(req: ChatRequest, user_id: str = Depends(get_current_user)):
    # 1. Rate limit check — raises 429 before any DB/LLM work if over limit
    await _check_rate_limit(user_id)

    key = _session_key(user_id, req.workspace_id)

    # 2. Load full conversation history from Redis (O(1) string GET)
    history = await _load_session(key)

    # 3. Append the new user message to the full history
    all_messages = history + [HumanMessage(content=req.message)]

    # 4. Sliding window: pass only the last _WINDOW messages to the LLM.
    #    Older messages are still in all_messages and will be re-persisted below
    #    so they're never lost — just not sent to Gemini.
    windowed = all_messages[-_WINDOW:]

    # 5. Run the LangGraph agent (tools + LLM turns until a final answer)
    result = await chatbot.ainvoke({
        "messages": windowed,
        "workspace_id": req.workspace_id,
        "user_id": user_id,
    })

    # 6. Reconstruct full history: everything before the window + graph output.
    #    The graph only saw/modified the windowed slice, so we prepend the
    #    older messages to keep the complete record intact.
    pre_window = all_messages[:-_WINDOW] if len(all_messages) > _WINDOW else []
    full_history = pre_window + result["messages"]

    # 7. Persist back to Redis — resets the 7-day TTL
    await _save_session(key, full_history)

    return {"reply": _extract_text(result["messages"][-1].content)}


@router.post("/chat/clear")
async def clear_session(req: ClearRequest, user_id: str = Depends(get_current_user)):
    """Delete the conversation history for this user+workspace pair."""
    key = _session_key(user_id, req.workspace_id)
    await redis_client.redis.delete(key)
    return {"cleared": True}
