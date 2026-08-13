from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.course import Course
from app.models.document import Document
from app.models.roadmap_node import RoadmapNode
from app.models.topic import Topic
from app.models.note import Note
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.activity import ActivityItem, CourseActivityResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseResponse])
async def list_courses(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Course).where(Course.user_id == current_user.id).order_by(Course.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    course = Course(**course_in.model_dump(), user_id=current_user.id)
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)

    await db.commit()
    await db.refresh(course)
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    await db.delete(course)
    await db.commit()


@router.get("/{course_id}/activity", response_model=CourseActivityResponse)
async def get_course_activity(
    course_id: int,
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a unified chronological activity feed for a course.
    Collects events across documents, roadmap nodes, topics, and notes.
    """
    # Verify course ownership
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    items: list[ActivityItem] = []

    # 1. Documents
    docs_result = await db.execute(
        select(Document)
        .where(Document.course_id == course_id, Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .limit(limit)
    )
    for doc in docs_result.scalars().all():
        # Upload event
        items.append(ActivityItem(
            id=f"doc_upload_{doc.id}",
            entity_type="document",
            entity_id=doc.id,
            action="uploaded",
            title=f"{doc.original_filename} uploaded",
            description=f"Document type: {doc.doc_type.replace('_', ' ').title()}",
            badge_label="Uploaded",
            badge_color="info",
            timestamp=doc.uploaded_at,
        ))
        # Processing completion event (if processed)
        if doc.processing_status == "processed" and doc.processed_at:
            items.append(ActivityItem(
                id=f"doc_extracted_{doc.id}",
                entity_type="document",
                entity_id=doc.id,
                action="extracted",
                title=f"{doc.original_filename} extracted successfully",
                description=f"{doc.doc_type.replace('_', ' ').title()} AI extraction complete",
                badge_label="Extraction Complete",
                badge_color="success",
                timestamp=doc.processed_at,
            ))
        elif doc.processing_status == "failed":
            items.append(ActivityItem(
                id=f"doc_failed_{doc.id}",
                entity_type="document",
                entity_id=doc.id,
                action="failed",
                title=f"{doc.original_filename} extraction failed",
                description=doc.error_message or "Extraction failed",
                badge_label="Failed",
                badge_color="error",
                timestamp=doc.updated_at,
            ))

    # 2. Roadmap Nodes
    nodes_result = await db.execute(
        select(RoadmapNode)
        .where(RoadmapNode.course_id == course_id, RoadmapNode.user_id == current_user.id)
        .order_by(RoadmapNode.created_at.desc())
        .limit(limit)
    )
    for node in nodes_result.scalars().all():
        if node.submitted_at:
            items.append(ActivityItem(
                id=f"node_submitted_{node.id}",
                entity_type="roadmap_node",
                entity_id=node.id,
                action="submitted",
                title=f"Submitted: {node.title}",
                description=f"Type: {node.node_type}" + (f" · Grade: {node.grade}%" if node.grade is not None else ""),
                badge_label="Submitted",
                badge_color="success",
                timestamp=node.submitted_at,
            ))
        items.append(ActivityItem(
            id=f"node_created_{node.id}",
            entity_type="roadmap_node",
            entity_id=node.id,
            action="created",
            title=f"Assessment item added: {node.title}",
            description=f"Type: {node.node_type}" + (f" · Weight: {node.weight_percent}%" if node.weight_percent else ""),
            badge_label=node.node_type,
            badge_color="info",
            timestamp=node.created_at,
        ))

    # 3. Topics
    topics_result = await db.execute(
        select(Topic)
        .where(Topic.course_id == course_id, Topic.user_id == current_user.id)
        .order_by(Topic.created_at.desc())
        .limit(limit)
    )
    for topic in topics_result.scalars().all():
        items.append(ActivityItem(
            id=f"topic_created_{topic.id}",
            entity_type="topic",
            entity_id=topic.id,
            action="created",
            title=f"Topic added: {topic.title}",
            description="Confirmed topic" if topic.is_confirmed else "Extracted topic pending review",
            badge_label="Topic",
            badge_color="warning" if not topic.is_confirmed else "info",
            timestamp=topic.created_at,
        ))

    # 4. Notes
    notes_result = await db.execute(
        select(Note)
        .where(Note.course_id == course_id, Note.user_id == current_user.id)
        .order_by(Note.updated_at.desc())
        .limit(limit)
    )
    for note in notes_result.scalars().all():
        items.append(ActivityItem(
            id=f"note_updated_{note.id}",
            entity_type="note",
            entity_id=note.id,
            action="updated",
            title=f"Note updated: {note.title}",
            description="Markdown study note",
            badge_label="Note",
            badge_color="info",
            timestamp=note.updated_at,
        ))

    # Sort descending by timestamp
    items.sort(key=lambda x: x.timestamp.timestamp() if x.timestamp else 0, reverse=True)
    trimmed = items[:limit]

    return CourseActivityResponse(items=trimmed, total=len(trimmed))

