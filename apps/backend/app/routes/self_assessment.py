"""Self-assessment log routes — submission flow with quality/confidence gap tracking."""

import csv
import io
import math
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.roadmap_node import RoadmapNode
from app.models.self_assessment_log import SelfAssessmentLog
from app.models.course import Course
from app.schemas.self_assessment_log import (
    SelfAssessmentLogResponse,
    SelfAssessmentLogUpdate,
    RoadmapNodeSubmitRequest,
    SubmissionGapResponse,
    SelfAssessmentLogListItem,
    PaginatedSelfAssessmentLogResponse,
    SelfAssessmentBulkDeleteRequest,
    SelfAssessmentBulkDeleteResponse,
)
from app.services.streak_service import StreakService

router = APIRouter(prefix="/self-assessment", tags=["Self-Assessment"])


@router.post("/nodes/{node_id}/submit", response_model=SelfAssessmentLogResponse, status_code=status.HTTP_201_CREATED)
async def submit_roadmap_node(
    node_id: int,
    submission: RoadmapNodeSubmitRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a roadmap node as submitted and create self-assessment log.
    Computes hours-before-deadline and confidence/quality gap automatically.
    """
    # Verify node ownership
    result = await db.execute(
        select(RoadmapNode).where(
            RoadmapNode.id == node_id,
            RoadmapNode.user_id == current_user.id,
        )
    )
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Roadmap node not found")

    # Check if already submitted
    if node.status == "Submitted" or node.status == "Graded":
        raise HTTPException(status_code=400, detail="Node already submitted or graded")

    # Calculate hours_before_deadline
    hours_before_deadline = None
    if node.deadline:
        now = datetime.now(timezone.utc)
        delta = node.deadline - now
        hours_before_deadline = round(delta.total_seconds() / 3600, 2)

    # Create self-assessment log
    assessment = SelfAssessmentLog(
        roadmap_node_id=node_id,
        user_id=current_user.id,
        quality_self_rating=submission.quality_self_rating,
        mood_energy=submission.mood_energy,
        reflection_note=submission.reflection_note,
        hours_before_deadline=hours_before_deadline,
    )
    db.add(assessment)

    # Update node status and actual hours
    node.status = "Submitted"
    node.submitted_at = datetime.now(timezone.utc)
    if submission.actual_hours is not None:
        node.actual_hours = submission.actual_hours
    # confidence_at_creation is already on the node from extraction

    await db.flush()
    await db.refresh(assessment)

    # Update streak: log submission for on-time streak tracking
    await StreakService.log_submission(
        user_id=current_user.id,
        node_id=node.id,
        submitted_at=node.submitted_at,
        deadline=node.deadline,
        db=db,
    )

    return assessment


@router.get("/nodes/{node_id}", response_model=SelfAssessmentLogResponse)
async def get_self_assessment(
    node_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the self-assessment log for a roadmap node."""
    # Verify node ownership
    result = await db.execute(
        select(RoadmapNode).where(
            RoadmapNode.id == node_id,
            RoadmapNode.user_id == current_user.id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Roadmap node not found")

    result = await db.execute(
        select(SelfAssessmentLog).where(
            SelfAssessmentLog.roadmap_node_id == node_id,
            SelfAssessmentLog.user_id == current_user.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Self-assessment not found for this node")
    return assessment


@router.put("/nodes/{node_id}", response_model=SelfAssessmentLogResponse)
async def update_self_assessment(
    node_id: int,
    update_in: SelfAssessmentLogUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Update self-assessment log (reflection note, mood, etc.)."""
    result = await db.execute(
        select(SelfAssessmentLog).where(
            SelfAssessmentLog.roadmap_node_id == node_id,
            SelfAssessmentLog.user_id == current_user.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Self-assessment not found")

    update_data = update_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(assessment, key, value)

    await db.flush()
    await db.refresh(assessment)
    return assessment


@router.get("/nodes/{node_id}/gap", response_model=SubmissionGapResponse)
async def get_submission_gap(
    node_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get computed gap metrics for a submitted node:
    - confidence_gap: creation confidence vs submission quality
    - hours_gap: estimated vs actual hours
    - hours_before_deadline: timeliness indicator
    """
    # Verify node ownership and get assessment
    result = await db.execute(
        select(RoadmapNode, SelfAssessmentLog)
        .join(SelfAssessmentLog, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
        .where(RoadmapNode.id == node_id, RoadmapNode.user_id == current_user.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Node or assessment not found")

    node, assessment = row

    confidence_gap = None
    if node.confidence_at_creation is not None and assessment.quality_self_rating is not None:
        # Normalize confidence_at_creation (1-5) to same scale as quality_self_rating (1-5)
        confidence_gap = round(assessment.quality_self_rating - node.confidence_at_creation, 2)

    hours_gap = None
    if node.estimated_hours is not None and node.actual_hours is not None:
        hours_gap = round(node.actual_hours - node.estimated_hours, 2)

    return SubmissionGapResponse(
        node_id=node.id,
        node_title=node.title,
        confidence_gap=confidence_gap,
        hours_gap=hours_gap,
        hours_before_deadline=assessment.hours_before_deadline,
        quality_self_rating=assessment.quality_self_rating,
        mood_energy=assessment.mood_energy,
        confidence_at_creation=node.confidence_at_creation,
        estimated_hours=node.estimated_hours,
        actual_hours=node.actual_hours,
        submitted_at=node.submitted_at,
        deadline=node.deadline,
    )


@router.get("/user/summary", response_model=List[SubmissionGapResponse])
async def get_user_submission_gaps(
    page: Optional[int] = Query(None, ge=1, description="Optional page number"),
    page_size: Optional[int] = Query(None, ge=1, le=100, description="Optional page size"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all submission gaps for the current user (with optional pagination)."""
    stmt = (
        select(RoadmapNode, SelfAssessmentLog)
        .join(SelfAssessmentLog, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
        .where(RoadmapNode.user_id == current_user.id)
        .order_by(RoadmapNode.submitted_at.desc().nullslast())
    )

    if page is not None and page_size is not None:
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    rows = result.all()

    gaps = []
    for node, assessment in rows:
        confidence_gap = None
        if node.confidence_at_creation is not None and assessment.quality_self_rating is not None:
            confidence_gap = round(assessment.quality_self_rating - node.confidence_at_creation, 2)

        hours_gap = None
        if node.estimated_hours is not None and node.actual_hours is not None:
            hours_gap = round(node.actual_hours - node.estimated_hours, 2)

        gaps.append(SubmissionGapResponse(
            node_id=node.id,
            node_title=node.title,
            confidence_gap=confidence_gap,
            hours_gap=hours_gap,
            hours_before_deadline=assessment.hours_before_deadline,
            quality_self_rating=assessment.quality_self_rating,
            mood_energy=assessment.mood_energy,
            confidence_at_creation=node.confidence_at_creation,
            estimated_hours=node.estimated_hours,
            actual_hours=node.actual_hours,
            submitted_at=node.submitted_at,
            deadline=node.deadline,
        ))

    return gaps


@router.get("/logs", response_model=PaginatedSelfAssessmentLogResponse)
async def list_self_assessment_logs(
    course_id: Optional[int] = Query(None, description="Filter logs by course ID"),
    node_id: Optional[int] = Query(None, description="Filter logs by roadmap node ID"),
    min_rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by minimum quality self-rating"),
    max_rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by maximum quality self-rating"),
    date_from: Optional[datetime] = Query(None, description="Filter logs created on or after date"),
    date_to: Optional[datetime] = Query(None, description="Filter logs created on or before date"),
    sort_by: str = Query(
        "created_desc",
        pattern="^(created_desc|created_asc|rating_desc|rating_asc|hours_before_deadline_asc)$",
        description="Sort order",
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Paginated, filterable, and sortable endpoint for self-assessment logs.
    Supports filtering by course, node, rating range, and date range.
    """
    # Base query joining SelfAssessmentLog, RoadmapNode, and Course
    stmt = (
        select(SelfAssessmentLog, RoadmapNode, Course)
        .outerjoin(RoadmapNode, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
        .outerjoin(Course, RoadmapNode.course_id == Course.id)
        .where(SelfAssessmentLog.user_id == current_user.id)
    )

    # Filtering
    if course_id is not None:
        stmt = stmt.where(RoadmapNode.course_id == course_id)
    if node_id is not None:
        stmt = stmt.where(SelfAssessmentLog.roadmap_node_id == node_id)
    if min_rating is not None:
        stmt = stmt.where(SelfAssessmentLog.quality_self_rating >= min_rating)
    if max_rating is not None:
        stmt = stmt.where(SelfAssessmentLog.quality_self_rating <= max_rating)
    if date_from is not None:
        stmt = stmt.where(SelfAssessmentLog.created_at >= date_from)
    if date_to is not None:
        stmt = stmt.where(SelfAssessmentLog.created_at <= date_to)

    # Count total matching rows
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_items = (await db.execute(count_stmt)).scalar() or 0

    # Sorting
    if sort_by == "created_asc":
        stmt = stmt.order_by(SelfAssessmentLog.created_at.asc())
    elif sort_by == "rating_desc":
        stmt = stmt.order_by(SelfAssessmentLog.quality_self_rating.desc(), SelfAssessmentLog.created_at.desc())
    elif sort_by == "rating_asc":
        stmt = stmt.order_by(SelfAssessmentLog.quality_self_rating.asc(), SelfAssessmentLog.created_at.desc())
    elif sort_by == "hours_before_deadline_asc":
        stmt = stmt.order_by(SelfAssessmentLog.hours_before_deadline.asc().nullslast())
    else:  # created_desc
        stmt = stmt.order_by(SelfAssessmentLog.created_at.desc())

    # Pagination
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for log, node, course in rows:
        items.append(
            SelfAssessmentLogListItem(
                id=log.id,
                roadmap_node_id=log.roadmap_node_id,
                node_title=node.title if node else None,
                course_id=course.id if course else (node.course_id if node else None),
                course_name=course.name if course else None,
                quality_self_rating=log.quality_self_rating,
                mood_energy=log.mood_energy,
                reflection_note=log.reflection_note,
                hours_before_deadline=log.hours_before_deadline,
                created_at=log.created_at,
                updated_at=log.updated_at,
            )
        )

    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0

    return PaginatedSelfAssessmentLogResponse(
        total_items=total_items,
        total_pages=total_pages,
        current_page=page,
        page_size=page_size,
        items=items,
    )


@router.delete("/logs/bulk", response_model=SelfAssessmentBulkDeleteResponse)
async def bulk_delete_self_assessment_logs(
    payload: SelfAssessmentBulkDeleteRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk delete multiple self-assessment logs by ID for the current user."""
    # Find matching logs owned by user
    stmt = select(SelfAssessmentLog.id).where(
        SelfAssessmentLog.id.in_(payload.log_ids),
        SelfAssessmentLog.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    valid_ids = [row[0] for row in result.all()]

    if not valid_ids:
        return SelfAssessmentBulkDeleteResponse(deleted_count=0, deleted_ids=[])

    # Delete valid logs
    del_stmt = delete(SelfAssessmentLog).where(SelfAssessmentLog.id.in_(valid_ids))
    await db.execute(del_stmt)
    await db.flush()

    return SelfAssessmentBulkDeleteResponse(
        deleted_count=len(valid_ids),
        deleted_ids=valid_ids,
    )


@router.get("/logs/export")
async def export_self_assessment_logs(
    format: str = Query("csv", pattern="^(csv|json)$", description="Export format: csv or json"),
    course_id: Optional[int] = Query(None, description="Optional course filter"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Export self-assessment logs history in CSV or JSON format.
    """
    stmt = (
        select(SelfAssessmentLog, RoadmapNode, Course)
        .outerjoin(RoadmapNode, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
        .outerjoin(Course, RoadmapNode.course_id == Course.id)
        .where(SelfAssessmentLog.user_id == current_user.id)
    )

    if course_id is not None:
        stmt = stmt.where(RoadmapNode.course_id == course_id)

    stmt = stmt.order_by(SelfAssessmentLog.created_at.desc())
    result = await db.execute(stmt)
    rows = result.all()

    if format == "json":
        json_data = []
        for log, node, course in rows:
            json_data.append({
                "id": log.id,
                "roadmap_node_id": log.roadmap_node_id,
                "node_title": node.title if node else None,
                "course_id": course.id if course else (node.course_id if node else None),
                "course_name": course.name if course else None,
                "quality_self_rating": log.quality_self_rating,
                "mood_energy": log.mood_energy,
                "reflection_note": log.reflection_note,
                "hours_before_deadline": log.hours_before_deadline,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "updated_at": log.updated_at.isoformat() if log.updated_at else None,
            })
        return json_data

    # Generate CSV
    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow([
        "Log ID",
        "Node ID",
        "Node Title",
        "Course ID",
        "Course Name",
        "Quality Self Rating",
        "Mood/Energy Level",
        "Reflection Note",
        "Hours Before Deadline",
        "Created At",
        "Updated At",
    ])

    for log, node, course in rows:
        writer.writerow([
            log.id,
            log.roadmap_node_id,
            node.title if node else "",
            course.id if course else (node.course_id if node else ""),
            course.name if course else "",
            log.quality_self_rating,
            log.mood_energy if log.mood_energy is not None else "",
            log.reflection_note if log.reflection_note else "",
            log.hours_before_deadline if log.hours_before_deadline is not None else "",
            log.created_at.isoformat() if log.created_at else "",
            log.updated_at.isoformat() if log.updated_at else "",
        ])

    csv_output = csv_buffer.getvalue()
    return Response(
        content=csv_output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=self_assessment_logs.csv"},
    )