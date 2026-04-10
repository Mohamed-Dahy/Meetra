# Meetra — AI Context Document

## Project Overview
**Project Name:** Meetra  
**Type:** AI-powered Meeting Intelligence SaaS  
**Stack:** MERN (MongoDB, Express.js, React, Node.js) + Python microservice  
**Architecture:** Microservices  

**Backend Base URL:** http://localhost:5000  
**Route Prefix:** /meetra  
**Chatbot Base URL:** http://localhost:8000  

---

## ✅ Completed Backend Features

### 🔐 Auth Service (`/meetra/auth`)
- Register & login with JWT authentication  
- Password hashing using `bcryptjs`  
- User model includes:
  - name, email, password
  - dateOfBirth, gender, bio, interests
  - meetings, connections, sentRequests, receivedRequests  

---

### 📅 Meeting Service (`/meetra/meeting`)
- Full CRUD operations for meetings  
- Meeting fields:
  - title, description, date, time, location
  - workspace (ref), createdBy (ref), updatedBy (ref)
  - participants (array of User ObjectIds)
  - status: `upcoming` | `processing` | `completed` | `canceled`
  - transcript, summary, actionItems, keyDecisions
  - sentiment: `positive` | `neutral` | `negative`
  - healthScore (0–100)

- Rules:
  - Only authenticated users can create meetings  
  - Minimum 2 participants required  
  - Meetings are scoped to a workspace  
  - Email notifications sent via **Resend** on: create, update, delete  

---

### 🎙️ Transcription & AI Analysis Service (`/api/transcription`)

**Audio transcription** (`POST /api/transcription/audio`):
- Audio upload via `Multer`  
- Sends audio directly to **Gemini 2.5 Flash** (inline base64)  
- Returns speaker-labelled transcript  
- Saves transcript to meeting in MongoDB  
- Updates meeting status to `processing` → `completed`  
- Permission: workspace owner or meeting creator only  

**Text transcription** (`POST /api/transcription/text`):
- Accepts plain text transcript input  
- Saves directly to meeting without AI processing  
- Same permission rules as audio  

**AI Analysis** (`POST /api/transcription/analyze`):
- Requires an existing transcript on the meeting  
- Sends transcript to **Gemini 2.5 Flash** with structured prompt  
- Returns and saves:
  - `summary` — 2–3 sentence meeting summary  
  - `actionItems` — array of specific tasks  
  - `keyDecisions` — array of decisions made  
  - `sentiment` — positive / neutral / negative  
  - `healthScore` — integer 0–100 (meeting productivity rating)  

---

### 📄 Export Service (`/api/export`)
- Generates downloadable PDF reports using `PDFKit`  
- Includes: meeting title, date, time, location, participants  
- Includes: transcript (or "no transcript" notice)  
- Includes: summary, action items, key decisions, sentiment, health score  
- Meetra branded header (`#6366f1` accent)  
- Permission: workspace owner, meeting creator, or participant  
- PDF saved to `Backend/pdfs/` and served statically  

---

### 🤝 Connection System (`/meetra/connections`)
- Send / accept / reject connection requests  
- Remove existing connections  
- Fetch: my connections, received requests, sent requests  
- Stored in User model: `connections[]`, `sentRequests[]`, `receivedRequests[]`  

---

### 🏢 Workspace System (`/meetra/workspaces`)
- Create workspaces with: name, description, avatar  
- Member roles: `owner` | `admin` | `member`  
- Invite connections only (not arbitrary users)  
- Remove members, leave workspace (owner cannot leave)  
- Role-based access control  
- Full CRUD support  

---

## 🤖 AI Chatbot Microservice (Python / LangGraph)

A standalone Python FastAPI service on port **8000** — reads the same MongoDB as the Node.js backend.

### Tools available to the LLM (Gemini 2.5 Flash)

| Tool | What it returns |
|---|---|
| `get_meetings` | All meetings in workspace with summary, decisions, actions, sentiment, health |
| `get_action_items` | Pending tasks grouped by meeting |
| `search_meetings(query)` | Meetings matching a keyword |
| `get_meeting_details(meeting_id)` | Full details + participant names + transcript |
| `get_upcoming_meetings` | Future scheduled meetings + participant names |
| `get_workspace_stats` | Totals, status/sentiment breakdown, avg health score |

### Architecture
```
Browser (ChatWidget)
        │  HTTP POST /chat
        ▼
  FastAPI server (port 8000)
        │
        ▼
  api/routes/chat.py  ──── session memory (in-memory dict per user+workspace)
        │
        ▼
  LangGraph (graph/builder.py)
        │
        ├──► agent node  →  Gemini 2.5 Flash + system prompt
        └──► tools node  →  tools/meeting_tools.py
                               └── services/meeting_service.py → MongoDB
```

