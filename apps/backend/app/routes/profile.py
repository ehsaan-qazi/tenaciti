"""
Profile & Retrospective routes — Phase 7 API endpoints for academic profile insights,
planning accuracy, confidence & topic coverage trends, note-density correlations,
procrastination fingerprints, and auto-generated retrospective reports.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.schemas.profile import (
    ProfileSummaryResponse,
    PlanningAccuracyResponse,
    ConfidenceTrendsResponse,
    TopicCoverageTrendsResponse,
    NoteDensityCorrelationResponse,
    ProcrastinationFingerprintResponse,
    RetrospectiveReportResponse,
    RetrospectiveRequest,
    ProfileTrendsQuery,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile & Insights"])


@router.get("/summary", response_model=ProfileSummaryResponse)
async def get_profile_summary(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregate profile summary metrics:
    - Node counts, completion rates, average estimated vs actual hours
    - Active courses count, topic completion statistics
    - Notes and bi-directional note links totals
    """
    return await ProfileService.get_profile_summary(current_user.id, db)


@router.get("/planning-accuracy", response_model=PlanningAccuracyResponse)
async def get_planning_accuracy(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get per-course and overall estimation accuracy metrics:
    - Estimated vs actual hours gap (positive = underestimated)
    - Hours gap percentage
    - Accuracy score (0-100, 100 = perfect estimation)
    """
    return await ProfileService.get_planning_accuracy(current_user.id, db)


@router.get("/confidence-trends", response_model=ConfidenceTrendsResponse)
async def get_confidence_trends(
    course_id: Optional[int] = Query(None, description="Filter trends to specific course ID"),
    days: int = Query(90, ge=7, le=365, description="Days of history to analyze"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get initial confidence timeline trends over the past N days:
    - Average confidence at creation (1-5 scale)
    - Average extraction confidence (0-1 scale)
    - Per-course timeline and overall trend timeline
    """
    query = ProfileTrendsQuery(course_id=course_id, days=days)
    return await ProfileService.get_confidence_trends(current_user.id, query, db)


@router.get("/topic-coverage-trends", response_model=TopicCoverageTrendsResponse)
async def get_topic_coverage_trends(
    course_id: Optional[int] = Query(None, description="Filter trends to specific course ID"),
    days: int = Query(90, ge=7, le=365, description="Days of history to analyze"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get topic completion coverage percentage over time:
    - Cumulative topic completion progress timeline
    - Per-course timeline and overall system trend
    """
    query = ProfileTrendsQuery(course_id=course_id, days=days)
    return await ProfileService.get_topic_coverage_trends(current_user.id, query, db)


@router.get("/note-density-correlation", response_model=NoteDensityCorrelationResponse)
async def get_note_density_correlation(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Correlate note density (notes & links written) against grades and self-assessment quality:
    - Pearson r correlation coefficients
    - Detailed data points per topic/node
    - Dynamic interpretation summary
    """
    return await ProfileService.get_note_density_correlation(current_user.id, db)


@router.get("/procrastination-fingerprint", response_model=ProcrastinationFingerprintResponse)
async def get_procrastination_fingerprint(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze submission timing patterns relative to node deadlines:
    - 5 timing distribution buckets (0-6h, 6-24h, 1-3d, 3-7d, 7d+)
    - Mean and median hours before deadline
    - On-time, early, and last-minute rates
    - Personality archetype classification (e.g. Early Planner, Deadline Sprinter)
    """
    return await ProfileService.get_procrastination_fingerprint(current_user.id, db)


@router.get("/retrospective", response_model=RetrospectiveReportResponse)
async def get_retrospective_report_get(
    semester: Optional[str] = Query(None, description="Specific semester (e.g. Fall)"),
    academic_year: Optional[str] = Query(None, description="Academic year (e.g. 2026-2027)"),
    include_all_time: bool = Query(False, description="Generate all-time retrospective report"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate retrospective report via GET parameters.
    """
    req = RetrospectiveRequest(
        semester=semester,
        academic_year=academic_year,
        include_all_time=include_all_time,
    )
    return await ProfileService.get_retrospective_report(current_user.id, req, db)


@router.post("/retrospective", response_model=RetrospectiveReportResponse)
async def get_retrospective_report_post(
    request: RetrospectiveRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate retrospective report via JSON payload.
    """
    return await ProfileService.get_retrospective_report(current_user.id, request, db)
