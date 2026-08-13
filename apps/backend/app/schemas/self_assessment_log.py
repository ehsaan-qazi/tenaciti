"""Self-assessment log schemas — request/response models for roadmap node submissions."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SelfAssessmentLogCreate(BaseModel):
    """Create a self-assessment log when submitting a roadmap node."""
    quality_self_rating: int = Field(..., ge=1, le=5, description="Self-rated quality of work (1-5)")
    mood_energy: Optional[int] = Field(None, ge=1, le=5, description="Mood/energy level during work (1-5)")
    reflection_note: Optional[str] = Field(None, max_length=5000, description="Optional reflection on the work")
    actual_hours: Optional[float] = Field(None, ge=0, description="Actual hours spent on the assessment")
    # hours_before_deadline is computed server-side from submitted_at vs deadline


class SelfAssessmentLogUpdate(BaseModel):
    """Update self-assessment log fields."""
    quality_self_rating: Optional[int] = Field(None, ge=1, le=5)
    mood_energy: Optional[int] = Field(None, ge=1, le=5)
    reflection_note: Optional[str] = Field(None, max_length=5000)
    actual_hours: Optional[float] = Field(None, ge=0)


class SelfAssessmentLogResponse(BaseModel):
    """Full self-assessment log returned to client."""
    id: int
    roadmap_node_id: int
    user_id: int
    quality_self_rating: int
    mood_energy: Optional[int] = None
    reflection_note: Optional[str] = None
    hours_before_deadline: Optional[float] = None
    actual_hours: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    # Computed fields (not stored in DB, calculated on response)
    confidence_gap: Optional[float] = None  # quality_self_rating - confidence_at_creation
    hours_gap: Optional[float] = None       # actual_hours - estimated_hours

    class Config:
        from_attributes = True


class RoadmapNodeSubmitRequest(BaseModel):
    """Request to mark a roadmap node as submitted with self-assessment."""
    actual_hours: Optional[float] = Field(None, ge=0)
    quality_self_rating: int = Field(..., ge=1, le=5)
    mood_energy: Optional[int] = Field(None, ge=1, le=5)
    reflection_note: Optional[str] = Field(None, max_length=5000)
    # status will be set to "Submitted" server-side


class SubmissionGapResponse(BaseModel):
    """Computed gap metrics for a submitted roadmap node."""
    node_id: int
    node_title: str
    confidence_gap: Optional[float] = None
    hours_gap: Optional[float] = None
    hours_before_deadline: Optional[float] = None
    quality_self_rating: int
    mood_energy: Optional[int] = None
    confidence_at_creation: Optional[int] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    submitted_at: Optional[datetime] = None
    deadline: Optional[datetime] = None

    class Config:
        from_attributes = True


class SelfAssessmentLogListItem(BaseModel):
    """Detailed log item with roadmap node and course context."""
    id: int
    roadmap_node_id: int
    node_title: Optional[str] = None
    course_id: Optional[int] = None
    course_name: Optional[str] = None
    quality_self_rating: int
    mood_energy: Optional[int] = None
    reflection_note: Optional[str] = None
    hours_before_deadline: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedSelfAssessmentLogResponse(BaseModel):
    """Paginated self-assessment log search response."""
    total_items: int
    total_pages: int
    current_page: int
    page_size: int
    items: list[SelfAssessmentLogListItem] = []


class SelfAssessmentBulkDeleteRequest(BaseModel):
    """Request payload for bulk deleting self-assessment logs."""
    log_ids: list[int] = Field(..., min_length=1, description="List of self-assessment log IDs to delete")


class SelfAssessmentBulkDeleteResponse(BaseModel):
    """Response payload for bulk log deletion."""
    deleted_count: int
    deleted_ids: list[int]