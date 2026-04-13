# Meetra — AI-Powered Meeting Intelligence SaaS

> Convert meeting audio into structured business intelligence — transcripts, action items, key decisions, sentiment analysis, and a conversational AI assistant — all in one platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion, Lucide |
| Backend | Node.js, Express 5, Mongoose, Multer, PDFKit |
| Chatbot | Python 3.12, FastAPI, LangGraph, Motor |
| AI | Google Gemini 2.5 Flash (transcription + analysis + chat) |
| Database | MongoDB Atlas (shared by all services) |
| Cache / Sessions | Redis 7 (AOF persistence) |
| Auth | JWT (HS256), bcryptjs |
| Email | Resend |
| Containerisation | Docker Compose — 4 services (frontend, backend, chatbot, redis) |

---

## Architecture

```
Browser (React SPA)
  │
  ├── REST calls  ──► Node.js / Express  (:5000)
  │                       │
  │                       ├── MongoDB Atlas  (meetings, users, workspaces)
  │                       ├── Gemini 2.5 Flash  (transcription + AI analysis)
  │                       ├── Resend  (email notifications)
  │                       └── PDFKit  (report generation → /pdfs)
  │
  └── Chat calls  ──► Python FastAPI + LangGraph  (:8000)
                          │
                          ├── MongoDB Atlas  (meetings read-only)
                          ├── Gemini 2.5 Flash  (LLM responses)
                          └── Redis  (session persistence + rate limiting)
```

### Request flow
- All backend routes are versioned: `/meetra/v1/*` (legacy `/meetra/*` kept for compat)
- JWT issued by backend; verified by both backend middleware and chatbot's `get_current_user`
- `workspace_id` is injected server-side into every chatbot request — the LLM never guesses it

---

## Services

### Frontend (`Frontend/` — port 5173 dev / 80 Docker)
- Single-page app with protected `/dashboard` route
- **Tabs:** Overview, Meetings, Analytics, Action Items, Connections, Team, Workspaces
- **ChatWidget:** floating panel backed by the Python chatbot, scoped per workspace; messages persisted to `localStorage` keyed by `userId:workspaceId`
- **Global search** auto-switches to Meetings tab and forwards query as prop
- **Bell notifications** — dropdown listing upcoming meetings
- **Analytics tab** — "All time / 90d / 30d / 7d" filter pills; all stats recomputed client-side
- **Error Boundaries** wrap each tab — one crashed tab never takes down the whole dashboard
- Auth: JWT stored in `localStorage` as `meetra_token`; 401 responses clear auth and redirect to `/auth`

### Backend (`Backend/` — port 5000)
Entry: `server.js`

| Route group | Purpose |
|---|---|
| `/meetra/v1/auth` | Register, login, profile, change password, user search |
| `/meetra/v1/meeting` | CRUD + status lifecycle (upcoming → processing → completed/canceled) |
| `/meetra/v1/api/transcription` | Multer audio upload → Gemini 2.5 Flash → speaker transcript + AI analysis |
| `/meetra/v1/api/export` | PDFKit meeting report → saved to `Backend/pdfs/` |
| `/meetra/v1/connections` | Send / accept / reject connection requests |
| `/meetra/v1/workspaces` | CRUD with owner / admin / member RBAC |
| `GET /meetra/health` | Health check (Docker, UptimeRobot) |

**Security & observability:**
- `express-rate-limit` on auth endpoints (10 attempts / 15 min)
- `express.json({ limit: '10kb' })` payload cap
- `validateObjectId` middleware on all `:id` params
- Structured JSON logging in production via `utils/logger.js`; coloured dev output otherwise
- Global error handler with `logger.error` output

### Chatbot (`Chat_Bot LangGraph/` — port 8000)
LangGraph agent graph: `agent → tools → agent → … → END`

**6 tools:**

