from datetime import datetime, timezone

from app.core.database import db
from bson import ObjectId


async def get_workspace_meetings(workspace_id: str) -> list:
    meetings = await db["meetings"].find(
        {"workspace": ObjectId(workspace_id)},
        {
            "title": 1, "date": 1, "status": 1,
            "summary": 1, "actionItems": 1, "keyDecisions": 1,
            "sentiment": 1, "healthScore": 1,
        }
    ).to_list(length=50)
    return meetings


async def get_workspace_action_items(workspace_id: str) -> list:
    """Return meetings that have at least one action item."""
    meetings = await db["meetings"].find(
        {
            "workspace": ObjectId(workspace_id),
            "actionItems": {"$exists": True, "$not": {"$size": 0}},
        },
        {"title": 1, "date": 1, "actionItems": 1}
    ).to_list(length=50)
    return meetings


async def search_meetings_by_keyword(workspace_id: str, query: str) -> list:
    pattern = {"$regex": query, "$options": "i"}
    meetings = await db["meetings"].find(
        {
            "workspace": ObjectId(workspace_id),
            "$or": [
                {"title": pattern},
                {"description": pattern},
                {"summary": pattern},
            ],
        },
        {"title": 1, "date": 1, "status": 1, "summary": 1, "actionItems": 1, "keyDecisions": 1}
    ).to_list(length=20)
    return meetings


async def get_meeting_by_id(meeting_id: str, workspace_id: str) -> dict | None:
    """Fetch a single meeting, verifying it belongs to the given workspace."""
    meeting = await db["meetings"].find_one(
        {"_id": ObjectId(meeting_id), "workspace": ObjectId(workspace_id)}
    )
    return meeting


async def get_upcoming_meetings(workspace_id: str) -> list:
    """Return meetings with status 'upcoming' and a future date, sorted soonest first."""
    now = datetime.now(timezone.utc)
    meetings = await db["meetings"].find(
        {
            "workspace": ObjectId(workspace_id),
            "status": "upcoming",
            "date": {"$gte": now},
        },
        {"title": 1, "date": 1, "time": 1, "location": 1, "participants": 1, "description": 1}
    ).sort("date", 1).to_list(length=20)
    return meetings


async def resolve_user_names(user_ids: list) -> dict:
    """Return a {str(ObjectId): name} mapping for a list of user ObjectIds."""
    if not user_ids:
        return {}
    users = await db["users"].find(
        {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}},
        {"name": 1}
    ).to_list(length=100)
    return {str(u["_id"]): u.get("name", "Unknown") for u in users}


async def get_workspace_stats(workspace_id: str) -> dict:
    """Return aggregate statistics for a workspace."""
    meetings = await db["meetings"].find(
        {"workspace": ObjectId(workspace_id)},
        {"status": 1, "sentiment": 1, "healthScore": 1, "actionItems": 1}
    ).to_list(length=None)

    total = len(meetings)
    if total == 0:
        return {}

    status_counts: dict[str, int] = {}
    sentiment_counts: dict[str, int] = {}
    health_scores: list[int] = []
    total_actions = 0

    for m in meetings:
        s = m.get("status", "unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

        sent = m.get("sentiment", "neutral")
        sentiment_counts[sent] = sentiment_counts.get(sent, 0) + 1

        hs = m.get("healthScore") or 0
        if hs:
            health_scores.append(hs)

        total_actions += len(m.get("actionItems") or [])

    return {
        "total": total,
        "status_counts": status_counts,
        "sentiment_counts": sentiment_counts,
        "avg_health": round(sum(health_scores) / len(health_scores), 1) if health_scores else 0,
        "total_actions": total_actions,
    }
