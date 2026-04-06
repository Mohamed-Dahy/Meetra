# Meetra AI Chatbot — Full Documentation

## What is it?

A separate Python microservice that acts as an AI assistant inside the Meetra dashboard.
Users can ask questions about their workspace meetings in plain English and get real answers
pulled directly from the database — no manual searching required.

It runs alongside the main Node.js backend as an independent service on port **8000**.

---

## What can it do?

| Question | Tool used |
|---|---|
| "Show me all meetings" | `get_meetings` |
| "What tasks are still pending?" | `get_action_items` |
| "Find meetings about the product launch" | `search_meetings` |
| "Give me full details on that meeting" | `get_meeting_details` |
| "What meetings are coming up?" | `get_upcoming_meetings` |
| "How is the workspace performing?" | `get_workspace_stats` |

It also **remembers the conversation** — follow-up questions like "Who was in that meeting?"
work because history is kept per user+workspace session.

---

## Architecture

```
Browser (ChatWidget)
        │  HTTP POST /chat
        ▼
  FastAPI server (port 8000)
        │
        ▼
  api/routes/chat.py  ──── session memory (in-memory dict)
        │
        ▼
  LangGraph (graph/builder.py)
        │
        ├──► agent node (graph/nodes.py)
        │         └── Gemini 2.5 Flash LLM + system prompt
        │
        └──► tools node (graph/nodes.py → tools/meeting_tools.py)
                  └── services/meeting_service.py
                            └── MongoDB (Meetra_database)
```

**Flow of a single message:**
1. Frontend sends `{ workspace_id, user_id, message }` to `/chat`
2. Server loads existing session history, appends new message
3. LangGraph runs: LLM decides which tool to call
4. Tool node executes the tool, injects `workspace_id` automatically from state
5. LLM reads tool result, generates a natural language reply
6. Server saves updated history, returns reply to frontend

---

## Build History — Step by Step

### Step 1 — Basic skeleton
- Created the FastAPI app (`main.py`)
- One tool: `get_meetings` (fetch meetings from MongoDB)
- Simple graph: `agent → END` (single pass, no tool execution loop — **broken at this point**)
- One endpoint: `POST /chat`
- No conversation memory

### Step 2 — Made it actually work
**Fixed the tool loop:**
- Added `ToolNode` + `tools_condition` to the graph
- Graph became: `agent → tools → agent → … → END`
- Without this, tool calls were generated but never executed

**Fixed workspace_id injection:**
- Used `InjectedState("workspace_id")` annotation on every tool
- The LLM no longer needs to figure out or guess the workspace — it's injected automatically from state

**Added 3 more tools:**
- `get_action_items` — pending tasks across all meetings
- `search_meetings(query)` — keyword search
- `get_meeting_details(meeting_id)` — full details + transcript

**Added conversation memory:**
- In-memory session store (dict keyed by `user_id:workspace_id`)
- Full message history persisted across requests
- Added `POST /chat/clear` to reset a session

**Built the frontend ChatWidget:**
- Floating button bottom-right of dashboard
- Workspace dropdown, message list, typing indicator
- Sends messages to the chatbot server

### Step 3 — Richer tools + real participant names
**Two new tools:**
- `get_upcoming_meetings` — scheduled meetings sorted by date
- `get_workspace_stats` — aggregate stats (totals, sentiment, avg health score)

**Fixed participant names:**
- `get_meeting_details` previously showed raw MongoDB ObjectIds for participants
- Now does a bulk user lookup and shows real names ("Alice, Bob")
- `get_upcoming_meetings` also shows resolved participant names

---

## File-by-File Breakdown

### Python microservice (`Chat_Bot LangGraph/app/`)

**`main.py`**
Entry point. Creates the FastAPI app, configures CORS (allows all origins so the
React frontend can call it), and registers the chat router.

**`core/config.py`**
Reads the `.env` file and exposes two required settings: `MONGO_URI` (connection string
to MongoDB) and `GEMINI_API_KEY` (Google AI key for the LLM). Uses Pydantic Settings.

**`core/database.py`**
Creates the async MongoDB client using Motor and points it at `Meetra_database` — the same
database the Node.js backend writes to. All tools share this single connection.

