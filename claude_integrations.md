You are working on a SaaS app called Meetra. Your job is to 
fully integrate the existing backend services with the 
existing frontend. Remove ALL hardcoded/example data and 
replace with real API calls. Do not change any design, CSS, 
or visual styling.

================================================================
BACKEND INFORMATION
================================================================

Base URL: http://localhost:5000
All protected routes need: Authorization: Bearer <token>
Token stored in: localStorage key "meetra_token"
User stored in:  localStorage key "meetra_user"

API instance already exists at: src/services/api.js
It automatically attaches JWT to every request.
ALWAYS import and use this api instance — never use raw axios.

----------------------------------------------------------------
BACKEND ROUTES
----------------------------------------------------------------

AUTH — /meetra/auth
  POST /meetra/auth/login
  POST /meetra/auth/register
  GET  /meetra/auth/users          → get all users

MEETINGS — /meetra/meeting
  GET    /meetra/meeting/get-meetings     → get all meetings
  POST   /meetra/meeting/create          → create meeting
  GET    /meetra/meeting/get-meeting/:id → get one meeting
  PUT    /meetra/meeting/update/:id      → update meeting
  DELETE /meetra/meeting/delete/:id      → delete meeting

CONNECTIONS — /meetra/connections
  POST   /meetra/connections/request/:userId  → send request
  PUT    /meetra/connections/accept/:userId   → accept request
  PUT    /meetra/connections/reject/:userId   → reject request
  DELETE /meetra/connections/remove/:userId   → remove connection
  GET    /meetra/connections                  → get my connections
  GET    /meetra/connections/requests         → get received requests
  GET    /meetra/connections/sent             → get sent requests

WORKSPACES — /meetra/workspaces
  POST   /meetra/workspaces                        → create workspace
  GET    /meetra/workspaces                        → get my workspaces
  GET    /meetra/workspaces/:id                    → get one workspace
  PUT    /meetra/workspaces/:id                    → update workspace
  DELETE /meetra/workspaces/:id                    → delete workspace
  POST   /meetra/workspaces/:id/invite             → invite member
  DELETE /meetra/workspaces/:id/members/:userId    → remove member
  PUT    /meetra/workspaces/:id/leave              → leave workspace
  GET    /meetra/workspaces/:id/members            → get members

TRANSCRIPTION — /api/transcription
  POST /api/transcription/audio   → upload audio file (multipart)
  POST /api/transcription/text    → paste text transcript

EXPORT — /api/export
  POST /api/export/export-pdf     → generate PDF report

----------------------------------------------------------------
BACKEND RESPONSE FORMAT
----------------------------------------------------------------

Success: { message: "...", data } or { meetings: [...] }
Error:   { message: "error description" }

Meeting object fields:
  _id, title, description, date, time, location,
  participants (array of User ObjectIds or populated users),
  createdBy, status, createdAt

Connection response from GET /meetra/connections:
  { connections: [{ _id, name, email, bio }] }

Received requests from GET /meetra/connections/requests:
  { requests: [{ _id, name, email, bio }] }

Workspace object fields:
  _id, name, description, avatar, owner, members
  members: [{ userId: { _id, name, email }, role, joinedAt }]

================================================================
FRONTEND INFORMATION
================================================================

Framework: React + Vite
Styling: Tailwind + inline CSS (DO NOT CHANGE ANY STYLES)
Animations: Framer Motion
Router: React Router v6

Design system variables (DO NOT CHANGE):
  --bg: #04040c | --bg-card: #08080f
  --accent: #6366f1 | --accent2: #8b5cf6
  --text: #f1f5f9 | --muted: #475569 | --muted2: #94a3b8
  --sora: Sora font | --dm: DM Sans font

Existing hooks:
  src/hooks/useAuth.js     → { user, login, logout }
  src/hooks/useMeetings.js → { meetings, loading, error,
                               createMeeting, updateMeeting,
                               deleteMeeting, fetchMeetings }

