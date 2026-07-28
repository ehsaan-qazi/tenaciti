# 🐨 Koala Frontend

React 19 + Vite frontend for the Koala AI-assisted study companion.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials and API URL

# Start development server
npm run dev        # http://localhost:5173
```

## Project Structure

```
web/
├── src/
│   ├── api/
│   │   └── client.js           # Supabase + REST client (apiFetch)
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar + top bar
│   │   ├── Sidebar.jsx         # Navigation
│   │   ├── Topics/
│   │   │   ├── TopicList.jsx   # Full topic management (drag-drop, merge, link-node)
│   │   │   ├── TopicItem.jsx   # Inline edit, toggle, confidence modal trigger
│   │   │   ├── TopicMergeModal.jsx
│   │   │   └── ConfidenceModal.jsx
│   │   └── Notes/
│   │       ├── MarkdownEditor.jsx   # Wikilink autocomplete, toolbar, preview
│   │       ├── GraphView.jsx        # react-force-graph-2d knowledge graph
│   │       └── BacklinksPanel.jsx
│   ├── context/
│   │   └── AuthContext.jsx     # Hybrid auth (Supabase OAuth + local JWT)
│   ├── pages/
│   │   ├── DashboardPage.jsx   # Courses grid, stats, quick actions
│   │   ├── CoursePage.jsx      # 5 tabs: Overview, Documents, Roadmap, Topics, Notes
│   │   ├── NotesPage.jsx       # List / Editor / Graph views
│   │   ├── GoalsPage.jsx
│   │   ├── GPAPage.jsx
│   │   ├── SelfAssessmentPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── Auth pages (Login, Register, Forgot/Reset Password, Verify Email)
│   ├── styles/
│   │   └── index.css           # Global styles + CSS variables
│   ├── App.jsx                 # Routes + ProtectedRoute wrapper
│   └── main.jsx                # Entry point
├── index.html
├── vite.config.js
├── package.json
└── .oxlintrc.json
```

## Key Features

### Authentication (`AuthContext.jsx`)
- **Hybrid**: Supabase Google OAuth + custom email/password JWT
- Auto-refreshes user profile on auth state change
- Enforces email verification gate (backend is source of truth)
- Token stored in `localStorage` (local JWT) + Supabase session

### API Client (`apiFetch`)
- Unified fetch wrapper for both REST API and Supabase
- Auto-attaches Bearer token (local JWT → Supabase session fallback)
- Normalizes FastAPI error responses (Pydantic validation arrays, nested objects)

### Course Page (`CoursePage.jsx`) — Core Hub
**5 Tabs:**
1. **Overview** — Progress bars (roadmap confirmation %, topic completion %)
2. **Documents** — Drag-drop upload (PDF/PPTX), tier-gated extraction buttons
3. **Roadmap** — Assessment nodes with inline edit, confirm, submit+self-assess, gap metrics
4. **Topics** — Full `TopicList` (drag-drop reorder, merge modal, link-node panel, confidence rating)
5. **Notes** — Course-scoped note list with quick navigation to full Notes page

### Notes System (`NotesPage.jsx` + Components)
- **List View** — Search, quick capture (mobile FAB), stub indicators
- **Editor** — Markdown toolbar, `[[wikilink]]` autocomplete, live preview toggle, auto-save
- **Graph View** — Obsidian-style force-directed graph (course-colored nodes, hover highlight, stub styling)

### Topic Management (`TopicList.jsx` + `TopicItem.jsx`)
- Extraction polling banner
- Progress header (completed/total, confirmed, %)
- Toolbar: Add, Merge mode, Confirm All
- Drag-drop reorder (@dnd-kit)
- Merge mode: multi-select → modal with target picker + new title
- Link-node panel: dropdown to attach topic to roadmap node
- Inline title edit (Enter to save, Escape to cancel)
- Completion toggle → ConfidenceModal (1-5 rating)
- Separate completed section (collapsible)

## Styling

- CSS Variables in `src/styles/index.css` (`--primary`, `--bg-*`, `--text-*`, `--border-*`, `--green`, `--amber`, `--red`, `--purple`)
- Component-scoped inline styles for dynamic values (course colors, progress widths)
- Dark-mode friendly (variables swap via media query)

## Scripts

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # Oxlint (fast Rust linter)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_API_URL` | Backend API base (default: `http://localhost:8000/api/v1`) |

## Dependencies (Key)

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | 19.2 |
| `react-router-dom` | 7.18 (data APIs not used) |
| `@supabase/supabase-js` | 2.110 (Auth only) |
| `axios` | 1.7 (used internally by apiFetch for formData) |
| `@dnd-kit/*` | 6.3/10.0/3.2 (drag-drop) |
| `react-force-graph-2d` | 1.29 (knowledge graph) |
| `react-hot-toast` | 2.5 (notifications) |

## Building for Production

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, Cloudflare Pages, etc.
# Set VITE_API_URL to your production backend
```

## Backend Integration

Frontend expects backend at `VITE_API_URL` with these route prefixes:
- `/api/v1/auth/*` — Login, register, password reset, email verification
- `/api/v1/courses/*` — CRUD + limits
- `/api/v1/documents/*` — Upload, list, delete, extraction triggers + status
- `/api/v1/topics/*` — CRUD, toggle, confirm, reorder, merge, link-node, stats
- `/api/v1/roadmap-nodes/*` — CRUD, confirm, extract
- `/api/v1/notes/*` — CRUD, search, backlinks, wikilink parsing
- `/api/v1/goals/*` — CRUD + progress
- `/api/v1/gpa/*` — Entries + calculation
- `/api/v1/self-assessment/*` — Submit, gap metrics
- `/api/v1/billing/*` — Limits, portal
- `/api/v1/admin/*` — Admin only

See `backend/app/main.py` for full router registration.