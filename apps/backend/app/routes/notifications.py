"""Notification routes — computed notifications derived from existing entity state.

No persistent notification model is used. Notifications are computed on-the-fly from:
- Overdue and approaching roadmap node deadlines
- Recently completed document extractions
- Failed document extractions
- Streak milestones and streak-at-risk warnings
"""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.roadmap_node import RoadmapNode
from app.models.document import Document
from app.models.course import Course
from app.models.streak import Streak
from app.schemas.notification import (
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# ── Configuration ────────────────────────────────────────────────────────────
DEADLINE_APPROACHING_HOURS = 48  # Notify when deadline is within N hours
RECENT_EXTRACTION_HOURS = 24    # Show extraction notifications for N hours
STREAK_MILESTONES = {7, 14, 30, 60, 100, 200, 365}


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = Query(30, ge=1, le=100, description="Max notifications to return"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all computed notifications for the current user.

    Notifications are derived from:
    - Overdue roadmap node deadlines
    - Approaching deadlines (within 48 hours)
    - Recently completed document extractions (last 24h)
    - Failed document extractions
    - Streak milestones and at-risk warnings
    """
    notifications: list[NotificationItem] = []
    now = datetime.now(timezone.utc)

    await _collect_deadline_notifications(current_user.id, now, notifications, db)
    await _collect_document_notifications(current_user.id, now, notifications, db)
    await _collect_streak_notifications(current_user.id, now, notifications, db)

    # Sort: errors first, then warnings, then by timestamp descending
    severity_order = {"error": 0, "warning": 1, "success": 2, "info": 3}
    notifications.sort(
        key=lambda n: (severity_order.get(n.severity, 4), -n.timestamp.timestamp())
    )

    trimmed = notifications[:limit]

    return NotificationListResponse(
        items=trimmed,
        total=len(trimmed),
        unread_count=len(trimmed),  # All computed notifications are "unread"
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the count of active notifications for the badge indicator.

    This is a lightweight endpoint optimized for frequent polling (e.g. every 60s).
    It counts only high-priority items: overdue deadlines, approaching deadlines,
    and failed extractions.
    """
    now = datetime.now(timezone.utc)
    count = 0

    # Count overdue nodes
    overdue_result = await db.execute(
        select(func.count(RoadmapNode.id)).where(
            RoadmapNode.user_id == current_user.id,
            RoadmapNode.deadline < now,
            RoadmapNode.status.in_(["Pending", "In Progress"]),
        )
    )
    count += overdue_result.scalar() or 0

    # Count approaching deadlines (within 48h)
    approaching_cutoff = now + timedelta(hours=DEADLINE_APPROACHING_HOURS)
    approaching_result = await db.execute(
        select(func.count(RoadmapNode.id)).where(
            RoadmapNode.user_id == current_user.id,
            RoadmapNode.deadline >= now,
            RoadmapNode.deadline <= approaching_cutoff,
            RoadmapNode.status.in_(["Pending", "In Progress"]),
        )
    )
    count += approaching_result.scalar() or 0

    # Count failed extractions (unresolved)
    failed_result = await db.execute(
        select(func.count(Document.id)).where(
            Document.user_id == current_user.id,
            Document.processing_status == "failed",
        )
    )
    count += failed_result.scalar() or 0

    return UnreadCountResponse(count=count)


# ──────────────────────────────────────────────────────────────────────────────
# Internal notification collectors
# ──────────────────────────────────────────────────────────────────────────────


async def _collect_deadline_notifications(
    user_id: int,
    now: datetime,
    notifications: list[NotificationItem],
    db: AsyncSession,
) -> None:
    """Collect notifications for overdue and approaching deadlines."""

    # ── Overdue deadlines ────────────────────────────────────────────────
    overdue_query = (
        select(RoadmapNode, Course.name.label("course_name"))
        .outerjoin(Course, Course.id == RoadmapNode.course_id)
        .where(
            RoadmapNode.user_id == user_id,
            RoadmapNode.deadline < now,
            RoadmapNode.status.in_(["Pending", "In Progress"]),
        )
        .order_by(RoadmapNode.deadline.asc())  # Most overdue first
        .limit(20)
    )
    overdue_result = await db.execute(overdue_query)

    for node, course_name in overdue_result.all():
        delta = now - node.deadline
        days_overdue = delta.days
        hours_overdue = int(delta.total_seconds() / 3600)

        if days_overdue > 0:
            time_str = f"{days_overdue} day{'s' if days_overdue != 1 else ''} overdue"
        else:
            time_str = f"{hours_overdue} hour{'s' if hours_overdue != 1 else ''} overdue"

        course_label = f" ({course_name})" if course_name else ""

        notifications.append(NotificationItem(
            id=f"deadline_overdue_{node.id}",
            type="deadline_overdue",
            title=f"Overdue: {node.title}",
            message=f"{node.node_type}{course_label} is {time_str}",
            severity="error",
            entity_type="roadmap_node",
            entity_id=node.id,
            course_id=node.course_id,
            timestamp=node.deadline,
        ))

    # ── Approaching deadlines (within 48h) ───────────────────────────────
    approaching_cutoff = now + timedelta(hours=DEADLINE_APPROACHING_HOURS)
    approaching_query = (
        select(RoadmapNode, Course.name.label("course_name"))
        .outerjoin(Course, Course.id == RoadmapNode.course_id)
        .where(
            RoadmapNode.user_id == user_id,
            RoadmapNode.deadline >= now,
            RoadmapNode.deadline <= approaching_cutoff,
            RoadmapNode.status.in_(["Pending", "In Progress"]),
        )
        .order_by(RoadmapNode.deadline.asc())  # Soonest first
        .limit(20)
    )
    approaching_result = await db.execute(approaching_query)

    for node, course_name in approaching_result.all():
        delta = node.deadline - now
        hours_left = int(delta.total_seconds() / 3600)

        if hours_left <= 6:
            time_str = f"in {hours_left} hour{'s' if hours_left != 1 else ''}"
            severity = "warning"
        elif hours_left <= 24:
            time_str = "tomorrow"
            severity = "warning"
        else:
            days_left = hours_left // 24
            remaining_hours = hours_left % 24
            time_str = f"in {days_left}d {remaining_hours}h"
            severity = "info"

        course_label = f" ({course_name})" if course_name else ""

        notifications.append(NotificationItem(
            id=f"deadline_approaching_{node.id}",
            type="deadline_approaching",
            title=f"Due {time_str}: {node.title}",
            message=f"{node.node_type}{course_label} deadline is {time_str}",
            severity=severity,
            entity_type="roadmap_node",
            entity_id=node.id,
            course_id=node.course_id,
            timestamp=node.deadline,
        ))


async def _collect_document_notifications(
    user_id: int,
    now: datetime,
    notifications: list[NotificationItem],
    db: AsyncSession,
) -> None:
    """Collect notifications for recently processed/failed document extractions."""

    recent_cutoff = now - timedelta(hours=RECENT_EXTRACTION_HOURS)

    # ── Recently processed documents ─────────────────────────────────────
    processed_query = (
        select(Document, Course.name.label("course_name"))
        .outerjoin(Course, Course.id == Document.course_id)
        .where(
            Document.user_id == user_id,
            Document.processing_status == "processed",
            Document.processed_at >= recent_cutoff,
        )
        .order_by(Document.processed_at.desc())
        .limit(10)
    )
    processed_result = await db.execute(processed_query)

    for doc, course_name in processed_result.all():
        course_label = f" for {course_name}" if course_name else ""

        notifications.append(NotificationItem(
            id=f"document_processed_{doc.id}",
            type="document_processed",
            title=f"Extraction complete: {doc.original_filename}",
            message=f"{doc.doc_type.replace('_', ' ').title()} extraction{course_label} finished successfully",
            severity="success",
            entity_type="document",
            entity_id=doc.id,
            course_id=doc.course_id,
            timestamp=doc.processed_at or doc.updated_at,
        ))

    # ── Failed extractions (persistent until resolved) ───────────────────
    failed_query = (
        select(Document, Course.name.label("course_name"))
        .outerjoin(Course, Course.id == Document.course_id)
        .where(
            Document.user_id == user_id,
            Document.processing_status == "failed",
        )
        .order_by(Document.updated_at.desc())
        .limit(10)
    )
    failed_result = await db.execute(failed_query)

    for doc, course_name in failed_result.all():
        course_label = f" for {course_name}" if course_name else ""
        error_hint = f": {doc.error_message[:80]}..." if doc.error_message and len(doc.error_message) > 80 else (f": {doc.error_message}" if doc.error_message else "")

        notifications.append(NotificationItem(
            id=f"document_failed_{doc.id}",
            type="document_failed",
            title=f"Extraction failed: {doc.original_filename}",
            message=f"{doc.doc_type.replace('_', ' ').title()} extraction{course_label} failed{error_hint}",
            severity="error",
            entity_type="document",
            entity_id=doc.id,
            course_id=doc.course_id,
            timestamp=doc.updated_at,
        ))


async def _collect_streak_notifications(
    user_id: int,
    now: datetime,
    notifications: list[NotificationItem],
    db: AsyncSession,
) -> None:
    """Collect streak milestone and at-risk notifications."""

    result = await db.execute(
        select(Streak).where(Streak.user_id == user_id)
    )
    streak = result.scalar_one_or_none()

    if not streak:
        return

    # ── Streak milestone reached ─────────────────────────────────────────
    current_streak = streak.activity_streak_count
    if current_streak in STREAK_MILESTONES:
        notifications.append(NotificationItem(
            id=f"streak_milestone_{current_streak}",
            type="streak_milestone",
            title=f"🔥 {current_streak}-day streak!",
            message=f"You've been active for {current_streak} consecutive days. Keep it up!",
            severity="success",
            entity_type="streak",
            entity_id=user_id,
            timestamp=streak.updated_at,
        ))

    # ── Streak at risk (last activity was yesterday — not yet broken) ────
    if streak.last_activity_date:
        today = now.date()
        last_active = streak.last_activity_date

        days_since = (today - last_active).days

        if days_since == 1 and current_streak >= 3:
            # User was active yesterday but not today — streak at risk
            notifications.append(NotificationItem(
                id=f"streak_at_risk_{today.isoformat()}",
                type="streak_at_risk",
                title=f"⚡ {current_streak}-day streak at risk",
                message="You haven't logged any activity today. Don't break your streak!",
                severity="warning",
                entity_type="streak",
                entity_id=user_id,
                timestamp=datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc),
            ))
