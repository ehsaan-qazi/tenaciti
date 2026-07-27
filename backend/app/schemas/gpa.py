"""GPA schemas — request/response models for GPA entries, summaries, and what-if calculations."""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class GpaEntryCreate(BaseModel):
    """Create a new GPA entry (course grade or historical semester)."""
    semester: str = Field(..., max_length=50)
    academic_year: Optional[str] = Field(None, max_length=20)
    entry_type: Literal["course", "historical"] = "course"
    course_id: Optional[int] = None
    course_label: str = Field(..., max_length=255, description="Display name (copied from course or typed)")
    credit_hours: float = Field(..., gt=0, le=20, description="Credit units for this course/semester")
    grade_letter: Optional[str] = Field(None, max_length=5, description="Letter grade (A+, A, A-, B+, etc.)")
    percentage: Optional[float] = Field(None, ge=0, le=100, description="Percentage score (0-100)")
    grade_scale: Literal["4.0", "5.0", "10"] = "4.0"


class GpaEntryUpdate(BaseModel):
    """Update GPA entry fields."""
    semester: Optional[str] = Field(None, max_length=50)
    academic_year: Optional[str] = Field(None, max_length=20)
    entry_type: Optional[Literal["course", "historical"]] = None
    course_id: Optional[int] = None
    course_label: Optional[str] = Field(None, max_length=255)
    credit_hours: Optional[float] = Field(None, gt=0, le=20)
    grade_letter: Optional[str] = Field(None, max_length=5)
    percentage: Optional[float] = Field(None, ge=0, le=100)
    grade_scale: Optional[Literal["4.0", "5.0", "10"]] = None


class GpaEntryResponse(BaseModel):
    """Full GPA entry returned to client."""
    id: int
    user_id: int
    semester: str
    academic_year: Optional[str] = None
    entry_type: str
    course_id: Optional[int] = None
    course_label: str
    credit_hours: float
    grade_letter: Optional[str] = None
    percentage: Optional[float] = None
    grade_scale: str
    # Computed
    grade_points: Optional[float] = None  # Numeric value of grade on the scale
    quality_points: Optional[float] = None  # credit_hours * grade_points
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SemesterGpaSummary(BaseModel):
    """Aggregated GPA for a single semester."""
    semester: str
    academic_year: Optional[str] = None
    total_credits: float
    total_quality_points: float
    gpa: float
    entry_count: int
    entries: List[GpaEntryResponse] = []


class CumulativeGpaSummary(BaseModel):
    """Full CGPA summary across all semesters."""
    semesters: List[SemesterGpaSummary]
    cumulative_gpa: float
    total_credits: float
    total_quality_points: float


class WhatIfScenario(BaseModel):
    """A single what-if scenario for comparison."""
    name: str
    description: str
    projected_cgpa: float
    projected_credits: float
    grade_needed: Optional[float] = None  # For "what grade do I need" scenarios


class WhatIfRequest(BaseModel):
    """Request to calculate what-if scenarios."""
    target_cgpa: Optional[float] = Field(None, ge=0, le=10, description="Target CGPA to achieve")
    target_semester_gpa: Optional[float] = Field(None, ge=0, le=10, description="Target current semester GPA")
    remaining_credits: float = Field(..., gt=0, description="Credits remaining this semester")
    grade_scale: Literal["4.0", "5.0", "10"] = "4.0"
    scenarios: Optional[List[dict]] = Field(None, description="Custom scenarios to evaluate")


class WhatIfResponse(BaseModel):
    """What-if calculation results."""
    current_cgpa: float
    current_credits: float
    scenarios: List[WhatIfScenario]
    grade_needed_for_target: Optional[float] = None  # Average grade needed on remaining credits
    is_target_achievable: Optional[bool] = None


class GpaGoalStatus(BaseModel):
    """Status of a GPA-linked goal."""
    goal_id: int
    title: str
    target_gpa: float
    current_gpa: float
    gap: float
    is_met: bool
    semester: Optional[str] = None