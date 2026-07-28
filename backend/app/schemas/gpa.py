"""GPA schemas — request/response models for GPA entries, summaries, what-if, and internal marks."""

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
    grade_letter: Optional[str] = Field(None, max_length=5, description="Letter grade (A, A-, B+, etc.)")
    percentage: Optional[float] = Field(None, ge=0, le=100, description="Percentage score (0-100)")
    grade_scale: str = Field(default="4.0", description="Always HEC 4.0 scale")


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
    grade_scale: Optional[str] = None


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
    grade_points: Optional[float] = None  # Numeric value on HEC 4.0 scale
    quality_points: Optional[float] = None  # credit_hours × grade_points
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
    grade_needed: Optional[float] = None


class WhatIfRequest(BaseModel):
    """Request to calculate what-if scenarios."""
    target_cgpa: Optional[float] = Field(None, ge=0, le=4.0, description="Target CGPA to achieve")
    target_semester_gpa: Optional[float] = Field(None, ge=0, le=4.0, description="Target current semester GPA")
    remaining_credits: float = Field(..., gt=0, description="Credits remaining this semester")
    grade_scale: str = "4.0"
    scenarios: Optional[List[dict]] = Field(None, description="Custom scenarios to evaluate")


class WhatIfResponse(BaseModel):
    """What-if calculation results."""
    current_cgpa: float
    current_credits: float
    scenarios: List[WhatIfScenario]
    grade_needed_for_target: Optional[float] = None
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


# ---------------------------------------------------------------------------
# Internal Marks Calculator
# ---------------------------------------------------------------------------

class InternalMarksRequest(BaseModel):
    """Request to calculate internal marks breakdown."""
    quizzes: Optional[List[Optional[float]]] = Field(None, description="Quiz scores (out of quiz_max each)")
    assignments: Optional[List[Optional[float]]] = Field(None, description="Assignment scores (out of assignment_max each)")
    midterm: Optional[float] = Field(None, ge=0, description="Midterm score")
    terminal: Optional[float] = Field(None, ge=0, description="Terminal exam score")
    quiz_max: float = Field(default=10.0, gt=0, description="Maximum marks per quiz")
    assignment_max: float = Field(default=10.0, gt=0, description="Maximum marks per assignment")
    midterm_max: float = Field(default=25.0, gt=0, description="Maximum marks for midterm")
    terminal_max: float = Field(default=50.0, gt=0, description="Maximum marks for terminal")
    has_lab: bool = Field(default=False, description="Whether this is a lab course")
    theory_percentage: Optional[float] = Field(None, ge=0, le=100, description="Theory marks percentage (for lab courses)")
    practical_percentage: Optional[float] = Field(None, ge=0, le=100, description="Practical/Lab marks percentage (for lab courses)")
    theory_credit_hours: Optional[float] = Field(None, gt=0, description="Theory credit hours (for lab courses)")
    practical_credit_hours: Optional[float] = Field(None, gt=0, description="Lab/practical credit hours (for lab courses)")


class InternalMarksResponse(BaseModel):
    """Internal marks calculation result."""
    quiz_average: Optional[float] = None
    assignment_average: Optional[float] = None
    midterm_percentage: Optional[float] = None
    terminal_percentage: Optional[float] = None
    internal_total: Optional[float] = None
    total_percentage: Optional[float] = None
    predicted_grade: Optional[str] = None
    predicted_gpa: Optional[float] = None
    has_lab: bool = False