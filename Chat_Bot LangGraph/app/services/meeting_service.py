from datetime import datetime, timezone

from app.core.database import db
from bson import ObjectId

# Maximum number of meetings returned in list queries.
# Set high enough to cover any real workspace; MongoDB does the heavy lifting
# so fetching 200 lean documents is fast. Raised from the old hardcoded 50
# which silently dropped data in larger workspaces.
_LIST_LIMIT = 200


async def get_workspace_meetings(workspace_id: str) -> list:
    meetings = await db["meetings"].find(
        {"workspace": ObjectId(workspace_id)},
        {
            "title": 1, "date": 1, "status": 1,
            "summary": 1, "actionItems": 1, "keyDecisions": 1,
            "sentiment": 1, "healthScore": 1,
        }
    ).to_list(length=_LIST_LIMIT)
    return meetings


async def get_workspace_action_items(workspace_id: str) -> list:
    """Return meetings that have at least one action item."""
    meetings = await db["meetings"].find(
        {
            "workspace": ObjectId(workspace_id),
            "actionItems": {"$exists": True, "$not": {"$size": 0}},
        },
        {"title": 1, "date": 1, "actionItems": 1}
    ).to_list(length=_LIST_LIMIT)
    return meetings


async def search_meetings_by_keyword(workspace_id: str, query: str) -> list:
    """Search meetings using the MongoDB text index on title/description/summary.

    The index is created at startup in main.py lifespan. Text search is
    significantly faster than $regex on large collections because it uses
    an inverted index rather than a full collection scan.

    Falls back to $regex if the text index is somehow missing (e.g. dev
    environment without the index) so the service never crashes.
    """
    try:
        meetings = await db["meetings"].find(
            {
                "workspace": ObjectId(workspace_id),
                "$text": {"$search": query},
            },
            {
                "title": 1, "date": 1, "status": 1, "summary": 1,
                "actionItems": 1, "keyDecisions": 1,
                # Include text score so results can be sorted by relevance
                "score": {"$meta": "textScore"},
            }
        ).sort([("score", {"$meta": "textScore"})]).to_list(length=20)
        return meetings
    except Exception:
        # Text index not available — fall back to regex so the feature still works
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
            {"title": 1, "date": 1, "status": 1, "summary": 1,
             "actionItems": 1, "keyDecisions": 1}
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
    """Return aggregate statistics using a MongoDB aggregation pipeline.

    Previously this fetched all documents into Python and counted in a loop —
    wasteful for large workspaces. The $group + $facet pipeline does the same
    work entirely inside MongoDB, returning a single small result document.
    """
    pipeline = [
        # Filter to this workspace only
        {"$match": {"workspace": ObjectId(workspace_id)}},

        # Compute total, status counts, sentiment counts, health scores,
        # and action item totals in a single pass using $facet so we get
        # one result document back.
        {"$facet": {
            "totals": [
                {"$group": {
                    "_id": None,
                    "total":        {"$sum": 1},
                    "total_actions": {"$sum": {"$size": {"$ifNull": ["$actionItems", []]}}},
                    "health_scores": {
                        "$push": {
                            "$cond": [{"$gt": ["$healthScore", 0]}, "$healthScore", "$$REMOVE"]
                        }
                    },
                }}
            ],
            "by_status": [
                {"$group": {"_id": "$status", "count": {"$sum": 1}}}
            ],
            "by_sentiment": [
                {"$group": {"_id": "$sentiment", "count": {"$sum": 1}}}
            ],
        }},
    ]

    results = await db["meetings"].aggregate(pipeline).to_list(length=1)
    if not results:
        return {}

    r = results[0]
    totals = r["totals"][0] if r["totals"] else None
    if not totals:
        return {}

    health_scores = totals.get("health_scores") or []
    avg_health = round(sum(health_scores) / len(health_scores), 1) if health_scores else 0

    return {
        "total":           totals["total"],
        "total_actions":   totals["total_actions"],
        "avg_health":      avg_health,
        "status_counts":   {d["_id"]: d["count"] for d in r["by_status"]},
        "sentiment_counts": {d["_id"]: d["count"] for d in r["by_sentiment"]},
    }
