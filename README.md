# Tenaciti — AI-Assisted Study Companion

> **Academic Roadmap, Notes & Progress Tracker** — An AI-powered study app that extracts roadmaps from syllabi, tracks topic completion with confidence ratings, and builds a connected knowledge graph from markdown notes.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Core Features](#-core-features)
5. [Data Model](#-data-model)
6. [Authentication & Authorization](#-authentication--authorization)
7. [AI Extraction Pipeline](#-ai-extraction-pipeline)
8. [API Endpoints](#-api-endpoints)
9. [Frontend Architecture](#-frontend-architecture)
10. [Getting Started](#-getting-started)
11. [Environment Configuration](#-environment-configuration)
12. [Development Workflow](#-development-workflow)
13. [Deployment](#-deployment)
14. [Roadmap](#-roadmap)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TENACITI ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   FRONTEND   │◄───►│    BACKEND   │◄───►│   DATABASE   │                 │
│  │  (React 19)  │     │  (FastAPI)   │     │ (PostgreSQL) │                 │
│  │  + Vite      │     │  + SQLAlchemy│     │  (Supabase)  │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│         │                     │                     │                        │
│         │                     ▼                     │                        │
│         │            ┌──────────────┐               │                        │
│         │            │   AI SERVICE │               │                        │
│         └───────────►│    (Groq)    │◄──────────────┘                        │
│                      └──────────────┘                                        │
│                              │                                               │
│                              ▼                                               │
│                     ┌──────────────┐                                         │
│                     │  STORAGE     │                                         │
│                     │ (Cloudflare R2)                                        │
│                     └──────────────┘                                         │
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   AUTH       │     │   BILLING    │     │   REALTIME   │                 │
│  │  (Supabase   │     │ (LemonSqueezy)│     │ (Supabase    │                 │
│  │   Auth)      │     │              │     │  Realtime)   │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Design Principles:**
- **Hybrid Auth**: Supabase Auth (Google OAuth) + Custom JWT (email/password)
- **Tier-gated Features**: Free vs Pro limits enforced at API layer
- **Async AI Processing**: Document extraction runs in background with polling
- **Knowledge Graph**: Wikilinks (`[[Note Title]]`) auto-create bi-directional links
- **Self-Assessment Loop**: Submit → Rate → Reflect → Analyze gaps

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | 19.2 / 8.1 |
| **Routing** | React Router | 7.18 |
| **State** | React Context + Hooks | — |
| **Drag & Drop** | @dnd-kit | 6.3 |
| **Graph Viz** | react-force-graph-2d | 1.29 |
| **Markdown** | Custom (textarea + preview) | — |
| **Backend** | FastAPI | Latest |
| **ORM** | SQLAlchemy (Async) | 2.0 |
| **Migrations** | Alembic | Latest |
| **Auth** | Supabase Auth + Custom JWT | — |
| **Rate Limiting** | SlowAPI | Latest |
| **AI** | Groq (Llama 3.x via router) | — |
| **Storage** | Cloudflare R2 (S3-compatible) | — |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **Billing** | LemonSqueezy | — |
| **Email** | Resend | — |
| **Linting** | Oxlint | 1.71 |

---

## 📁 Project Structure

```
Tenaciti/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # App entry point, router registration
│   │   ├── config.py          # Pydantic Settings (env-driven)
│   │   ├── database.py        # Async SQLAlchemy engine + session
│   │   ├── middleware/
│   │   │   ├── auth.py        # Hybrid JWT validation (local + Supabase)
│   │   │   ├── rate_limit.py  # SlowAPI integration
│   │   │   └── tier_gate.py   # Free/Pro feature guards
│   │   ├── models/            # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── document.py
│   │   │   ├── roadmap_node.py
│   │   │   ├── topic.py
│   │   │   ├── topic_completion.py
│   │   │   ├── note.py
│   │   │   ├── note_link.py
│   │   │   ├── goal.py
│   │   │   ├── goal_course.py
│   │   │   ├── gpa_entry.py
│   │   │   ├── self_assessment_log.py
│   │   │   ├── streak.py
│   │   │   ├── streak_daily_log.py
│   │   │   └── subscription.py
│   │   ├── routes/            # API endpoints (REST)
│   │   │   ├── auth.py        # Register, login, OAuth callback, password reset, email verify
│   │   │   ├── courses.py     # CRUD + limits
│   │   │   ├── documents.py   # Upload, list, delete, extraction triggers
│   │   │   ├── roadmap_nodes.py  # CRUD, confirm, self-assessment submit
│   │   │   ├── topics.py      # CRUD, toggle, reorder, merge, link-node, confirm
│   │   │   ├── notes.py       # CRUD, search, backlinks, wikilink parsing
│   │   │   ├── goals.py       # CRUD + GPA target tracking
│   │   │   ├── gpa.py         # GPA entry + calculation
│   │   │   ├── self_assessment.py  # Submit, gap analysis
│   │   │   ├── billing.py     # LemonSqueezy webhooks + portal
│   │   │   └── admin.py       # Admin utilities
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── auth_service.py       # Password hashing, JWT, tokens
│   │   │   ├── storage_service.py    # Cloudflare R2 wrapper
│   │   │   ├── extraction_service.py # Topic extraction from PDF/PPTX
│   │   │   ├── roadmap_extraction.py # Assessment extraction from syllabus
│   │   │   ├── groq_router.py        # Circuit-breaker LLM router
│   │   │   ├── email_service.py      # Resend email sender
│   │   │   └── gpa_service.py        # GPA calculation logic
│   │   └── __init__.py
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── web/                       # React + Vite Frontend
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Routes + AuthProvider + ProtectedRoute
│   │   ├── api/client.js      # Supabase client + apiFetch wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state, login/logout, token management
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar + top bar
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topics/
│   │   │   │   ├── TopicList.jsx      # Main topic UI (drag, merge, link-node)
│   │   │   │   ├── TopicItem.jsx      # Inline edit, confidence modal trigger
│   │   │   │   ├── TopicMergeModal.jsx
│   │   │   │   └── ConfidenceModal.jsx
│   │   │   └── Notes/
│   │   │       ├── MarkdownEditor.jsx # Editor + wikilink autocomplete
│   │   │       ├── GraphView.jsx      # Force-directed knowledge graph
│   │   │       └── BacklinksPanel.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Course cards, stats, quick actions
│   │   │   ├── CoursePage.jsx         # 5 tabs: Overview/Docs/Roadmap/Topics/Notes
│   │   │   ├── NotesPage.jsx          # List/Graph/Editor views
│   │   │   ├── GoalsPage.jsx
│   │   │   ├── SelfAssessmentPage.jsx
│   │   │   ├── GPAPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── Auth pages (Login, Register, Forgot/Reset, Verify)
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── test/                      # Static HTML prototype (legacy)
├── docs/                      # SRS, API specs
├── docker-compose.yml         # Local Postgres + pgAdmin
└── README.md                  # This file
```

---

## ✨ Core Features

### 📚 Course Management
- Create courses with code, semester, academic year, credit hours
- Archive courses; track document upload counts per course
- Semester-aware dashboard filtering

### 📄 Document Upload & AI Extraction
| Feature | Free | Pro |
|---------|------|-----|
| Uploads per course | 3 | 20 |
| Max file size | 10 MB | 25 MB |
| Syllabus → Roadmap | ✅ | ✅ |
| Slides → Topics | ❌ | ✅ |
| Instructor Notes → Topics | ❌ | ✅ |

**Extraction Pipeline:**
1. Upload → Cloudflare R2 (SHA-256 dedup)
2. Background job downloads file
3. `pypdf` / `python-pptx` extracts text
4. Groq (Llama 3.3 70B → fallback chain) returns structured JSON
5. Bulk-insert `RoadmapNode` or `Topic` rows linked to `Document`

### 🗺️ Roadmap (Assessments)
- **Node Types**: Assignment, Quiz, Exam, Project, Lab, Other
- **Placeholder Detection**: Missing deadline/weight → flagged as placeholder
- **Confirm Flow**: Student reviews AI extraction → fills gaps → confirms
- **Self-Assessment**: On submit, log quality (1–5), mood (1–5), actual hours, reflection
- **Gap Analytics**: Confidence gap (creation vs. submission), hours gap, timeliness

### 📋 Topics (Study Content)
- Extracted from slides/notes or added manually
- **Drag-and-drop reorder** (@dnd-kit)
- **Inline edit** title
- **Confirm-before-lock** pattern (prevents accidental completion)
- **Confidence Rating** (1–5) on completion → tracks calibration
- **Merge Mode**: Select multiple → merge into one (preserves completions)
- **Link to Roadmap Node**: Associate topic with assessment for context

### 📝 Notes & Knowledge Graph
- Markdown editor with toolbar (Bold, Italic, Link, Code)
- **Wikilinks**: `[[Note Title]]` → auto-creates/links notes
- **Backlinks Panel**: Shows all notes linking to current note
- **Graph View**: Force-directed (react-force-graph-2d)
  - Node size ∝ connection degree (Obsidian-style)
  - Course-based color coding
  - Hover highlights neighbors, dims others
  - Course filter dropdown

### 🎯 Goals & GPA
- Semester goals with optional GPA target
- Link goals to courses
- GPA calculator (letter grade → points, weighted by credits)
- Progress tracking against target GPA

### 🔐 Authentication
- **Google OAuth** via Supabase Auth
- **Email/Password** with local JWT (Argon2id)
- **Email verification** required for local accounts
- **Password reset** via secure token (Resend)
- **Account lockout** after 5 failed attempts (15 min)

### 💳 Billing (LemonSqueezy)
- Pro subscription via checkout session
- Webhook syncs `plan` + `plan_expires_at` on User
- Tier gates on upload limits, file size, extraction types

---

## 🗄 Data Model

```
User 1──┬──< Course >──┬──< Document >──< Topic >
        │              │
        │              └──< RoadmapNode >──< SelfAssessmentLog >
        │
        ├──< Note >──< NoteLink > (self-referential, bi-directional)
        │
        ├──< Goal >──< GoalCourse >── Course
        │
        ├──< GpaEntry >
        │
        └──< Subscription > (LemonSqueezy sync)
```

**Key Relationships:**
- `Topic.source_document_id` → traces AI extraction provenance
- `Topic.linked_node_id` → connects study content to assessment
- `TopicCompletion` → per-user completion + confidence rating
- `NoteLink` → unique (source, target), no self-links
- `SelfAssessmentLog` → computed gaps (confidence, hours, deadline)

---

## 🔐 Authentication & Authorization

### Hybrid JWT Strategy

| Token Type | Audience | Validation |
|------------|----------|------------|
| **Local JWT** | Email/password users | HS256 + `app_secret_key`, `token_version` revocation |
| **Supabase JWT** | Google OAuth users | HS256 + `supabase_jwt_secret`, audience=`authenticated` |

**Flow:**
```
Frontend sends Authorization: Bearer <token>
        │
        ▼
Backend: get_current_user()
        │
        ├─► Try local JWT decode + token_version match
        │
        └─► Try Supabase JWT decode (or API fallback)
                │
                ▼
        Upsert User (auto-create on first OAuth login)
        │
        ▼
get_verified_user() enforces is_email_verified
```

**Security Features:**
- Argon2id password hashing (configurable params)
- Token version increment on password reset/logout
- Account lockout (5 failures → 15 min)
- Rate limiting: 10/min login, 5/min register, 3/min forgot password
- CORS restricted to configured origins

---

## 🤖 AI Extraction Pipeline

### Topic Extraction (`extraction_service.py`)
```python
# Input: Document (PDF/PPTX) from R2
# Output: List[Topic] linked to Document
1. Download file from R2 (threadpool)
2. Extract text: pypdf (PDF) / python-pptx (PPTX)
3. Select system prompt (syllabus vs slides)
4. Groq Router: Llama-3.3-70B → Llama-3.1-8B → Mixtral (circuit breaker)
5. Parse JSON array of topic strings
6. Bulk insert Topic rows (order_index preserved, is_confirmed=False)
7. Update Document.processing_status
```

### Roadmap Extraction (`roadmap_extraction.py`)
```python
# Input: Syllabus PDF
# Output: List[RoadmapNode] with structured assessment data
1. Same download + text extraction
2. Structured prompt → JSON: {nodes: [{title, node_type, deadline, weight_percent, confidence}], warnings}
3. Normalize node_type aliases (homework→Assignment, midterm→Exam, etc.)
4. is_placeholder = deadline is None OR weight is None
5. Bulk insert RoadmapNode (is_confirmed=False, status=Pending)
```

### Groq Router (`groq_router.py`)
- Circuit-breaker pattern: tracks consecutive failures per model
- Auto-fallback chain: `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` → `mixtral-8x7b-32768`
- Configurable timeout (30s) and max tokens

---

## 🌐 API Endpoints

All routes prefixed with `/api/v1`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/callback` | Supabase OAuth callback |
| POST | `/auth/register` | Email/password register |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/forgot-password` | Request reset email |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/resend-verification` | Resend verification |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List user's courses |
| POST | `/courses` | Create course |
| GET | `/courses/{id}` | Get course |
| PUT | `/courses/{id}` | Update course |
| DELETE | `/courses/{id}` | Delete course |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/courses/{id}/upload` | Upload file (multipart) |
| GET | `/documents/courses/{id}` | List documents |
| DELETE | `/documents/{id}` | Delete document |
| POST | `/documents/{id}/extract-roadmap` | Trigger roadmap extraction |
| POST | `/documents/{id}/extract` | Trigger topic extraction |
| GET | `/documents/{id}/extraction-status` | Poll extraction status |
| GET | `/documents/{id}/topic-extraction-status` | Poll topic extraction |

### Roadmap Nodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roadmap-nodes/courses/{id}` | List roadmap nodes |
| POST | `/roadmap-nodes/courses/{id}` | Create node manually |
| GET | `/roadmap-nodes/{id}` | Get node |
| PUT | `/roadmap-nodes/{id}` | Update node |
| DELETE | `/roadmap-nodes/{id}` | Delete node |
| POST | `/roadmap-nodes/{id}/confirm` | Confirm placeholder |
| POST | `/self-assessment/nodes/{id}/submit` | Submit + self-assess |
| GET | `/self-assessment/nodes/{id}/gap` | Get gap analytics |

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/topics/courses/{id}` | List topics with completion |
| POST | `/topics/courses/{id}` | Create topic |
| PUT | `/topics/{id}` | Update topic |
| PATCH | `/topics/{id}/toggle` | Toggle completion + confidence |
| DELETE | `/topics/{id}` | Delete topic |
| POST | `/topics/{id}/confirm` | Confirm/unconfirm |
| POST | `/topics/bulk-reorder` | Reorder topics |
| POST | `/topics/merge` | Merge topics |
| PATCH | `/topics/{id}/link-node` | Link/unlink roadmap node |
| GET | `/topics/courses/{id}/completion-stats` | Progress stats |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List all notes |
| GET | `/notes/courses/{id}` | List course notes |
| POST | `/notes` | Create note |
| GET | `/notes/{id}` | Get note + backlinks |
| PUT | `/notes/{id}` | Update note (parses wikilinks) |
| DELETE | `/notes/{id}` | Delete note |
| GET | `/notes/search?q=` | Full-text search |
| GET | `/notes/backlinks/{id}` | Get backlinks |

### Goals & GPA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/goals` | List/create goals |
| GET/PUT/DELETE | `/goals/{id}` | CRUD goal |
| GET | `/goals/gpa-status` | GPA goal progress |
| GET/POST | `/gpa` | List/create GPA entries |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/limits` | Current tier limits |
| POST | `/billing/checkout` | Create LemonSqueezy checkout |
| POST | `/billing/portal` | Create billing portal session |
| POST | `/billing/webhook` | LemonSqueezy webhook |

---

## 🖥 Frontend Architecture

### State Management
- **AuthContext**: User, session, login/logout, token storage (localStorage + Supabase)
- **Component-level state**: `useState`/`useReducer` for UI state
- **Server state**: `apiFetch` wrapper + manual `useEffect` fetching (no React Query yet)

### Routing (`App.jsx`)
```
/login                    → LoginPage
/verify-email             → VerifyEmailPage
/verify-email/confirm     → VerifyEmailConfirmPage
/forgot-password          → ForgotPasswordPage
/reset-password           → ResetPasswordPage
/ (protected)             → DashboardPage
/courses/:id              → CoursePage (5 tabs)
/notes                    → NotesPage (list)
/notes/:id                → NotesPage (editor)
/goals                    → GoalsPage
/self-assessment          → SelfAssessmentPage
/gpa                      → GPAPage
/profile                  → ProfilePage
/settings                 → SettingsPage
```

### Key Components

**TopicList** (`components/Topics/TopicList.jsx`)
- Extraction polling banner
- Progress bar (completed/confirmed/total)
- Toolbar: Add, Merge Mode, Confirm All
- Drag-and-drop (@dnd-kit vertical list)
- Merge selection mode + modal
- Link-node dropdown panel
- Completed topics section (collapsed)

**GraphView** (`components/Notes/GraphView.jsx`)
- react-force-graph-2d canvas
- Dynamic node sizing: `baseR + min(degree * 0.7, 4)`
- Course color palette (7 colors)
- Hover: highlight neighbors, dim others
- Course filter dropdown
- Legend + stats chips

**MarkdownEditor** (`components/Notes/MarkdownEditor.jsx`)
- Toolbar: Bold, Italic, Link, Code, Preview toggle
- Wikilink autocomplete (`[[` trigger)
- Auto-save on blur (debounced)
- Live preview (basic markdown → HTML)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker (optional, for local Postgres)
- Supabase account (Auth + DB + Realtime)
- Cloudflare R2 account (file storage)
- Groq API key (AI extraction)
- LemonSqueezy account (billing)
- Resend account (email)

### Backend Setup
```bash
cd backend

# Create venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Configuration)

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd web

# Install deps
npm install

# Configure environment
cp .env.example .env
# Edit .env with Supabase URL/key + API URL

# Start dev server
npm run dev  # http://localhost:5173
```

### Docker (Optional)
```bash
# Start local Postgres + pgAdmin
docker-compose up -d

# Update backend .env DATABASE_URL to point to docker-compose postgres
```

---

## ⚙️ Environment Configuration

### Backend (`.env`)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Database (Supabase Postgres)
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# App
APP_SECRET_KEY=your-32-char-secret
DEBUG=true

# LemonSqueezy
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_VARIANT_ID=...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=tenaciti-uploads

# AI (Groq)
LLM_API_KEY=gsk_...
LLM_PROVIDER=groq

# Email (Resend)
RESEND_API_KEY=re_...
MAIL_FROM=onboarding@resend.dev

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 👨‍💻 Development Workflow

### Backend
```bash
# Run tests
pytest

# Lint
ruff check .

# Format
ruff format .

# New migration
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend
```bash
# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview build
npm run preview
```

### Git Hooks (Optional)
```bash
# Install pre-commit
pip install pre-commit
pre-commit install
```

---

## 🚀 Deployment

### Backend (Render / Fly.io / Railway)
1. Set all env vars in platform dashboard
2. Run migrations on deploy: `alembic upgrade head`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` to production backend URL
4. Set `VITE_SUPABASE_*` vars

### Database
- **Supabase** (managed Postgres) — recommended
- Or any PostgreSQL 15+ with `pgvector` extension (for future semantic search)

### Storage
- **Cloudflare R2** — S3-compatible, zero egress fees
- Configure bucket CORS for direct browser uploads (optional optimization)

---

## 🗺 Roadmap

### Near Term
- [ ] **React Query / TanStack Query** for server state management
- [ ] **TypeScript** migration (frontend + backend schemas)
- [ ] **Semantic search** on notes (pgvector + embeddings)
- [ ] **Mobile PWA** with offline-first notes
- [ ] **Collaborative notes** (Supabase Realtime + CRDT)

### Medium Term
- [ ] **Spaced repetition** scheduler for topics (SM-2 algorithm)
- [ ] **Calendar sync** (Google/Outlook) for roadmap deadlines
- [ ] **PDF annotation** overlay on uploaded documents
- [ ] **Analytics dashboard** (study heatmap, velocity, calibration)

### Long Term
- [ ] **Multi-tenant** (classrooms, study groups)
- [ ] **AI tutor chat** grounded in user's notes + syllabus
- [ ] **Native mobile** (React Native / Expo)

---

## 📄 License

**Proprietary — All Rights Reserved**

Copyright © 2026 Ehsaan Qazi. This software and its documentation are proprietary and confidential. Unauthorized copying, distribution, modification, or use is strictly prohibited.