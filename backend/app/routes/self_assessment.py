"""Self-assessment log routes — submission flow with quality/confidence gap tracking."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.roadmap_node import RoadmapNode
from app.models.self_assessment_log import SelfAssessmentLog
from app.schemas.self_assessment_log import (
    SelfAssessmentLogCreate,
    SelfAssessmentLogResponse,
    SelfAssessmentLogUpdate,
    RoadmapNodeSubmitRequest,
    SubmissionGapResponse,
)

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
        confidence_at_creation=node.confidence_at_creation,
        estimated_hours=node.estimated_hours,
        actual_hours=node.actual_hours,
        submitted_at=node.submitted_at,
        deadline=node.deadline,
    )


@router.get("/user/summary", response_model=List[SubmissionGapResponse])
async def get_user_submission_gaps(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all submission gaps for the current user (for dashboard/profile)."""
    result = await db.execute(
        select(RoadmapNode, SelfAssessmentLog)
        .join(SelfAssessmentLog, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
        .where(RoadmapNode.user_id == current_user.id)
        .order_by(RoadmapNode.submitted_at.desc().nullslast())
    )
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
            confidence_at_creation=node.confidence_at_creation,
            estimated_hours=node.estimated_hours,
            actual_hours=node.actual_hours,
            submitted_at=node.submitted_at,
            deadline=node.deadline,
        ))

    return gaps