# Tenaciti Production Deployment & Configuration Guide

This guide outlines the production deployment setup for the three surfaces of the Tenaciti monorepo:

| Surface | Domain | Host / Platform | Directory | Framework / Runtime |
|---|---|---|---|---|
| **Authenticated App** | `https://my.tenaciti.app` | Vercel | `apps/app` | Vite + React 19 SPA |
| **Public Marketing Website** | `https://tenaciti.app` | Vercel | Root / `apps/website` | Next.js 16 (Turbopack) |
| **Backend API** | `https://api.tenaciti.app` (or Render URL) | Render | `apps/backend` | FastAPI (Python 3.12) |

---

## 1. Vercel Project 1: Authenticated Application (`tenaciti-app`)

Deploy the authenticated student workspace to `my.tenaciti.app`.

### Project Settings
- **Project Name**: `tenaciti-app`
- **Framework Preset**: `Vite`
- **Root Directory**: `apps/app`
- **Build Command**: `vite build` (or default `turbo build --filter=@tenaciti/app`)
- **Output Directory**: `dist`
- **Install Command**: `npm ci` (run from monorepo root)

### Custom Domains
- Add `my.tenaciti.app`
- Configure DNS CNAME record: `my.tenaciti.app` → `cname.vercel-dns.com`

### Environment Variables
Configure under **Project Settings → Environment Variables**:

| Variable | Environment | Value Example / Description |
|---|---|---|
| `VITE_API_URL` | Production | `https://api.tenaciti.app/api/v1` (or your Render backend URL) |
| `VITE_SUPABASE_URL` | Production | `https://<your-project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Production | `<your-supabase-anon-key>` |
| `VITE_MARKETING_URL` | Production | `https://tenaciti.app` |

---

## 2. Vercel Project 2: Public Website (`tenaciti-website`)

### Current State (Coming Soon Mode)
Until the full Next.js public website is promoted, `tenaciti.app` serves the static coming-soon page:
- **Root Directory**: `.` (monorepo root)
- **Output Directory**: `public`
- **Domain**: `tenaciti.app` & `www.tenaciti.app`

### Future Promotion (Next.js Marketing Website)
When ready to launch the full marketing site:
1. In Vercel Project Settings for `tenaciti.app`, change **Root Directory** to `apps/website`.
2. **Framework Preset**: `Next.js`.
3. Set environment variables:
   - `NEXT_PUBLIC_APP_URL`: `https://my.tenaciti.app`
   - `NEXT_PUBLIC_API_URL`: `https://api.tenaciti.app/api/v1`

---

## 3. Supabase Authentication & Google OAuth

Ensure Google OAuth redirects correctly to `my.tenaciti.app` in production:

1. Open **Supabase Dashboard → Authentication → URL Configuration**.
2. **Site URL**:
   ```text
   https://my.tenaciti.app
   ```
3. **Redirect URLs (Allow list)**:
   Add the following patterns:
   ```text
   http://localhost:5173/**
   http://localhost:3000/**
   https://my.tenaciti.app/**
   ```
4. **Google OAuth Provider**:
   - In Google Cloud Console (APIs & Services → Credentials):
     - **Authorized JavaScript origins**: `https://my.tenaciti.app`, `https://<your-supabase-ref>.supabase.co`
     - **Authorized redirect URIs**: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`

---

## 4. Backend Deployment (Render)

### Service Settings
- **Service Type**: Web Service
- **Environment**: Python 3.12
- **Root Directory**: `apps/backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables
Configure under **Render Dashboard → Environment**:

| Variable | Description / Value |
|---|---|
| `CORS_ORIGIN` or `CORS_ORIGINS` | `https://my.tenaciti.app,https://tenaciti.app,https://www.tenaciti.app,http://localhost:5173,http://localhost:3000` |
| `DATABASE_URL` | `postgresql+psycopg://<user>:<password>@<host>:5432/<database>` |
| `SUPABASE_URL` | `https://<your-project>.supabase.co` |
| `SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-supabase-service-role-key>` |
| `SUPABASE_JWT_SECRET` | `<your-supabase-jwt-secret>` |
| `APP_SECRET_KEY` | `<random-secure-string>` |
| `R2_ACCOUNT_ID` | `<cloudflare-account-id>` |
| `R2_ACCESS_KEY_ID` | `<cloudflare-r2-access-key>` |
| `R2_SECRET_ACCESS_KEY` | `<cloudflare-r2-secret-key>` |
| `R2_BUCKET_NAME` | `tenaciti-uploads` |
| `LLM_API_KEY` | `<groq-api-key>` |
| `LLM_PROVIDER` | `groq` |
| `RESEND_API_KEY` | `<resend-api-key>` |
| `BILLING_PROVIDER` | `null` (leave as `null` while premium is in coming soon status) |

---

## 5. Pre-Deployment Validation Checklist

- [ ] Backend CI passes (`ruff check` + `pytest`): `.github/workflows/backend-ci.yml`
- [ ] App CI passes (`oxlint` + `turbo build --filter=@tenaciti/app`): `.github/workflows/app-ci.yml`
- [ ] Website CI passes (`next lint` + `turbo build --filter=@tenaciti/website`): `.github/workflows/website-ci.yml`
- [ ] Backend CORS origins support `https://my.tenaciti.app` and `https://tenaciti.app`
- [ ] Supabase OAuth redirect URL allows `https://my.tenaciti.app/**`
- [ ] App SPA fallback (`apps/app/vercel.json`) routes all URLs to `/index.html`
- [ ] Settings page displays "Premium — Coming Soon" without broken checkout redirects
