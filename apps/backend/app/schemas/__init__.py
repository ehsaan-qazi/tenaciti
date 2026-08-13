"""Schema exports for the Tenaciti API."""

# Auth schemas
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    MessageResponse,
    UserUpdate,
)

# Course schemas
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
)

# Document schemas
from app.schemas.document import (
    DocumentResponse,
    DocumentListItem,
)

# Topic schemas
from app.schemas.topic import (
    TopicCreate,
    TopicUpdate,
    TopicResponse,
    TopicWithCompletion,
    TopicToggle,
    TopicConfirm,
    TopicBulkReorder,
    TopicMerge,
    TopicLinkNode,
    TopicCompletionStats,
)

# Note schemas
from app.schemas.note import (
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    NoteWithBacklinks,
    NoteSearchResponse,
)

# Roadmap Node schemas
from app.schemas.roadmap_node import (
    RoadmapNodeCreate,
    RoadmapNodeUpdate,
    RoadmapNodeResponse,
)

# Self-Assessment schemas
from app.schemas.self_assessment_log import (
    SelfAssessmentLogCreate,
    SelfAssessmentLogUpdate,
    SelfAssessmentLogResponse,
    RoadmapNodeSubmitRequest,
    SubmissionGapResponse,
)

# Goal schemas
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalWithProgress,
)

# GPA schemas
from app.schemas.gpa import (
    GpaEntryCreate,
    GpaEntryUpdate,
    GpaEntryResponse,
    SemesterGpaSummary,
    CumulativeGpaSummary,
    WhatIfRequest,
    WhatIfResponse,
    WhatIfScenario,
    GpaGoalStatus,
)

# Streak schemas
from app.schemas.streak import (
    StreakSummaryResponse,
    HeatmapResponse,
    ActivityLogRequest,
    ActivityLogResponse,
    UpcomingDeadlinesResponse,
    TopicCoverageResponse,
    WeeklyWorkloadResponse,
)

# Profile & Retrospective schemas (Phase 7)
from app.schemas.profile import (
    ProfileSummaryResponse,
    PlanningAccuracyResponse,
    CoursePlanningAccuracy,
    ConfidenceTrendsResponse,
    CourseConfidenceTrend,
    ConfidenceTrendPoint,
    TopicCoverageTrendsResponse,
    CourseTopicCoverageTrend,
    TopicCoverageTrendPoint,
    NoteDensityCorrelationResponse,
    NoteDensityPoint,
    ProcrastinationFingerprintResponse,
    ProcrastinationBucket,
    RetrospectiveReportResponse,
    RetrospectiveSemesterSummary,
    RetrospectiveCourseDetail,
    RetrospectiveRequest,
    ProfileTrendsQuery,
)

# Search schemas
from app.schemas.search import (
    SearchResultItem,
    SearchResponse,
)

# Notification schemas
from app.schemas.notification import (
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
)

__all__ = [
    # Auth
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "UserResponse",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "VerifyEmailRequest",
    "MessageResponse",
    "UserUpdate",
    # Course
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    # Document
    "DocumentResponse",
    "DocumentListItem",
    # Topic
    "TopicCreate",
    "TopicUpdate",
    "TopicResponse",
    "TopicWithCompletion",
    "TopicToggle",
    "TopicConfirm",
    "TopicBulkReorder",
    "TopicMerge",
    "TopicLinkNode",
    "TopicCompletionStats",
    # Note
    "NoteCreate",
    "NoteUpdate",
    "NoteResponse",
    "NoteWithBacklinks",
    "NoteSearchResponse",
    # Roadmap Node
    "RoadmapNodeCreate",
    "RoadmapNodeUpdate",
    "RoadmapNodeResponse",
    # Self-Assessment
    "SelfAssessmentLogCreate",
    "SelfAssessmentLogUpdate",
    "SelfAssessmentLogResponse",
    "RoadmapNodeSubmitRequest",
    "SubmissionGapResponse",
    # Goal
    "GoalCreate",
    "GoalUpdate",
    "GoalResponse",
    "GoalWithProgress",
    # GPA
    "GpaEntryCreate",
    "GpaEntryUpdate",
    "GpaEntryResponse",
    "SemesterGpaSummary",
    "CumulativeGpaSummary",
    "WhatIfRequest",
    "WhatIfResponse",
    "WhatIfScenario",
    "GpaGoalStatus",
    # Streaks
    "StreakSummaryResponse",
    "HeatmapResponse",
    "ActivityLogRequest",
    "ActivityLogResponse",
    "UpcomingDeadlinesResponse",
    "TopicCoverageResponse",
    "WeeklyWorkloadResponse",
    # Profile & Retrospective (Phase 7)
    "ProfileSummaryResponse",
    "PlanningAccuracyResponse",
    "CoursePlanningAccuracy",
    "ConfidenceTrendsResponse",
    "CourseConfidenceTrend",
    "ConfidenceTrendPoint",
    "TopicCoverageTrendsResponse",
    "CourseTopicCoverageTrend",
    "TopicCoverageTrendPoint",
    "NoteDensityCorrelationResponse",
    "NoteDensityPoint",
    "ProcrastinationFingerprintResponse",
    "ProcrastinationBucket",
    "RetrospectiveReportResponse",
    "RetrospectiveSemesterSummary",
    "RetrospectiveCourseDetail",
    "RetrospectiveRequest",
    "ProfileTrendsQuery",
    # Search
    "SearchResultItem",
    "SearchResponse",
    # Notifications
    "NotificationItem",
    "NotificationListResponse",
    "UnreadCountResponse",
]