### Key behaviours
- `workspace_id` injected automatically from graph state — LLM never guesses it  
- Conversation memory persisted per `user_id:workspace_id` session (lost on restart)  
- `POST /chat` — send a message, get a reply  
- `POST /chat/clear` — reset conversation history for a session  

---

## 🎨 Completed Frontend Features

### 🏠 Landing Page (`/`)
- Dark SaaS UI built with React + Tailwind CSS + Framer Motion  
- Sections: Navbar, Hero (floating dashboard mockup), Features, How it works, Stats, Pricing, CTA, Footer  
- Fonts: Sora (headings), DM Sans (body)  

---

### 🔑 Auth Page (`/auth`)
- Two-panel layout: branding + floating cards (left) | login/register form (right)  
- Toggle between sign in / create account  
- Full validation & error handling  
- JWT stored in `localStorage` as `meetra_token`  
- Endpoints: `/meetra/auth/login`, `/meetra/auth/register`  

---

### 📊 Dashboard (`/dashboard`) — Protected route
Fixed sidebar with tabs:
- **Overview** — real backend stats, recent meetings, pending actions, upload zone  
- **Meetings** — view, create, edit, delete with Framer Motion modals  
- **Analytics** — AI-generated insights per meeting  
- **Action Items** — pending tasks across all meetings  
- **Connections** — manage connections and requests  
- **Team / Workspaces** — workspace management  

**Modals:**
- `CreateMeetingModal` — create a new meeting  
- `EditMeetingModal` — edit meeting details  
- `DeleteConfirmModal` — confirm deletion  
- `TranscribeModal` — upload audio or paste text transcript, trigger AI analysis  

**Workspace modals:**
- `CreateWorkspaceModal`, `EditWorkspaceModal`, `DeleteWorkspaceModal`, `InviteMemberModal`  

**ChatWidget** (floating, bottom-right):
- Expands to a 360×540 chat panel  
- Workspace dropdown auto-selects first workspace on load  
- Switching workspace clears the conversation  
- Enter sends, Shift+Enter newline  
- Typing indicator while waiting for response  
- Trash button clears history on frontend + backend  
- Connects to chatbot server via `VITE_CHATBOT_URL` env var  

---

## 🎨 Design System

| Element    | Value |
|------------|-------|
| Background | `#04040c` |
| Card       | `#08080f` |
| Accent     | `#6366f1` |
| Accent 2   | `#8b5cf6` |
| Text       | `#f1f5f9` |
| Muted      | `#475569` |
| Muted 2    | `#94a3b8` |
| Border     | `rgba(99,102,241,0.14)` |

**Fonts:** Sora (headings) · DM Sans (body)  

---

## 🗂️ Project Structure

```
Meetra/
├── Backend/                    # Node.js / Express
│   ├── config/                 # db.js, email.js (Resend), gemini.js
│   ├── Controllers/            # auth, connection, exportPDF, meeting, transcription, workspace
│   ├── middleware/             # authMiddleware.js (JWT)
│   ├── Models/                 # userModel, meetingModel, workspaceModel
│   ├── Routes/                 # one file per controller
│   └── server.js
│
├── Frontend/                   # React + Vite
│   └── src/
│       ├── components/
│       │   ├── dashboard/      # OverviewTab, MeetingsTab, AnalyticsTab, ConnectionsTab, WorkspacesTab, ChatWidget
│       │   ├── meetings/       # CreateMeetingModal, EditMeetingModal, DeleteConfirmModal, TranscribeModal
│       │   └── workspaces/     # CreateWorkspaceModal, EditWorkspaceModal, DeleteWorkspaceModal, InviteMemberModal
│       ├── context/            # AuthContext
│       ├── hooks/              # useAuth, useConnections, useMeetings, useWorkspaces
│       ├── pages/              # LandingPage, MeetraAuthPage, Dashboard
│       └── services/           # api, chatService, connectionService, meetingService, transcriptionService, workspaceService
│
└── Chat_Bot LangGraph/         # Python FastAPI + LangGraph
    └── app/
        ├── api/routes/chat.py  # POST /chat, POST /chat/clear
        ├── core/               # config.py (env), database.py (Motor/MongoDB)
        ├── graph/              # state.py, builder.py, nodes.py
        ├── services/           # meeting_service.py
        └── tools/              # meeting_tools.py (6 LangChain tools)
```

---

## 🚀 How to Run

**1. Chatbot microservice**
```bash
cd "Chat_Bot LangGraph"
uvicorn app.main:app --reload --port 8000
```
Required `.env`:
```
MONGO_URI=mongodb://localhost:27017
GEMINI_API_KEY=your_google_ai_key_here
```

**2. Main backend**
```bash
cd Backend
npm start
```

**3. Frontend**
```bash
cd Frontend
npm run dev
```
