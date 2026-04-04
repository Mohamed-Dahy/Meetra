# Meetra — AI Context Document

## Project Overview
**Project Name:** Meetra  
**Type:** AI-powered Meeting Intelligence SaaS  
**Stack:** MERN (MongoDB, Express.js, React, Node.js)  
**Architecture:** Microservices  

**Backend Base URL:** http://localhost:5000  
**Route Prefix:** /meetra  

---

## ✅ Completed Backend Features

### 🔐 Auth Service (`/meetra/auth`)
- Register & login with JWT authentication  
- Password hashing using `bcryptjs`  
- User model includes:
  - name
  - email
  - password
  - dateOfBirth
  - gender
  - bio
  - interests
  - meetings
  - connections
  - sentRequests
  - receivedRequests  

---

### 📅 Meeting Service (`/meetra/meeting`)
- Full CRUD operations for meetings  
- Meeting fields:
  - title
  - description
  - date
  - time
  - location
  - participants (array of User ObjectIds)
  - createdBy
  - status  

- Rules:
  - Only authenticated users can create meetings  
  - Minimum 2 participants required  
  - Email notifications sent via **Resend** on:
    - create
    - update
    - delete  

---

### 🎙️ Transcription Service (`/api/transcription`)
- Audio upload using `Multer`  
- Sends audio to **Groq Whisper API**  
- Returns transcript  
- Supports plain text transcript input  
- Updates meeting status  
- Saves transcript in MongoDB  

---

### 📄 Export Service (`/api/export`)
- Generates downloadable PDF reports using `PDFKit`  
- Includes:
  - meeting title
  - date
  - summary
  - action items
  - key decisions
  - sentiment
  - health score
  - Meetra branding  

---

### 🤝 Connection System (`/meetra/connections`)
- Send / accept / reject connection requests  
- Remove connections  
- Fetch:
  - my connections
  - received requests
  - sent requests  

- Stored in User model:
  - connections[]
  - sentRequests[]
  - receivedRequests[]  

---

### 🏢 Workspace System (`/meetra/workspaces`)
- Create workspaces with:
  - name
  - description
  - avatar
  - owner
  - members (roles: owner/admin/member)

- Features:
  - Invite connections only  
  - Remove members  
  - Leave workspace (owner cannot leave)  
  - Role-based access control  
  - Full CRUD support  

---

## 🎨 Completed Frontend Features

### 🏠 Landing Page (`/`)
- Dark SaaS UI  
- Sections:
  - Navbar  
  - Hero (floating dashboard mockup)  
  - Features  
  - How it works  
  - Stats  
  - Pricing  
  - CTA banner  
  - Footer  

- Built with:
  - React
  - Tailwind CSS
  - Framer Motion  

- Fonts:
  - Sora (headings)
  - DM Sans (body)  

---

### 🔑 Auth Page (`/auth`)
- Two-panel layout:
  - Left → branding + floating cards  
  - Right → login/register form  

- Features:
  - Toggle between sign in / create account  
  - Full validation & error handling  
  - JWT stored in `localStorage` as `meetra_token`  

- Connected endpoints:
  - `/meetra/auth/login`
  - `/meetra/auth/register`

---

### 📊 Dashboard (`/dashboard`)
- Fixed sidebar with sections:
  - Overview
  - Meetings
  - Action Items
  - Analytics
  - Team  

- Sticky topbar:
  - User greeting
  - Avatar  

- Features:
  - Real backend stats  
  - Recent meetings  
  - Pending actions  
  - Upload zone  

- Meetings section:
  - View, create, edit, delete  
  - Modals using `Framer Motion AnimatePresence`  

---

## 🎨 Design System

| Element        | Value |
|----------------|------|
| Background     | `#04040c` |
| Card           | `#08080f` |
| Accent         | `#6366f1` |
| Accent 2       | `#8b5cf6` |
| Text           | `#f1f5f9` |
| Muted          | `#475569` |
| Muted 2        | `#94a3b8` |
| Border         | `rgba(99,102,241,0.14)` |

**Fonts:**
- Heading → Sora  
- Body → DM Sans  

---

## ⚠️ Important Rules For AI

1. Use **CommonJS** (`require/module.exports`) in backend  
2. Protect all backend routes using `{ protect }` middleware  
3. All frontend API calls use `api.js` (auto-attaches JWT)  
4. JWT stored in `localStorage` as `meetra_token`  
5. User stored in `localStorage` as `meetra_user`  
6. Do NOT modify existing CSS variables or design system  
7. Do NOT change sidebar, topbar, or dashboard structure  
8. Maintain dark SaaS design aesthetic  
9. Error responses format:
   ```json
   { "message": "..." }