from langchain_core.tools import tool
from app.core.database import db
from bson import ObjectId


@tool
async def get_meetings(workspace_id: str) -> str:
    """Get all meetings in a workspace with their summaries and key decisions."""

    try:
        meetings = await db["meetings"].find(
            {"workspace": ObjectId(workspace_id)},
            {
                "title": 1,
                "date": 1,
                "summary": 1,
                "keyDecisions": 1,
                "actionItems": 1,
            },
        ).to_list(length=20)

    except Exception as e:
        return f"Error fetching meetings: {str(e)}"

    if not meetings:
        return "No meetings found in this workspace."

    result = []

    for m in meetings:
        title = m.get("title", "Untitled")
        date = m.get("date", "")
        summary = m.get("summary", "N/A")
        decisions = m.get("keyDecisions", [])
        actions = m.get("actionItems", [])

        formatted = (
            f"- {title} ({date}):\n"
            f"  Summary: {summary}\n"
            f"  Decisions: {decisions}\n"
            f"  Actions: {actions}"
        )

        result.append(formatted)

    return "\n\n".join(result)