"""
Streak routes — activity tracking, heatmap, deadlines, topic coverage, and workload.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.schemas.streak import (
    StreakSummaryResponse,
    HeatmapResponse,
    ActivityLogRequest,
    ActivityLogResponse,
    UpcomingDeadlinesResponse,
    TopicCoverageResponse,
    WeeklyWorkloadResponse,
)
from app.services.streak_service import StreakService

router = APIRouter(prefix="/streaks", tags=["Streaks"])


@router.get("/summary", response_model=StreakSummaryResponse)
async def get_streak_summary(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the current user's streak summary for the dashboard.

    Returns:
    - activity_streak: consecutive days with any activity
    - on_time_streak: consecutive on-time submissions
    - longest_activity_streak: all-time best
    - longest_on_time_streak: all-time best on-time
    - last_activity_date: ISO date of last activity
    """
    summary = await StreakService.get_streak_summary(current_user.id, db)
    return StreakSummaryResponse(**summary)


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_streak_heatmap(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get 12-week (84 day) GitHub-style activity heatmap.

    Returns list of cells with date, count, and intensity level (0-4).
    """
    cells = await StreakService.get_heatmap_data(current_user.id, db)
    if not cells:
        return HeatmapResponse(cells=[], start_date="", end_date="")

    return HeatmapResponse(
        cells=cells,
        start_date=cells[0]["date"],
        end_date=cells[-1]["date"],
    )


@router.post("/log-activity", response_model=ActivityLogResponse)
async def log_activity(
    request: ActivityLogRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Log a user activity for streak tracking.

    Call this endpoint when the user performs any meaningful action:
    - Opening the dashboard
    - Completing a topic
    - Submitting a roadmap node
    - Creating/editing a note
    - etc.

    The streak service automatically:
    - Increments the daily action counter
    - Recalculates the activity streak
    - Updates longest streak records
    """
    streak, daily_log = await StreakService.log_activity(
        user_id=current_user.id,
        action_count=request.action_count,
        db=db,
    )

    return ActivityLogResponse(
        activity_streak=streak.activity_streak_count,
        last_activity_date=daily_log.log_date.isoformat(),
    )


@router.get("/deadlines", response_model=UpcomingDeadlinesResponse)
async def get_upcoming_deadlines(
    days_ahead: int = Query(14, ge=1, le=90, description="Days to look ahead for upcoming deadlines"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get upcoming and overdue roadmap node deadlines.

    Returns:
    - overdue: items past deadline with status Pending/In Progress (most overdue first)
    - upcoming: items within the next N days (soonest first)

    Each item includes days_until (negative for overdue) and placeholder/confirmed status.
    """
    result = await StreakService.get_upcoming_deadlines(current_user.id, days_ahead, db)
    return UpcomingDeadlinesResponse(**result)


@router.get("/topic-coverage", response_model=TopicCoverageResponse)
async def get_topic_coverage(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get per-course topic completion progress for dashboard glance.

    Returns list of courses with total/completed topic counts and progress percentage.
    Only includes courses that have at least one topic.
    """
    coverage = await StreakService.get_topic_coverage(current_user.id, db)
    return TopicCoverageResponse(courses=coverage)


@router.get("/weekly-workload", response_model=WeeklyWorkloadResponse)
async def get_weekly_workload(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get estimated hours due this week (Mon-Sun) and next week.

    Sums estimated_hours from roadmap nodes with deadlines in each week.
    Only includes nodes with status Pending/In Progress.
    """
    workload = await StreakService.get_weekly_workload(current_user.id, db)
    return WeeklyWorkloadResponse(**workload)