| Tool | What it does |
|---|---|
| `get_meetings` | Lists all workspace meetings with status, sentiment, health, action items |
| `get_action_items` | Returns all meetings that have pending action items |
| `search_meetings` | `$text` search on title/description/summary with relevance ranking |
| `get_meeting_details` | Full details including transcript and named participants |
| `get_upcoming_meetings` | Upcoming meetings sorted by date with resolved participant names |
| `get_workspace_stats` | Aggregate stats via `$facet/$group` pipeline (single DB round-trip) |

**Production hardening:**
- Gemini API calls wrapped with **tenacity** — 3 attempts, exponential back-off 2–10s
- **Sliding window:** last 20 messages passed to LLM; full history persisted in Redis
- **Rate limiter:** 20 req/min per user via Redis sorted-set atomic pipeline (multi-instance safe)
- **Redis sessions:** JSON string per `session:{userId}:{workspaceId}`, 7-day TTL reset on every write
- MongoDB compound **text index** created at startup (`title + description + summary`)
- `GET /health` endpoint for Docker healthcheck

---

## Docker Setup

```bash
# First time
cp .env.example .env        # fill in secrets
docker compose up --build

# Subsequent starts
docker compose up

# Stop (keep volumes)
docker compose down

# Stop + wipe uploaded files, PDFs, Redis sessions
docker compose down -v
```

**Services after `docker compose up`:**

| Service | URL |
|---|---|
| Frontend (Nginx SPA) | http://localhost |
| Backend (Express API) | http://localhost:5000 |
| Chatbot (FastAPI) | http://localhost:8000 |
| Redis | localhost:6379 |

**Volumes:**

| Volume | Contents |
|---|---|
| `uploads_data` | Audio files uploaded for transcription |
| `pdfs_data` | Generated PDF meeting reports |
| `redis_data` | Redis AOF file — chatbot sessions survive restarts |

Health checks are configured on all 4 services. `docker compose ps` shows `(healthy)` when ready.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | Backend, Chatbot | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Backend, Chatbot | Google Gemini 2.5 Flash |
| `JWT_SECRET` | Backend, Chatbot | JWT signing secret |
| `PORT` | Backend | API port (default 5000) |
| `RESEND_API_KEY` | Backend | Transactional email |
| `EMAIL_FROM` | Backend | Sender address |
| `ALLOWED_ORIGINS` | Backend, Chatbot | Comma-separated allowed CORS origins |
| `REDIS_URI` | Chatbot | `redis://redis:6379/0` (Docker) · `redis://localhost:6379/0` (local dev) |

---

## Free Deployment

| Service | Host | Cost |
|---|---|---|
| Frontend | Vercel (Vite auto-detected, global CDN) | $0 |
| Backend | Render Web Service (Node) | $0 |
| Chatbot | Render Web Service (Python) | $0 |
| Database | MongoDB Atlas M0 | $0 |
| Email | Resend (3 000 emails/mo free) | $0 |
| Uptime pings | UptimeRobot (keeps Render awake) | $0 |
| **Total** | | **$0/month** |

**VITE env vars are baked at build time** — set `VITE_API_BASE_URL` and `VITE_CHATBOT_URL` in Vercel's environment settings before the first build.

See `deployment_plan.md` for the full step-by-step guide.

---

## Inspecting Redis Sessions

```bash
# Connect to Redis inside the container
docker exec -it meetra-redis-1 redis-cli

KEYS session:*                                    # all active sessions
GET session:<user_id>:<workspace_id>              # read a session
TTL session:<user_id>:<workspace_id>              # seconds until expiry
MONITOR                                           # watch live commands
```

---

## Dev Commands

```bash
# Install all deps
npm run install:all

# Start backend + frontend concurrently (no Docker)
npm run dev

# Backend only
cd Backend && npm start

# Frontend only
cd Frontend && npm run dev

# Chatbot only (activate venv first)
cd "Chat_Bot LangGraph"
uvicorn app.main:app --reload --port 8000
```
