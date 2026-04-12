import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, messages_from_dict, messages_to_dict
import jwt as pyjwt

from app.graph.builder import chatbot
from app.core.config import settings
from app.core.database import db

router = APIRouter()

# Persistent session store — one document per user:workspace pair.
# Collection: { _id: "user_id:workspace_id", messages: [...serialized...] }
_sessions = db["chat_sessions"]

# ---------------------------------------------------------------------------
# Sliding-window size: only the last N messages are sent to the LLM.
# Older messages stay in MongoDB for history display but don't inflate the
# context window or token cost on every turn.
# ---------------------------------------------------------------------------
_WINDOW = 20

# ---------------------------------------------------------------------------
# Simple in-memory rate limiter: max 20 /chat requests per user per minute.
# Stored as a sliding list of timestamps, pruned on each request.
# Works for single-instance deployment (Docker, Render free tier, etc.).
# For multi-instance deployments replace with Redis-backed slowapi.
# ---------------------------------------------------------------------------
_RATE_LIMIT = 20          # max requests
_RATE_WINDOW = 60         # seconds
_rate_store: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(user_id: str) -> None:
    """Raise 429 if the user has exceeded the rate limit."""
    now = time.monotonic()
    timestamps = _rate_store[user_id]
    # Drop timestamps outside the rolling window
    _rate_store[user_id] = [t for t in timestamps if now - t < _RATE_WINDOW]
    if len(_rate_store[user_id]) >= _RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests — max {_RATE_LIMIT} per {_RATE_WINDOW}s",
        )
    _rate_store[user_id].append(now)


class ChatRequest(BaseModel):
    workspace_id: str
    message: str


class ClearRequest(BaseModel):
    workspace_id: str


def _session_key(user_id: str, workspace_id: str) -> str:
    return f"{user_id}:{workspace_id}"


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


@router.post("/chat")
async def chat(req: ChatRequest, user_id: str = Depends(get_current_user)):
    # Enforce per-user rate limit before doing any work
    _check_rate_limit(user_id)

    key = _session_key(user_id, req.workspace_id)

    # Load full conversation history from MongoDB
    doc = await _sessions.find_one({"_id": key})
    history = messages_from_dict(doc["messages"]) if doc else []

    # Append the new user message to the full history
    all_messages = history + [HumanMessage(content=req.message)]

    # Sliding window: pass only the last _WINDOW messages to the LLM so that
    # token cost stays constant as conversations grow. The full history is still
    # persisted to MongoDB below so nothing is lost.
    windowed = all_messages[-_WINDOW:]

    result = await chatbot.ainvoke({
        "messages": windowed,
        "workspace_id": req.workspace_id,
        "user_id": user_id,
    })

    # The graph returns only the windowed messages + its replies.
    # Reconstruct full history: everything before the window + graph output.
    pre_window = all_messages[:-_WINDOW] if len(all_messages) > _WINDOW else []
    full_history = pre_window + result["messages"]

    # Persist updated full history back to MongoDB
    serialized = messages_to_dict(full_history)
    await _sessions.replace_one(
        {"_id": key},
        {"_id": key, "messages": serialized},
        upsert=True,
    )

    return {"reply": _extract_text(result["messages"][-1].content)}


@router.post("/chat/clear")
async def clear_session(req: ClearRequest, user_id: str = Depends(get_current_user)):
    key = _session_key(user_id, req.workspace_id)
    await _sessions.delete_one({"_id": key})
    return {"cleared": True}