**`graph/state.py`**
Defines `ChatState` — the shape of data that flows through the LangGraph graph.
Contains `messages` (full conversation history), `workspace_id`, and `user_id`.
The `messages` field uses `add_messages` reducer so messages accumulate correctly.

**`graph/builder.py`**
Assembles the LangGraph graph. Wires up the agent node and tools node, sets the entry
point, and adds the conditional edge that decides: "does the agent want to call a tool?
If yes → go to tools node, then back to agent. If no → end."

**`graph/nodes.py`**
Initialises the Gemini 2.5 Flash LLM and binds all 6 tools to it. Contains the detailed
system prompt that tells the AI what each tool does and how to behave. The `agent_node`
function runs on every agent turn — it prepends the system prompt and calls the LLM.

**`tools/meeting_tools.py`**
The 6 LangChain `@tool` functions. Each one:
- Receives `workspace_id` automatically injected from graph state (not from the LLM)
- Calls the corresponding service function
- Formats the result as a readable string the LLM can understand

| Tool | What it returns |
|---|---|
| `get_meetings` | All meetings with summary, decisions, actions, sentiment, health |
| `get_action_items` | Pending tasks grouped by meeting |
| `search_meetings` | Meetings matching a keyword |
| `get_meeting_details` | Full details + participant names + transcript |
| `get_upcoming_meetings` | Future scheduled meetings + participant names |
| `get_workspace_stats` | Totals, status/sentiment breakdown, avg health score |

**`services/meeting_service.py`**
Pure database query functions. Each function talks directly to MongoDB and returns raw
data. No formatting here — that's the tool layer's job. Also contains `resolve_user_names`
which does a bulk lookup converting ObjectIds to real user names.

**`api/routes/chat.py`**
The two HTTP endpoints:
- `POST /chat` — loads session history, runs the graph, saves updated history, returns reply
- `POST /chat/clear` — deletes the session so the conversation resets

Session memory is a plain Python dict in memory (`_sessions`). Each key is
`"{user_id}:{workspace_id}"` so different users and workspaces have completely separate
conversations. **Note:** history is lost if the server restarts (step 4 would persist it to MongoDB).

---

## Frontend Integration

Three files were touched or created:

**`Frontend/src/services/chatService.js`** *(new)*
Thin Axios wrapper. Two functions:
- `sendChatMessage({ workspaceId, userId, message })` → calls `POST /chat`, returns the reply string
- `clearChatSession({ workspaceId, userId })` → calls `POST /chat/clear`

Reads `VITE_CHATBOT_URL` from env (defaults to `http://localhost:8000`).

**`Frontend/src/components/dashboard/ChatWidget.jsx`** *(new)*
The full chat UI. A floating button (bottom-right) that expands into a 360×540 panel.
Internally uses `useAuth()` for the user ID and `useWorkspaces()` for the workspace list.
Key behaviour:
- Auto-selects the first workspace on load
- Switching workspace clears the conversation
- Enter sends, Shift+Enter adds a new line
- Shows a typing indicator while waiting
- Trash button clears history on both frontend and backend

Matches the Meetra dark design system exactly (same colours, fonts, border styles).

**`Frontend/src/pages/Dashboard.jsx`** *(modified)*
Two lines added:
1. `import ChatWidget from '../components/dashboard/ChatWidget'`
2. `<ChatWidget />` placed just before the meeting modals — renders globally over the dashboard

---

## Main Backend (Node.js) — Changes Made

**None.** The `Backend/` folder (Express + Node.js) was not touched.
The chatbot reads from the same MongoDB database but does not modify any data.
It is a completely separate process.

---

## How to Run

**1. Start the chatbot server**
```bash
cd "Chat_Bot LangGraph"
uvicorn app.main:app --reload --port 8000
```

**Required `.env` file** inside `Chat_Bot LangGraph/`:
```
MONGO_URI=mongodb://localhost:27017
GEMINI_API_KEY=your_google_ai_key_here
```

**2. Start the main backend**
```bash
cd Backend
npm start
```

**3. Start the frontend**
```bash
cd Frontend
npm run dev
```

**4. Use it**
- Login → Dashboard
- Click the purple floating button (bottom-right)
- Select a workspace
- Ask anything about your meetings
