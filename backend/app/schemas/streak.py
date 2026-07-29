"""
Streak schemas — Pydantic models for streak API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime


class StreakSummaryResponse(BaseModel):
    """Dashboard summary of all streak metrics."""

    activity_streak: int = Field(..., description="Current consecutive days with activity")
    on_time_streak: int = Field(..., description="Current consecutive on-time submissions")
    longest_activity_streak: int = Field(..., description="Longest activity streak ever achieved")
    longest_on_time_streak: int = Field(..., description="Longest on-time submission streak ever achieved")
    last_activity_date: Optional[str] = Field(None, description="ISO date of last logged activity (YYYY-MM-DD)")


class HeatmapCell(BaseModel):
    """Single cell in the GitHub-style 12-week heatmap."""

    date: str = Field(..., description="ISO date (YYYY-MM-DD)")
    count: int = Field(..., ge=0, description="Number of actions on this day")
    level: int = Field(..., ge=0, le=4, description="Intensity level 0-4 (GitHub style)")


class HeatmapResponse(BaseModel):
    """Full 12-week (84 day) heatmap data."""

    cells: List[HeatmapCell]
    start_date: str = Field(..., description="ISO date of first cell (YYYY-MM-DD)")
    end_date: str = Field(..., description="ISO date of last cell (YYYY-MM-DD)")


class ActivityLogRequest(BaseModel):
    """Request to log user activity for streak tracking."""

    action_count: int = Field(1, ge=1, description="Number of actions to log (default 1)")


class ActivityLogResponse(BaseModel):
    """Response after logging activity."""

    activity_streak: int
    last_activity_date: str
    message: str = "Activity logged"


class DeadlineItem(BaseModel):
    """Single deadline entry (upcoming or overdue)."""

    id: int
    title: str
    node_type: str
    deadline: str = Field(..., description="ISO datetime string")
    weight_percent: Optional[float] = None
    is_placeholder: bool
    is_confirmed: bool
    days_until: float = Field(..., description="Days until deadline (negative = overdue)")
    is_overdue: bool


class UpcomingDeadlinesResponse(BaseModel):
    """Grouped upcoming and overdue deadlines."""

    overdue: List[DeadlineItem]
    upcoming: List[DeadlineItem]


class CourseCoverage(BaseModel):
    """Topic completion progress for a single course."""

    course_id: int
    course_name: str
    course_code: Optional[str] = None
    total: int
    completed: int
    progress_pct: int


class TopicCoverageResponse(BaseModel):
    """Per-course topic completion stats."""

    courses: List[CourseCoverage]


class WeeklyWorkloadResponse(BaseModel):
    """Estimated hours due this week and next."""

    this_week_hours: float
    this_week_items: int
    next_week_hours: float
    next_week_items: int
    week_start: str = Field(..., description="ISO date of week start (Monday)")