Existing services:
  src/services/api.js          → axios instance with JWT
  src/services/meetingService.js → meeting API functions

Existing pages:
  src/pages/LandingPage.jsx  → landing page (no changes needed)
  src/pages/Dashboard.jsx    → main dashboard
  src/auth/MeetraAuthPage.jsx → login/register

Existing meeting components:
  src/components/meetings/CreateMeetingModal.jsx
  src/components/meetings/EditMeetingModal.jsx
  src/components/meetings/DeleteConfirmModal.jsx

================================================================
WHAT TO BUILD
================================================================

----------------------------------------------------------------
1. CONNECTION SERVICE (src/services/connectionService.js)
----------------------------------------------------------------
Create these functions using api.js:
  sendRequest(userId)       → POST /meetra/connections/request/:userId
  acceptRequest(userId)     → PUT  /meetra/connections/accept/:userId
  rejectRequest(userId)     → PUT  /meetra/connections/reject/:userId
  removeConnection(userId)  → DELETE /meetra/connections/remove/:userId
  getMyConnections()        → GET /meetra/connections
  getReceivedRequests()     → GET /meetra/connections/requests
  getSentRequests()         → GET /meetra/connections/sent

----------------------------------------------------------------
2. WORKSPACE SERVICE (src/services/workspaceService.js)
----------------------------------------------------------------
Create these functions using api.js:
  getMyWorkspaces()              → GET /meetra/workspaces
  createWorkspace(data)          → POST /meetra/workspaces
  getWorkspaceById(id)           → GET /meetra/workspaces/:id
  updateWorkspace(id, data)      → PUT /meetra/workspaces/:id
  deleteWorkspace(id)            → DELETE /meetra/workspaces/:id
  inviteMember(workspaceId, userId) → POST /meetra/workspaces/:id/invite
  removeMember(workspaceId, userId) → DELETE /meetra/workspaces/:id/members/:userId
  leaveWorkspace(id)             → PUT /meetra/workspaces/:id/leave
  getWorkspaceMembers(id)        → GET /meetra/workspaces/:id/members

----------------------------------------------------------------
3. CONNECTIONS HOOK (src/hooks/useConnections.js)
----------------------------------------------------------------
Custom hook that exposes:
  connections       → accepted connections array
  receivedRequests  → pending received requests array
  sentRequests      → sent requests array
  loading           → boolean
  error             → string or null
  sendRequest(userId)
  acceptRequest(userId)
  rejectRequest(userId)
  removeConnection(userId)
  fetchAll()        → fetches connections + requests + sent

Call fetchAll() on mount automatically.
After any action (send/accept/reject/remove) refetch all data.

----------------------------------------------------------------
4. WORKSPACES HOOK (src/hooks/useWorkspaces.js)
----------------------------------------------------------------
Custom hook that exposes:
  workspaces        → array of user's workspaces
  loading           → boolean
  error             → string or null
  createWorkspace(data)
  updateWorkspace(id, data)
  deleteWorkspace(id)
  inviteMember(workspaceId, userId)
  removeMember(workspaceId, userId)
  leaveWorkspace(id)
  fetchWorkspaces() → refetch workspaces

Call fetchWorkspaces() on mount automatically.

----------------------------------------------------------------
5. UPDATE Dashboard.jsx
----------------------------------------------------------------

OVERVIEW TAB:
  - Stats cards: use real meetings data from useMeetings hook
    Total Meetings, Completed, Processing, Pending — real counts
  - Recent Meetings: real meetings from useMeetings (slice 0-4)
  - Remove hardcoded ACTIONS array
  - Pending Actions: show message "Coming soon — connect 
    Analysis Service" as a placeholder card
  - Upload zone: clicking "New Meeting" opens CreateMeetingModal

MEETINGS TAB:
  - Already connected — verify it uses useMeetings hook
  - Show real meetings from backend
  - Loading skeletons while fetching
  - Empty state when no meetings

