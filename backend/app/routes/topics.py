"""Topic routes — CRUD for course topics and completion toggles."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.course import Course
from app.models.topic import Topic
from app.models.topic_completion import TopicCompletion
from app.models.roadmap_node import RoadmapNode
from app.schemas.topic import (
    TopicCreate, TopicUpdate, TopicToggle, TopicConfirm,
    TopicBulkReorder, TopicMerge, TopicLinkNode,
    TopicResponse, TopicWithCompletion, TopicCompletionStats
)

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("/courses/{course_id}", response_model=List[TopicWithCompletion])
async def list_course_topics(
    course_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """List all topics for a course, including completion state."""
    # Verify course ownership
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")

    # Get all topics for this course (filtered by user_id for security)
    topics_result = await db.execute(
        select(Topic)
        .where(Topic.course_id == course_id, Topic.user_id == current_user.id)
        .order_by(Topic.order_index)
    )
    topics = topics_result.scalars().all()

    # Get completions for current user
    topic_ids = [t.id for t in topics]
    completions_result = await db.execute(
        select(TopicCompletion).where(
            TopicCompletion.user_id == current_user.id,
            TopicCompletion.topic_id.in_(topic_ids) if topic_ids else False,
        )
    )
    completions = {tc.topic_id: tc for tc in completions_result.scalars().all()} if topics else {}

    # Merge topics with completion state
    result_list = []
    for topic in topics:
        tc = completions.get(topic.id)
        result_list.append(TopicWithCompletion(
            id=topic.id,
            course_id=topic.course_id,
            title=topic.title,
            order_index=topic.order_index,
            is_confirmed=topic.is_confirmed,
            source_document_id=topic.source_document_id,
            linked_node_id=topic.linked_node_id,
            created_at=topic.created_at,
            updated_at=topic.updated_at,
            is_completed=tc.is_completed if tc else False,
            confidence_rating=tc.confidence_rating if tc else None,
        ))

    return result_list


@router.post("/courses/{course_id}", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    course_id: int,
    topic_in: TopicCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually create a topic for a course."""
    # Verify course ownership
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")

    topic = Topic(
        course_id=course_id,
        user_id=current_user.id,
        title=topic_in.title,
        order_index=topic_in.order_index,
        is_confirmed=True,  # Manually created topics are auto-confirmed
    )
    db.add(topic)
    await db.flush()
    await db.refresh(topic)
    return topic


