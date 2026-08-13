"""Global search routes — unified search across courses, notes, goals, roadmap nodes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.course import Course
from app.models.note import Note
from app.models.goal import Goal
from app.models.roadmap_node import RoadmapNode
from app.schemas.search import SearchResultItem, SearchResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    types: Optional[str] = Query(
        None,
        description="Comma-separated entity types to search: courses,notes,goals,roadmap_nodes. Omit to search all.",
    ),
    limit: int = Query(20, ge=1, le=50, description="Max results to return"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Search across courses, notes, goals, and roadmap nodes.

    Returns a unified list of results sorted by relevance and recency.
    All results are scoped to the authenticated user.
    """
    search_term = q.strip()
    if not search_term:
        return SearchResponse(query=q, total=0, items=[])

    # Determine which entity types to search
    allowed_types = {"courses", "notes", "goals", "roadmap_nodes"}
    if types:
        requested = {t.strip().lower() for t in types.split(",")}
        search_types = requested & allowed_types
    else:
        search_types = allowed_types

    results: list[SearchResultItem] = []
    ilike_pattern = f"%{search_term}%"

    # ── Courses ──────────────────────────────────────────────────────────
    if "courses" in search_types:
        course_results = await db.execute(
            select(Course)
            .where(
                Course.user_id == current_user.id,
                (Course.name.ilike(ilike_pattern)) | (Course.code.ilike(ilike_pattern)),
            )
            .order_by(Course.updated_at.desc())
            .limit(limit)
        )
        for course in course_results.scalars().all():
            snippet_parts = []
            if course.code:
                snippet_parts.append(course.code)
            snippet_parts.append(f"{course.semester}")
            if course.academic_year:
                snippet_parts.append(course.academic_year)

            results.append(SearchResultItem(
                entity_type="course",
                entity_id=course.id,
                title=course.name,
                snippet=" · ".join(snippet_parts),
                course_name=course.name,
                course_id=course.id,
                updated_at=course.updated_at,
                relevance=_compute_ilike_relevance(search_term, course.name, course.code),
            ))

    # ── Notes (full-text search via tsvector) ────────────────────────────
    if "notes" in search_types:
        try:
            ts_query = func.to_tsquery("english", search_term + ":*")
            ts_vector = func.to_tsvector(
                "english", Note.title + " " + func.coalesce(Note.content, "")
            )
            ts_rank = func.ts_rank(ts_vector, ts_query)

            note_results = await db.execute(
                select(Note, ts_rank.label("rank"))
                .where(Note.user_id == current_user.id, ts_vector.op("@@")(ts_query))
                .order_by(ts_rank.desc())
                .limit(limit)
            )

            for note, rank in note_results.all():
                content = note.content or ""
                snippet = content[:150] + "..." if len(content) > 150 else content

                results.append(SearchResultItem(
                    entity_type="note",
                    entity_id=note.id,
                    title=note.title,
                    snippet=snippet,
                    course_id=note.course_id,
                    updated_at=note.updated_at,
                    relevance=float(rank) * 10,  # Scale tsvector rank for sorting
                ))
        except Exception:
            # Fallback to ILIKE if tsvector query fails (e.g. special characters)
            note_results = await db.execute(
                select(Note)
                .where(
                    Note.user_id == current_user.id,
                    (Note.title.ilike(ilike_pattern)) | (Note.content.ilike(ilike_pattern)),
                )
                .order_by(Note.updated_at.desc())
                .limit(limit)
            )
            for note in note_results.scalars().all():
                content = note.content or ""
                snippet = content[:150] + "..." if len(content) > 150 else content

                results.append(SearchResultItem(
                    entity_type="note",
                    entity_id=note.id,
                    title=note.title,
                    snippet=snippet,
                    course_id=note.course_id,
                    updated_at=note.updated_at,
                    relevance=_compute_ilike_relevance(search_term, note.title, note.content),
                ))

    # ── Goals ────────────────────────────────────────────────────────────
    if "goals" in search_types:
        goal_results = await db.execute(
            select(Goal)
            .where(
                Goal.user_id == current_user.id,
                (Goal.title.ilike(ilike_pattern))
                | (Goal.description.ilike(ilike_pattern)),
            )
            .order_by(Goal.updated_at.desc())
            .limit(limit)
        )
        for goal in goal_results.scalars().all():
            snippet_parts = [f"Status: {goal.status}"]
            if goal.semester:
                snippet_parts.append(goal.semester)
            if goal.is_gpa_goal and goal.gpa_target:
                snippet_parts.append(f"Target GPA: {goal.gpa_target}")

            results.append(SearchResultItem(
                entity_type="goal",
                entity_id=goal.id,
                title=goal.title,
                snippet=" · ".join(snippet_parts),
                updated_at=goal.updated_at,
                relevance=_compute_ilike_relevance(search_term, goal.title, goal.description),
            ))

    # ── Roadmap Nodes ────────────────────────────────────────────────────
    if "roadmap_nodes" in search_types:
        node_query = (
            select(RoadmapNode, Course.name.label("course_name"))
            .outerjoin(Course, Course.id == RoadmapNode.course_id)
            .where(
                RoadmapNode.user_id == current_user.id,
                RoadmapNode.title.ilike(ilike_pattern),
            )
            .order_by(RoadmapNode.updated_at.desc())
            .limit(limit)
        )
        node_results = await db.execute(node_query)
        for node, course_name in node_results.all():
            snippet_parts = [node.node_type, f"Status: {node.status}"]
            if node.deadline:
                snippet_parts.append(f"Due: {node.deadline.strftime('%b %d, %Y')}")

            results.append(SearchResultItem(
                entity_type="roadmap_node",
                entity_id=node.id,
                title=node.title,
                snippet=" · ".join(snippet_parts),
                course_name=course_name,
                course_id=node.course_id,
                updated_at=node.updated_at,
                relevance=_compute_ilike_relevance(search_term, node.title, None),
            ))

    # ── Sort and trim ────────────────────────────────────────────────────
    results.sort(key=lambda r: (-r.relevance, -(r.updated_at.timestamp() if r.updated_at else 0)))
    trimmed = results[:limit]

    # Backfill course_name for notes that have a course_id but no course_name
    course_ids_needed = {
        r.course_id for r in trimmed
        if r.course_id and not r.course_name
    }
    if course_ids_needed:
        course_lookup = await db.execute(
            select(Course.id, Course.name).where(
                Course.id.in_(course_ids_needed),
                Course.user_id == current_user.id,
            )
        )
        course_names = {row[0]: row[1] for row in course_lookup.all()}
        for item in trimmed:
            if item.course_id and not item.course_name:
                item.course_name = course_names.get(item.course_id)

    return SearchResponse(query=search_term, total=len(trimmed), items=trimmed)


def _compute_ilike_relevance(query: str, title: str | None, secondary: str | None) -> float:
    """
    Compute a simple relevance score for ILIKE-matched results.

    Scoring:
    - Exact title match: 10.0
    - Title starts with query: 8.0
    - Title contains query: 5.0
    - Secondary field contains query: 2.0
    - No match: 0.0
    """
    q = query.lower()
    score = 0.0

    if title:
        t = title.lower()
        if t == q:
            score = 10.0
        elif t.startswith(q):
            score = 8.0
        elif q in t:
            score = 5.0

    if secondary and q in (secondary or "").lower():
        score = max(score, 2.0)

    return score
