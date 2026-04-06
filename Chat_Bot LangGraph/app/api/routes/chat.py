from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from app.graph.builder import chatbot

router = APIRouter()

# In-memory session store.  Key: "{user_id}:{workspace_id}"  Value: list of LangChain messages.
# Keeps conversation history alive across multiple requests without needing a DB.
_sessions: dict[str, list] = {}


class ChatRequest(BaseModel):
    workspace_id: str
    user_id: str
    message: str


class ClearRequest(BaseModel):
    workspace_id: str
    user_id: str


def _session_key(user_id: str, workspace_id: str) -> str:
    return f"{user_id}:{workspace_id}"


@router.post("/chat")
async def chat(req: ChatRequest):
    key = _session_key(req.user_id, req.workspace_id)

    # Retrieve existing history (empty list for new sessions)
    history = _sessions.get(key, [])

    # Append the new human message to the full history
    all_messages = history + [HumanMessage(content=req.message)]

    result = await chatbot.ainvoke({
        "messages": all_messages,
        "workspace_id": req.workspace_id,
        "user_id": req.user_id,
    })

    # Persist the complete message history (including tool messages) for next turn
    _sessions[key] = result["messages"]

    # The last message is always the final AI response
    return {"reply": result["messages"][-1].content}


@router.post("/chat/clear")
async def clear_session(req: ClearRequest):
    key = _session_key(req.user_id, req.workspace_id)
    _sessions.pop(key, None)
    return {"cleared": True}
