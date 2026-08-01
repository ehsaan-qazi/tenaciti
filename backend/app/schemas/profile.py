"""
Profile & Retrospective schemas — Pydantic models for Phase 7 insights API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date


# ============================================================
# Profile Summary
# ============================================================

class ProfileSummaryResponse(BaseModel):
    """Overall profile summary with totals and rates."""

    total_nodes: int = Field(..., description="Total roadmap nodes across all courses")
    completed_nodes: int = Field(..., description="Nodes with status Submitted or Graded")
    pending_nodes: int = Field(..., description="Nodes with status Pending or In Progress")
    completion_rate: float = Field(..., description="Percentage of nodes completed")
    avg_estimated_hours: Optional[float] = Field(None, description="Average estimated hours per node")
    avg_actual_hours: Optional[float] = Field(None, description="Average actual hours per submitted node")
    total_courses: int = Field(..., description="Total active courses")
    total_topics: int = Field(..., description="Total topics across all courses")
    completed_topics: int = Field(..., description="Completed topics")
    topic_completion_rate: float = Field(..., description="Topic completion percentage")
    total_notes: int = Field(..., description="Total notes created")
    total_note_links: int = Field(..., description="Total bi-directional note links")


# ============================================================
# Planning Accuracy
# ============================================================

class CoursePlanningAccuracy(BaseModel):
    """Planning accuracy metrics for a single course."""

    course_id: int
    course_name: str
    course_code: Optional[str] = None
    total_nodes: int
    submitted_nodes: int
    avg_estimated_hours: Optional[float] = None
    avg_actual_hours: Optional[float] = None
    hours_gap: Optional[float] = Field(None, description="Average actual - estimated (positive = underestimated)")
    hours_gap_pct: Optional[float] = Field(None, description="Gap as percentage of estimated")
    accuracy_score: Optional[float] = Field(None, description="0-100 score: 100 = perfect estimation")


class PlanningAccuracyResponse(BaseModel):
    """Planning accuracy across all courses."""

    courses: List[CoursePlanningAccuracy]
    overall_avg_estimated: Optional[float] = None
    overall_avg_actual: Optional[float] = None
    overall_hours_gap: Optional[float] = None
    overall_accuracy_score: Optional[float] = None


# ============================================================
# Confidence Trends
# ============================================================

class ConfidenceTrendPoint(BaseModel):
    """Single data point in confidence trend."""

    date: str = Field(..., description="ISO date (YYYY-MM-DD)")
    avg_confidence_at_creation: float = Field(..., description="Average confidence_at_creation (1-5)")
    avg_extraction_confidence: Optional[float] = Field(None, description="Average extraction_confidence (0-1)")
    node_count: int


class CourseConfidenceTrend(BaseModel):
    """Confidence trend for a single course."""

    course_id: int
    course_name: str
    course_code: Optional[str] = None
    trend: List[ConfidenceTrendPoint]


class ConfidenceTrendsResponse(BaseModel):
    """Confidence trends across all courses."""

    courses: List[CourseConfidenceTrend]
    overall_trend: List[ConfidenceTrendPoint]


# ============================================================
# Topic Coverage Trends
# ============================================================

class TopicCoverageTrendPoint(BaseModel):
    """Single data point in topic coverage trend."""

    date: str = Field(..., description="ISO date (YYYY-MM-DD)")
    completed_topics: int
    total_topics: int
    coverage_pct: float


class CourseTopicCoverageTrend(BaseModel):
    """Topic coverage trend for a single course."""

    course_id: int
    course_name: str
    course_code: Optional[str] = None
    trend: List[TopicCoverageTrendPoint]


class TopicCoverageTrendsResponse(BaseModel):
    """Topic coverage trends across all courses."""

    courses: List[CourseTopicCoverageTrend]
    overall_trend: List[TopicCoverageTrendPoint]


# ============================================================
# Note-Density Correlation
# ============================================================

class NoteDensityPoint(BaseModel):
    """Correlation data point: notes per topic vs grade/quality."""

    topic_id: int
    topic_title: str
    course_id: int
    course_name: str
    notes_count: int
    note_links_count: int
    completion_confidence: Optional[int] = Field(None, description="Confidence rating on completion (1-5)")
    node_grade: Optional[float] = Field(None, description="Associated roadmap node grade (0-100)")
    node_quality_rating: Optional[int] = Field(None, description="Self-assessment quality rating (1-5)")


class NoteDensityCorrelationResponse(BaseModel):
    """Note density vs outcome correlation analysis."""

    data_points: List[NoteDensityPoint]
    correlation_notes_vs_grade: Optional[float] = Field(None, description="Pearson r: notes count vs node grade")
    correlation_links_vs_grade: Optional[float] = Field(None, description="Pearson r: note links vs node grade")
    correlation_notes_vs_quality: Optional[float] = Field(None, description="Pearson r: notes count vs quality rating")
    correlation_links_vs_quality: Optional[float] = Field(None, description="Pearson r: note links vs quality rating")
    summary: str = Field(..., description="Human-readable interpretation")


# ============================================================
# Procrastination Fingerprint
# ============================================================

class ProcrastinationBucket(BaseModel):
    """Single bucket in hours-before-deadline distribution."""

    range_label: str = Field(..., description="Human-readable range (e.g., '0-6 hrs', '1-3 days', '1+ week')")
    range_start_hours: float = Field(..., description="Start of range in hours before deadline")
    range_end_hours: Optional[float] = Field(None, description="End of range in hours (None = unbounded)")
    count: int = Field(..., description="Number of submissions in this bucket")
    percentage: float = Field(..., description="Percentage of total submissions")


class ProcrastinationFingerprintResponse(BaseModel):
    """Procrastination pattern analysis based on submission timing."""

    buckets: List[ProcrastinationBucket]
    avg_hours_before_deadline: Optional[float] = Field(None, description="Mean hours before deadline")
    median_hours_before_deadline: Optional[float] = Field(None, description="Median hours before deadline")
    on_time_rate: float = Field(..., description="Percentage submitted before deadline")
    early_submission_rate: float = Field(..., description="Percentage submitted >24h before deadline")
    last_minute_rate: float = Field(..., description="Percentage submitted <6h before deadline")
    total_submissions_analyzed: int
    interpretation: str = Field(..., description="Human-readable pattern description")


# ============================================================
# Retrospective Report
# ============================================================

class RetrospectiveSemesterSummary(BaseModel):
    """Summary for a single semester in retrospective."""

    semester: str
    academic_year: Optional[str] = None
    total_nodes: int
    completed_nodes: int
    completion_rate: float
    avg_grade: Optional[float] = None
    avg_quality_rating: Optional[float] = None
    avg_hours_before_deadline: Optional[float] = None
    total_estimated_hours: float
    total_actual_hours: float
    hours_gap: float
    topics_completed: int
    topics_total: int
    topic_coverage_pct: float
    notes_created: int
    note_links_created: int
    activity_streak_max: int
    on_time_streak_max: int


class RetrospectiveCourseDetail(BaseModel):
    """Per-course detail for retrospective."""

    course_id: int
    course_name: str
    course_code: Optional[str] = None
    semester: str
    nodes_completed: int
    nodes_total: int
    avg_grade: Optional[float] = None
    avg_quality: Optional[float] = None
    planning_accuracy_score: Optional[float] = None
    topic_coverage_pct: float
    notes_count: int
    note_links_count: int


class RetrospectiveReportResponse(BaseModel):
    """Complete retrospective report for a semester or all time."""

    user_id: int
    generated_at: str = Field(..., description="ISO datetime of report generation")
    period: str = Field(..., description="e.g., 'Fall 2026' or 'All Time'")
    semester_summaries: List[RetrospectiveSemesterSummary]
    course_details: List[RetrospectiveCourseDetail]
    overall_stats: Dict[str, Any] = Field(..., description="Aggregate stats across period")
    insights: List[str] = Field(..., description="Key insights generated from data")
    recommendations: List[str] = Field(..., description="Actionable recommendations")


# ============================================================
# Request/Query models
# ============================================================

class RetrospectiveRequest(BaseModel):
    """Request parameters for retrospective report."""

    semester: Optional[str] = Field(None, description="Specific semester (e.g., 'Fall')")
    academic_year: Optional[str] = Field(None, description="Academic year (e.g., '2026-2027')")
    include_all_time: bool = Field(False, description="If true, ignore semester/year and generate all-time report")


class ProfileTrendsQuery(BaseModel):
    """Query parameters for trend endpoints."""

    course_id: Optional[int] = Field(None, description="Filter to specific course")
    days: int = Field(90, ge=7, le=365, description="Number of days of history to include")