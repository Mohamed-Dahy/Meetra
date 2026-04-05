from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from app.core.config import settings
from app.tools.meeting_tools import get_meetings

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=settings.GEMINI_API_KEY)
tools = [get_meetings]
llm_with_tools = llm.bind_tools(tools)

async def agent_node(state):
    system = SystemMessage(content=(
        "You are a workspace assistant for Meetra. Help users recall meetings, "
        "action items, key decisions, and make informed decisions."
    ))
    response = await llm_with_tools.ainvoke([system] + state["messages"])
    return {"messages": [response]}