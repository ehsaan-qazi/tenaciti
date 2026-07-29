import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.config import settings
import app.models  # Register all ORM models
from app.middleware.rate_limit import limiter

from app.routes.auth import router as auth_router
from app.routes.courses import router as courses_router
from app.routes.billing import router as billing_router
from app.routes.documents import router as documents_router
from app.routes.topics import router as topics_router
from app.routes.roadmap_nodes import router as roadmap_nodes_router
from app.routes.notes import router as notes_router
from app.routes.admin import router as admin_router
from app.routes.self_assessment import router as self_assessment_router
from app.routes.goals import router as goals_router
from app.routes.gpa import router as gpa_router
from app.routes.streaks import router as streaks_router

app = FastAPI(
    title="Tenaciti API",
    description="Backend API for the Tenaciti learning app",
    version="1.0.0",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Tenaciti API is running"}

# Register all routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(courses_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(topics_router, prefix="/api/v1")
app.include_router(roadmap_nodes_router, prefix="/api/v1")
app.include_router(notes_router, prefix="/api/v1")
app.include_router(self_assessment_router, prefix="/api/v1")
app.include_router(goals_router, prefix="/api/v1")
app.include_router(gpa_router, prefix="/api/v1")
app.include_router(streaks_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
