from typing import Annotated

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.services.meeting_service import (
    get_workspace_meetings,
    get_workspace_action_items,
    search_meetings_by_keyword,
    get_meeting_by_id,
    get_upcoming_meetings as _get_upcoming,
    resolve_user_names,
    get_workspace_stats as _get_stats,
)


def _fmt_date(val) -> str:
    return str(val)[:10] if val else "N/A"


@tool
async def get_meetings(
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Get all meetings in this workspace with their summaries, key decisions,
    action items, sentiment and health scores. Use this first when the user asks
    about meetings in general."""
    try:
        meetings = await get_workspace_meetings(workspace_id)
    except Exception as e:
        return f"Error fetching meetings: {e}"

    if not meetings:
        return "No meetings found in this workspace."

    parts = []
    for m in meetings:
        decisions = ", ".join(m.get("keyDecisions") or []) or "none"
        actions = ", ".join(m.get("actionItems") or []) or "none"
        parts.append(
            f"[ID: {m['_id']}]  {m.get('title', 'Untitled')}  ({_fmt_date(m.get('date'))})\n"
            f"  Status: {m.get('status', 'N/A')}  |  Sentiment: {m.get('sentiment', 'N/A')}  |  Health: {m.get('healthScore', 0)}/100\n"
            f"  Summary: {m.get('summary') or 'No summary yet'}\n"
            f"  Key Decisions: {decisions}\n"
            f"  Action Items: {actions}"
        )
    return "\n\n".join(parts)


@tool
async def get_action_items(
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Get all pending action items grouped by meeting across this workspace.
    Use when the user asks what tasks or follow-ups are outstanding."""
    try:
        meetings = await get_workspace_action_items(workspace_id)
    except Exception as e:
        return f"Error fetching action items: {e}"

    if not meetings:
        return "No action items found in this workspace."

    parts = []
    for m in meetings:
        items = m.get("actionItems") or []
        if items:
            bullet_lines = "\n".join(f"  • {a}" for a in items)
            parts.append(
                f"{m.get('title', 'Untitled')}  ({_fmt_date(m.get('date'))}):\n{bullet_lines}"
            )

    return "\n\n".join(parts) if parts else "No action items found."


@tool
async def search_meetings(
    query: str,
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Search for meetings by keyword across title, description, and summary.
    Use when the user mentions a specific topic, project, or name."""
    try:
        meetings = await search_meetings_by_keyword(workspace_id, query)
    except Exception as e:
        return f"Error searching meetings: {e}"

    if not meetings:
        return f"No meetings found matching '{query}'."

    parts = []
    for m in meetings:
        parts.append(
            f"[ID: {m['_id']}]  {m.get('title', 'Untitled')}  ({_fmt_date(m.get('date'))})\n"
            f"  Status: {m.get('status', 'N/A')}\n"
            f"  Summary: {m.get('summary') or 'No summary yet'}"
        )
    return "\n\n".join(parts)


@tool
async def get_meeting_details(
    meeting_id: str,
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Get full details for a specific meeting including participant names and transcript.
    Requires a meeting ID — get IDs from get_meetings or search_meetings first."""
    try:
        meeting = await get_meeting_by_id(meeting_id, workspace_id)
    except Exception as e:
        return f"Error fetching meeting: {e}"

    if not meeting:
        return f"Meeting {meeting_id} not found in this workspace."

    # Resolve participant ObjectIds → real names
    raw_participants = [str(p) for p in (meeting.get("participants") or [])]
    name_map = await resolve_user_names(raw_participants)
    participant_names = ", ".join(name_map.get(pid, pid) for pid in raw_participants) or "None"

    transcript = (meeting.get("transcript") or "No transcript available.")
    if len(transcript) > 3000:
        transcript = transcript[:3000] + "…"

    decisions = "\n".join(f"• {d}" for d in (meeting.get("keyDecisions") or ["none"]))
    actions = "\n".join(f"• {a}" for a in (meeting.get("actionItems") or ["none"]))

    return (
        f"Title: {meeting.get('title', 'Untitled')}\n"
        f"Date: {_fmt_date(meeting.get('date'))}  |  Time: {meeting.get('time', 'N/A')}\n"
        f"Location: {meeting.get('location', 'N/A')}\n"
        f"Participants: {participant_names}\n"
        f"Status: {meeting.get('status', 'N/A')}  |  "
        f"Sentiment: {meeting.get('sentiment', 'N/A')}  |  "
        f"Health Score: {meeting.get('healthScore', 0)}/100\n\n"
        f"Summary:\n{meeting.get('summary') or 'No summary yet'}\n\n"
        f"Key Decisions:\n{decisions}\n\n"
        f"Action Items:\n{actions}\n\n"
        f"Transcript:\n{transcript}"
    )


@tool
async def get_upcoming_meetings(
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Get all scheduled (upcoming) meetings in this workspace sorted by date.
    Use when the user asks what meetings are coming up, planned, or scheduled."""
    try:
        meetings = await _get_upcoming(workspace_id)
    except Exception as e:
        return f"Error fetching upcoming meetings: {e}"

    if not meetings:
        return "No upcoming meetings found in this workspace."

    # Collect all participant IDs across all meetings for a single bulk name lookup
    all_ids = list({str(p) for m in meetings for p in (m.get("participants") or [])})
    name_map = await resolve_user_names(all_ids)

    parts = []
    for m in meetings:
        raw = [str(p) for p in (m.get("participants") or [])]
        names = ", ".join(name_map.get(pid, pid) for pid in raw) or "No participants listed"
        parts.append(
            f"{m.get('title', 'Untitled')}\n"
            f"  Date: {_fmt_date(m.get('date'))}  |  Time: {m.get('time', 'N/A')}\n"
            f"  Location: {m.get('location', 'N/A')}\n"
            f"  Participants: {names}"
        )
    return "\n\n".join(parts)


@tool
async def get_workspace_stats(
    workspace_id: Annotated[str, InjectedState("workspace_id")],
) -> str:
    """Get aggregate statistics for this workspace: total meetings, status breakdown,
    sentiment distribution, average health score, and total action items.
    Use when the user asks for an overview, summary, or how the workspace is performing."""
    try:
        stats = await _get_stats(workspace_id)
    except Exception as e:
        return f"Error fetching stats: {e}"

    if not stats:
        return "No meetings found in this workspace — nothing to aggregate."

    status_line = "  " + ",  ".join(
        f"{k}: {v}" for k, v in stats["status_counts"].items()
    )
    sentiment_line = "  " + ",  ".join(
        f"{k}: {v}" for k, v in stats["sentiment_counts"].items()
    )

    return (
        f"Workspace Statistics\n"
        f"────────────────────\n"
        f"Total Meetings   : {stats['total']}\n"
        f"By Status        :\n{status_line}\n"
        f"By Sentiment     :\n{sentiment_line}\n"
        f"Avg Health Score : {stats['avg_health']}/100\n"
        f"Total Action Items: {stats['total_actions']}"
    )
