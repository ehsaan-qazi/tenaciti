"""Timeline schemas — response models for temporal notes grouping."""

from pydantic import BaseModel, Field
from typing import List
from app.schemas.note import NoteResponse


class TimelineGroup(BaseModel):
    """A chronological group of notes."""
    group_label: str = Field(..., description="Human-friendly date header (e.g. 'Today', 'Yesterday', 'Aug 12, 2026')")
    group_key: str = Field(..., description="ISO or sortable key (e.g. '2026-08-13')")
    note_count: int = 0
    notes: List[NoteResponse] = []


class TimelineResponse(BaseModel):
    """Response wrapper for timeline notes view."""
    group_by: str = Field("day", description="Grouping scale: day, week, month")
    total_notes: int = 0
    groups: List[TimelineGroup] = []