NEW TAB — CONNECTIONS (add to sidebar NAV array):
  { id:"connections", label:"Connections", icon:<UserPlus size={16}/> }

  CONNECTIONS TAB layout:
  Three sections side by side on desktop, stacked on mobile:

  Section 1 — My Connections
    Header: "Connections" + count badge
    List of connected users with name, email, avatar initials
    Each row has a "Remove" button (trash icon, red on hover)
    Empty state: "No connections yet"

  Section 2 — Received Requests  
    Header: "Requests" + count badge (highlighted if > 0)
    List of pending received requests with name, email
    Each row has Accept (green checkmark) and Reject (red X) buttons
    Empty state: "No pending requests"

  Section 3 — Find & Add
    Search input to filter users from GET /meetra/auth/users
    Show all users except current user and existing connections
    Each user row has "Connect" button
    If request already sent: show "Pending" badge instead
    If already connected: show "Connected" badge

NEW TAB — WORKSPACES (add to sidebar NAV array):
  { id:"workspaces", label:"Workspaces", icon:<Layout size={16}/> }

  WORKSPACES TAB layout:

  Header row:
    "Workspaces" title + subtitle
    "New Workspace" button (opens CreateWorkspaceModal)

  Workspace cards grid (2 columns):
    Each card shows:
      - Avatar emoji (large, colored background)
      - Workspace name (bold)
      - Description (muted, truncated)
      - Member count badge
      - Owner name
      - Role badge (owner/admin/member)
      - Three buttons: View, Edit (if owner/admin), Leave/Delete
    Hover effect: border glow matching design system

  When clicking View workspace:
    Show workspace detail view with:
      - Workspace info header
      - Members list with roles
      - Invite member button (opens invite modal, 
        shows connections to invite)
      - Back button to return to workspaces list

ANALYTICS TAB: keep existing "coming soon" placeholder
TEAM TAB: keep existing "coming soon" placeholder

----------------------------------------------------------------
6. NEW MODALS TO CREATE
----------------------------------------------------------------

CreateWorkspaceModal (src/components/workspaces/CreateWorkspaceModal.jsx):
  Fields: name (required), description (optional), avatar emoji picker
  Emoji options: 🏢 💼 🚀 🎯 📊 🔬 🎨 💡 ⚡ 🌍
  Submit calls createWorkspace from useWorkspaces hook
  Same dark modal design as CreateMeetingModal

EditWorkspaceModal (src/components/workspaces/EditWorkspaceModal.jsx):
  Same fields as create, pre-filled with existing data
  Only visible to owner or admin

DeleteWorkspaceModal (src/components/workspaces/DeleteWorkspaceModal.jsx):
  Same red confirmation style as DeleteConfirmModal
  Only owner can delete

InviteMemberModal (src/components/workspaces/InviteMemberModal.jsx):
  Shows list of current user's connections NOT already in workspace
  Checkbox selection (single select)
  Submit calls inviteMember from useWorkspaces hook

================================================================
STRICT RULES — MUST FOLLOW
================================================================

1. NEVER change any CSS variable, color, font, or animation
2. NEVER change LandingPage.jsx or MeetraAuthPage.jsx
3. ALWAYS use src/services/api.js for HTTP calls — never raw axios
4. ALWAYS wrap API calls in try/catch with proper error handling
5. ALWAYS show loading states (skeleton or spinner)
6. ALWAYS show empty states with helpful message + action button
7. ALWAYS use AnimatePresence from framer-motion for modals
8. ALWAYS use the existing CSS classes from Dashboard STYLES
9. Error messages must use the existing .err-box style
10. All new components must match the dark design system exactly
11. All new sidebar items must follow existing .nav-item style
12. Import lucide-react icons: UserPlus and Layout for new tabs
13. After any CRUD operation always refetch the relevant data
14. Never show loading state longer than necessary
15. Console.error all API errors for debugging