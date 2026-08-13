"""Global search schemas — unified search across courses, notes, goals, roadmap nodes."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SearchResultItem(BaseModel):
    """A single search result from any entity type."""
    entity_type: str = Field(..., description="Type of entity: course, note, goal, roadmap_node")
    entity_id: int = Field(..., description="Primary key of the matched entity")
    title: str = Field(..., description="Display title of the matched entity")
    snippet: Optional[str] = Field(None, description="Short preview text / context snippet")
    course_name: Optional[str] = Field(None, description="Parent course name, if applicable")
    course_id: Optional[int] = Field(None, description="Parent course ID, if applicable")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    relevance: float = Field(0.0, description="Relevance score for ordering (higher = better)")


class SearchResponse(BaseModel):
    """Response wrapper for global search results."""
    query: str
    total: int
    items: List[SearchResultItem] = []
