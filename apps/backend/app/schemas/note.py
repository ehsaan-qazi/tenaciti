"""Note schemas — request/response models for markdown notes."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    """Create a new note."""
    title: str
    content: str = ""
    course_id: Optional[int] = None
    roadmap_node_id: Optional[int] = None
    topic_id: Optional[int] = None


class NoteUpdate(BaseModel):
    """Update note fields."""
    title: Optional[str] = None
    content: Optional[str] = None


class NoteLinkInfo(BaseModel):
    """Info about a linked note (for backlinks display)."""
    id: int
    title: str


class NoteResponse(BaseModel):
    """Full note returned to client."""
    id: int
    user_id: int
    course_id: Optional[int] = None
    roadmap_node_id: Optional[int] = None
    topic_id: Optional[int] = None
    title: str
    content: str
    is_stub: bool
    is_quick_capture: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteWithBacklinks(NoteResponse):
    """Note with backlink information."""
    backlinks: list[NoteLinkInfo] = []


class NoteSearchResponse(BaseModel):
    """Search result with relevance score."""
    id: int
    title: str
    content: str
    snippet: Optional[str] = None  # Highlighted snippet of the match