@router.put("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_in: TopicUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a topic's title or order."""
    result = await db.execute(
        select(Topic).where(Topic.id == topic_id, Topic.user_id == current_user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    update_data = topic_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(topic, key, value)

    await db.flush()
    await db.refresh(topic)
    return topic


@router.patch("/{topic_id}/toggle", response_model=TopicWithCompletion)
async def toggle_topic_completion(
    topic_id: int,
    toggle_in: TopicToggle,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle a topic's completion state for the current user."""
    # Verify topic exists and belongs to user
    topic_result = await db.execute(
        select(Topic).where(Topic.id == topic_id, Topic.user_id == current_user.id)
    )
    topic = topic_result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Find or create completion record
    comp_result = await db.execute(
        select(TopicCompletion).where(
            TopicCompletion.topic_id == topic_id,
            TopicCompletion.user_id == current_user.id,
        )
    )
    completion = comp_result.scalar_one_or_none()

    if completion:
        completion.is_completed = toggle_in.is_completed
        if toggle_in.confidence_rating is not None:
            completion.confidence_rating = toggle_in.confidence_rating
    else:
        from datetime import datetime, timezone
        completion = TopicCompletion(
            topic_id=topic_id,
            user_id=current_user.id,
            is_completed=toggle_in.is_completed,
            confidence_rating=toggle_in.confidence_rating,
            completed_at=datetime.now(timezone.utc) if toggle_in.is_completed else None,
        )
        db.add(completion)

    await db.flush()

    return TopicWithCompletion(
        id=topic.id,
        course_id=topic.course_id,
        title=topic.title,
        order_index=topic.order_index,
        is_confirmed=topic.is_confirmed,
        source_document_id=topic.source_document_id,
        linked_node_id=topic.linked_node_id,
        created_at=topic.created_at,
        updated_at=topic.updated_at,
        is_completed=completion.is_completed,
        confidence_rating=completion.confidence_rating,
    )


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a topic."""
    result = await db.execute(
        select(Topic).where(Topic.id == topic_id, Topic.user_id == current_user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    await db.delete(topic)


@router.post("/{topic_id}/confirm", response_model=TopicResponse)
async def confirm_topic(
    topic_id: int,
    confirm_in: TopicConfirm,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm or unconfirm a topic (confirm-before-lock pattern)."""
    result = await db.execute(
        select(Topic).where(Topic.id == topic_id, Topic.user_id == current_user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic.is_confirmed = confirm_in.is_confirmed
    await db.flush()
    await db.refresh(topic)
    return topic


@router.post("/bulk-reorder", response_model=List[TopicResponse])
async def bulk_reorder_topics(
    reorder_in: TopicBulkReorder,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder multiple topics by providing ordered list of topic IDs."""
    if not reorder_in.topic_ids:
        return []

    # Verify all topics belong to user
    result = await db.execute(
        select(Topic).where(
            Topic.id.in_(reorder_in.topic_ids),
            Topic.user_id == current_user.id
        )
    )
    topics = {t.id: t for t in result.scalars().all()}

    if len(topics) != len(reorder_in.topic_ids):
        raise HTTPException(status_code=404, detail="One or more topics not found")

    # Update order_index based on position in array
    for idx, topic_id in enumerate(reorder_in.topic_ids):
        topics[topic_id].order_index = idx

    await db.flush()

    # Return updated topics in new order
    updated = [topics[tid] for tid in reorder_in.topic_ids]
    for t in updated:
        await db.refresh(t)
    return updated


@router.post("/merge", response_model=TopicResponse)
async def merge_topics(
    merge_in: TopicMerge,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Merge multiple source topics into a target topic."""
    if len(merge_in.source_ids) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 source topics to merge")

    # Verify all source topics belong to user
    result = await db.execute(
        select(Topic).where(
            Topic.id.in_(merge_in.source_ids),
            Topic.user_id == current_user.id
        )
    )
    source_topics = {t.id: t for t in result.scalars().all()}

    if len(source_topics) != len(merge_in.source_ids):
        raise HTTPException(status_code=404, detail="One or more source topics not found")

    # Verify target topic belongs to user (if provided) or create new
    if merge_in.target_id:
        target_result = await db.execute(
            select(Topic).where(Topic.id == merge_in.target_id, Topic.user_id == current_user.id)
        )
        target_topic = target_result.scalar_one_or_none()
        if not target_topic:
            raise HTTPException(status_code=404, detail="Target topic not found")
    else:
        # Create new merged topic
        target_topic = Topic(
            course_id=source_topics[merge_in.source_ids[0]].course_id,
            user_id=current_user.id,
            title=merge_in.new_title or "Merged Topic",
            order_index=min(t.order_index for t in source_topics.values()),
            is_confirmed=False,
        )
        db.add(target_topic)
        await db.flush()

    # Update completion records to point to target
    for source_id in merge_in.source_ids:
        if source_id == merge_in.target_id:
            continue
        comp_result = await db.execute(
            select(TopicCompletion).where(
                TopicCompletion.topic_id == source_id,
                TopicCompletion.user_id == current_user.id
            )
        )
        completion = comp_result.scalar_one_or_none()
        if completion:
            completion.topic_id = target_topic.id

    # Delete source topics (except target)
    for source_id in merge_in.source_ids:
        if source_id != merge_in.target_id:
            source_topic = source_topics.get(source_id)
            if source_topic:
                await db.delete(source_topic)

    # Update target title if provided
    if merge_in.new_title:
        target_topic.title = merge_in.new_title

    await db.flush()
    await db.refresh(target_topic)
    return target_topic


@router.patch("/{topic_id}/link-node", response_model=TopicResponse)
async def link_topic_to_node(
    topic_id: int,
    link_in: TopicLinkNode,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Link or unlink a topic to a roadmap node."""
    # Verify topic
    result = await db.execute(
        select(Topic).where(Topic.id == topic_id, Topic.user_id == current_user.id)
    )
    topic = result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Verify node if linking
    if link_in.linked_node_id is not None:
        node_result = await db.execute(
            select(RoadmapNode).where(
                RoadmapNode.id == link_in.linked_node_id,
                RoadmapNode.user_id == current_user.id,
                RoadmapNode.course_id == topic.course_id
            )
        )
        if not node_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Roadmap node not found or not in same course")

    topic.linked_node_id = link_in.linked_node_id
    await db.flush()
    await db.refresh(topic)
    return topic


@router.get("/courses/{course_id}/completion-stats", response_model=TopicCompletionStats)
async def get_topic_completion_stats(
    course_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated topic completion statistics for a course."""
    # Verify course ownership
    result = await db.execute(
        select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")

    # Count topics
    total_result = await db.execute(
        select(func.count(Topic.id)).where(Topic.course_id == course_id, Topic.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    # Count confirmed
    confirmed_result = await db.execute(
        select(func.count(Topic.id)).where(
            Topic.course_id == course_id,
            Topic.user_id == current_user.id,
            Topic.is_confirmed.is_(True),
        )
    )
    confirmed = confirmed_result.scalar() or 0

    # Count completed
    completed_result = await db.execute(
        select(func.count(TopicCompletion.id)).where(
            TopicCompletion.user_id == current_user.id,
            TopicCompletion.is_completed.is_(True),
            TopicCompletion.topic_id.in_(
                select(Topic.id).where(
                    Topic.course_id == course_id,
                    Topic.user_id == current_user.id,
                )
            ),
        )
    )
    completed = completed_result.scalar() or 0

    progress_pct = round((completed / total * 100)) if total > 0 else 0

    return TopicCompletionStats(
        total=total,
        completed=completed,
        confirmed=confirmed,
        progress_pct=progress_pct
    )
