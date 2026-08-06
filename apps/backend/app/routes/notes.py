"""Note routes — CRUD for markdown notes with wikilinks and backlinks."""

import re
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.note import Note
from app.models.note_link import NoteLink
from app.models.course import Course
from app.models.roadmap_node import RoadmapNode
from app.models.topic import Topic
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteWithBacklinks, NoteSearchResponse
from app.services.streak_service import StreakService

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=List[NoteResponse])
async def list_notes(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """List all notes for the current user."""
    result = await db.execute(
        select(Note)
        .where(Note.user_id == current_user.id)
        .order_by(Note.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/courses/{course_id}", response_model=List[NoteResponse])
async def list_course_notes(
    course_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """List all notes for a specific course."""
    # Verify course ownership
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")

    result = await db.execute(
        select(Note)
        .where(Note.course_id == course_id, Note.user_id == current_user.id)
        .order_by(Note.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new note. Optionally attach to course/node/topic."""
    # Validate attachment targets if provided
    if note_in.course_id is not None:
        result = await db.execute(
            select(Course).where(Course.id == note_in.course_id, Course.user_id == current_user.id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Course not found")

    if note_in.roadmap_node_id is not None:
        result = await db.execute(
            select(RoadmapNode).where(RoadmapNode.id == note_in.roadmap_node_id, RoadmapNode.user_id == current_user.id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Roadmap node not found")

    if note_in.topic_id is not None:
        result = await db.execute(
            select(Topic).where(Topic.id == note_in.topic_id, Topic.user_id == current_user.id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Topic not found")

    note = Note(
        user_id=current_user.id,
        course_id=note_in.course_id,
        roadmap_node_id=note_in.roadmap_node_id,
        topic_id=note_in.topic_id,
        title=note_in.title,
        content=note_in.content,
        is_stub=False,
    )
    db.add(note)
    await db.flush()
    if note.content:
        await _parse_wikilinks(note, db)
        await db.flush()
    await db.refresh(note)

    # Log activity for streak tracking
    await StreakService.log_activity(
        user_id=current_user.id,
        action_count=1,
        db=db,
    )

    return note


@router.get("/{note_id}", response_model=NoteWithBacklinks)
async def get_note(
    note_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single note with backlink information."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Get backlinks - notes that link TO this note
    backlinks_result = await db.execute(
        select(Note.id, Note.title)
        .select_from(NoteLink)
        .join(Note, Note.id == NoteLink.source_note_id)
        .where(NoteLink.target_note_id == note_id, Note.user_id == current_user.id)
    )
    backlinks = [{"id": row[0], "title": row[1]} for row in backlinks_result.fetchall()]

    return NoteWithBacklinks(
        id=note.id,
        user_id=note.user_id,
        course_id=note.course_id,
        roadmap_node_id=note.roadmap_node_id,
        topic_id=note.topic_id,
        title=note.title,
        content=note.content,
        is_stub=note.is_stub,
        is_quick_capture=note.is_quick_capture,
        created_at=note.created_at,
        updated_at=note.updated_at,
        backlinks=backlinks,
    )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_in: NoteUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a note's title or content. Parses wikilinks on content update."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Update fields
    update_data = note_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)

    if note.is_stub and note.content and note.content.strip():
        note.is_stub = False

    # Handle wikilink parsing on content update
    if "content" in update_data:
        await _parse_wikilinks(note, db)

    await db.flush()
    await db.refresh(note)

    # Log activity for streak tracking
    await StreakService.log_activity(
        user_id=current_user.id,
        action_count=1,
        db=db,
    )

    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a note and its associated links."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Delete links where this note is the source
    await db.execute(delete(NoteLink).where(NoteLink.source_note_id == note_id))
    await db.delete(note)


async def _parse_wikilinks(note: Note, db: AsyncSession) -> None:
    """
    Parse [[wikilink]] syntax in note content and create NoteLink entries.
    Creates stub notes for referenced titles that do not yet exist.
    Also removes links to notes that are no longer referenced.
    """
    # Find all [[note title]] patterns
    matches = re.findall(r'\[\[([^\]]+)\]\]', note.content or "")

    # Get current link targets
    existing_links = await db.execute(
        select(NoteLink.target_note_id).where(NoteLink.source_note_id == note.id)
    )
    existing_target_ids = {row[0] for row in existing_links.fetchall()}

    # Find or create target notes by title (case-insensitive match)
    target_ids = set()
    for title in matches:
        title_clean = title.strip()
        if not title_clean:
            continue
        target_result = await db.execute(
            select(Note).where(
                Note.user_id == note.user_id,
                func.lower(Note.title) == title_clean.lower()
            )
        )
        target_note = target_result.scalar_one_or_none()

        # If note doesn't exist and isn't a self-reference, create a stub note
        if not target_note and title_clean.lower() != note.title.strip().lower():
            target_note = Note(
                user_id=note.user_id,
                course_id=note.course_id,
                title=title_clean,
                content="",
                is_stub=True,
            )
            db.add(target_note)
            await db.flush()

        if target_note and target_note.id != note.id:
            target_ids.add(target_note.id)
            # Create link if not exists
            if target_note.id not in existing_target_ids:
                link = NoteLink(source_note_id=note.id, target_note_id=target_note.id)
                db.add(link)
                existing_target_ids.add(target_note.id)

    # Remove links to notes that are no longer in content
    to_remove = existing_target_ids - target_ids
    for target_id in to_remove:
        await db.execute(
            delete(NoteLink).where(
                NoteLink.source_note_id == note.id,
                NoteLink.target_note_id == target_id
            )
        )


@router.get("/search", response_model=List[NoteSearchResponse])
async def search_notes(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Full-text search across user's notes using PostgreSQL GIN index."""
    search_query = func.to_tsquery('english', q + ':*')  # Prefix search

    result = await db.execute(
        select(Note)
        .where(Note.user_id == current_user.id)
        .where(
            func.to_tsvector('english', Note.title + ' ' + func.coalesce(Note.content, ''))
            .op('@@')(search_query)
        )
        .order_by(
            func.ts_rank(
                func.to_tsvector('english', Note.title + ' ' + func.coalesce(Note.content, '')),
                search_query
            ).desc()
        )
        .limit(limit)
    )

    notes = result.scalars().all()

    responses = []
    for note in notes:
        content = note.content or ""
        snippet = content[:200] + "..." if len(content) > 200 else content

        responses.append(NoteSearchResponse(
            id=note.id,
            title=note.title,
            content=content,
            snippet=snippet,
        ))

    return responses


@router.get("/backlinks/{note_id}", response_model=List[NoteResponse])
async def get_note_backlinks(
    note_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all notes that link to the specified note."""
    # Verify note exists
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Note not found")

    # Get source notes that link to this note
    result = await db.execute(
        select(Note)
        .join(NoteLink, NoteLink.source_note_id == Note.id)
        .where(NoteLink.target_note_id == note_id, Note.user_id == current_user.id)
        .order_by(Note.title)
    )

    return result.scalars().all()