"""Goal schemas — request/response models for semester goals with optional GPA targets."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class GoalCreate(BaseModel):
    """Create a new goal."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=100)
    semester: Optional[str] = Field(None, max_length=50)
    target_date: Optional[date] = None
    is_gpa_goal: bool = False
    gpa_target: Optional[float] = Field(None, ge=0, le=10)  # Support up to 10-point scale
    course_ids: List[int] = []  # Courses this goal is linked to


class GoalUpdate(BaseModel):
    """Update goal fields."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=100)
    semester: Optional[str] = Field(None, max_length=50)
    target_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(Active|Complete|Abandoned)$")
    is_gpa_goal: Optional[bool] = None
    gpa_target: Optional[float] = Field(None, ge=0, le=10)
    course_ids: Optional[List[int]] = None


class GoalResponse(BaseModel):
    """Full goal returned to client."""
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    semester: Optional[str] = None
    target_date: Optional[date] = None
    status: str
    is_gpa_goal: bool
    gpa_target: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    course_ids: List[int] = []  # Populated from goal_courses join

    class Config:
        from_attributes = True


class GoalWithProgress(GoalResponse):
    """Goal with computed progress metrics."""
    # For GPA goals: current GPA vs target
    current_gpa: Optional[float] = None
    gap: Optional[float] = None  # target - current (negative = above target)
    is_met: Optional[bool] = None
    # For course-linked goals: completion stats
    linked_courses_count: int = 0
    completed_nodes: int = 0
    total_nodes: int = 0