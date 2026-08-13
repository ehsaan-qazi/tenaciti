"""Notification schemas — computed notifications from existing data."""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


NotificationType = Literal[
    "deadline_approaching",
    "deadline_overdue",
    "document_processed",
    "document_failed",
    "streak_milestone",
    "streak_at_risk",
]


class NotificationItem(BaseModel):
    """A single computed notification."""
    id: str = Field(..., description="Stable identifier for dedup (e.g. 'deadline_overdue_42')")
    type: NotificationType
    title: str
    message: str
    severity: Literal["info", "warning", "error", "success"] = "info"
    entity_type: Optional[str] = Field(None, description="Related entity type (course, roadmap_node, document)")
    entity_id: Optional[int] = Field(None, description="Related entity primary key")
    course_id: Optional[int] = Field(None, description="Related course ID for navigation")
    timestamp: datetime = Field(..., description="When the event occurred or is relevant")


class NotificationListResponse(BaseModel):
    """Response wrapper for notification list."""
    items: List[NotificationItem] = []
    total: int = 0
    unread_count: int = Field(0, description="Count of non-dismissed notifications")


class UnreadCountResponse(BaseModel):
    """Lightweight response for badge count."""
    count: int = 0
