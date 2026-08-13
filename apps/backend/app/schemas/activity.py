"""Activity schemas — course activity feed models."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ActivityItem(BaseModel):
    """A single activity item in a course feed."""
    id: str = Field(..., description="Unique ID for client key (e.g. 'doc_upload_12')")
    entity_type: str = Field(..., description="document, roadmap_node, topic, note")
    entity_id: int
    action: str = Field(..., description="uploaded, extracted, submitted, created, updated")
    title: str
    description: Optional[str] = None
    badge_label: Optional[str] = None
    badge_color: Optional[str] = Field("info", description="success, warning, error, info")
    timestamp: datetime


class CourseActivityResponse(BaseModel):
    """Response wrapper for course activity feed."""
    items: List[ActivityItem] = []
    total: int = 0
