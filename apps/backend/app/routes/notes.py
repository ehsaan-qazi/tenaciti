"""Note routes — CRUD for markdown notes with wikilinks and backlinks."""

import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

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

@router.get("/search", response_model=List[NoteSearchResponse])
async def search_notes(
    q: Optional[str] = Query(None, description="Search text query"),
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    date_from: Optional[datetime] = Query(None, description="Filter updated on or after date"),
    date_to: Optional[datetime] = Query(None, description="Filter updated on or before date"),
    sort_by: str = Query("relevance", pattern="^(relevance|date_desc|date_asc|title_asc|title_desc)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Advanced search, filtering, and sorting across user notes.
    Supports course filter, date range, sort order, and safe websearch_to_tsquery + ILIKE fallback.
    """
    query_stmt = select(Note).where(Note.user_id == current_user.id)

    # 1. Course Filter
    if course_id is not None:
        query_stmt = query_stmt.where(Note.course_id == course_id)

    # 2. Date Range Filters
    if date_from is not None:
        query_stmt = query_stmt.where(Note.updated_at >= date_from)
    if date_to is not None:
        query_stmt = query_stmt.where(Note.updated_at <= date_to)

    # 3. Search Query Matching (tsvector / websearch_to_tsquery with ILIKE fallback)
    search_term = q.strip() if q else ""
    rank_expr = None

    if search_term:
        try:
            # Use websearch_to_tsquery (safe parser for user input strings)
            ts_query = func.websearch_to_tsquery('english', search_term)
            ts_vector = func.to_tsvector('english', Note.title + ' ' + func.coalesce(Note.content, ''))
            rank_expr = func.ts_rank(ts_vector, ts_query)

            # Add tsvector match condition
            search_where = ts_vector.op('@@')(ts_query)
            query_stmt = query_stmt.where(search_where)
        except Exception:
            # Fallback to safe ILIKE
            ilike_pattern = f"%{search_term}%"
            query_stmt = query_stmt.where(
                (Note.title.ilike(ilike_pattern)) | (Note.content.ilike(ilike_pattern))
            )

    # 4. Sorting
    if sort_by == "relevance" and rank_expr is not None:
        query_stmt = query_stmt.order_by(rank_expr.desc(), Note.updated_at.desc())
    elif sort_by == "date_asc":
        query_stmt = query_stmt.order_by(Note.updated_at.asc())
    elif sort_by == "title_asc":
        query_stmt = query_stmt.order_by(Note.title.asc())
    elif sort_by == "title_desc":
        query_stmt = query_stmt.order_by(Note.title.desc())
    else:  # date_desc or fallback
        query_stmt = query_stmt.order_by(Note.updated_at.desc())

    # 5. Pagination
    query_stmt = query_stmt.offset(offset).limit(limit)

    result = await db.execute(query_stmt)
    notes = result.scalars().all()

    # Fallback search check: If tsvector returned zero results and query term is non-empty, try ILIKE
    if not notes and search_term and rank_expr is not None:
        ilike_stmt = select(Note).where(
            Note.user_id == current_user.id,
            (Note.title.ilike(f"%{search_term}%")) | (Note.content.ilike(f"%{search_term}%"))
        )
        if course_id is not None:
            ilike_stmt = ilike_stmt.where(Note.course_id == course_id)
        if date_from is not None:
            ilike_stmt = ilike_stmt.where(Note.updated_at >= date_from)
        if date_to is not None:
            ilike_stmt = ilike_stmt.where(Note.updated_at <= date_to)
        ilike_stmt = ilike_stmt.order_by(Note.updated_at.desc()).offset(offset).limit(limit)
        ilike_res = await db.execute(ilike_stmt)
        notes = ilike_res.scalars().all()

    # Build response with snippets
    responses = []
    for note in notes:
        content = note.content or ""
        snippet = None
        if search_term and search_term.lower() in content.lower():
            idx = content.lower().find(search_term.lower())
            start = max(0, idx - 40)
            end = min(len(content), idx + len(search_term) + 60)
            snippet = ("..." if start > 0 else "") + content[start:end] + ("..." if end < len(content) else "")
        else:
            snippet = content[:150] + "..." if len(content) > 150 else content

        responses.append(NoteSearchResponse(
            id=note.id,
            title=note.title,
            content=content,
            snippet=snippet,
            course_id=note.course_id,
            topic_id=note.topic_id,
            roadmap_node_id=note.roadmap_node_id,
            is_stub=note.is_stub,
            is_quick_capture=note.is_quick_capture,
            created_at=note.created_at,
            updated_at=note.updated_at,
        ))

    return responses


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