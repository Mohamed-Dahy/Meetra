from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.graph.builder import chatbot

router = APIRouter()

class ChatRequest(BaseModel):
    workspace_id: str
    user_id: str
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):
    result = await chatbot.ainvoke({
        "messages": [HumanMessage(content=req.message)],
        "workspace_id": req.workspace_id,
        "user_id": req.user_id
    })
    return {"reply": result["messages"][-1].content}