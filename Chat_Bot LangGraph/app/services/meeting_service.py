from app.core.database import db
from bson import ObjectId

async def get_workspace_meetings(workspace_id: str) -> list:
    meetings = await db["meetings"].find(
        {"workspace": ObjectId(workspace_id)},
        {"title": 1, "summary": 1, "actionItems": 1, "keyDecisions": 1, "transcript": 1, "date": 1}
    ).to_list(length=50)
    return meetings