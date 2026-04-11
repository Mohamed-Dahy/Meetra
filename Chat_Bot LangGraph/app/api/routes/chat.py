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
    key = _session_key(user_id, req.workspace_id)

    # Load conversation history from MongoDB
    doc = await _sessions.find_one({"_id": key})
    history = messages_from_dict(doc["messages"]) if doc else []

    all_messages = history + [HumanMessage(content=req.message)]

    result = await chatbot.ainvoke({
        "messages": all_messages,
        "workspace_id": req.workspace_id,
        "user_id": user_id,
    })

    # Persist updated history back to MongoDB
    serialized = messages_to_dict(result["messages"])
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
