"""Goal routes — CRUD for semester goals with course linking and GPA targets."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import date

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.course import Course
from app.models.goal import Goal
from app.models.goal_course import GoalCourse
from app.models.roadmap_node import RoadmapNode
from app.models.gpa_entry import GpaEntry
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalWithProgress

router = APIRouter(prefix="/goals", tags=["Goals"])


async def _get_linked_course_ids(goal_id: int, db: AsyncSession) -> List[int]:
    """Get list of course IDs linked to a goal."""
    result = await db.execute(
        select(GoalCourse.course_id).where(GoalCourse.goal_id == goal_id)
    )
    return [row[0] for row in result.fetchall()]


async def _compute_goal_progress(goal: Goal, db: AsyncSession) -> dict:
    """Compute progress metrics for a goal."""
    progress = {
        "linked_courses_count": 0,
        "completed_nodes": 0,
        "total_nodes": 0,
        "current_gpa": None,
        "gap": None,
        "is_met": None,
    }

    course_ids = await _get_linked_course_ids(goal.id, db)
    progress["linked_courses_count"] = len(course_ids)

    if course_ids:
        # Count roadmap nodes for linked courses
        nodes_result = await db.execute(
            select(RoadmapNode).where(
                RoadmapNode.course_id.in_(course_ids),
                RoadmapNode.user_id == goal.user_id,
            )
        )
        nodes = nodes_result.scalars().all()
        progress["total_nodes"] = len(nodes)
        progress["completed_nodes"] = sum(1 for n in nodes if n.status in ("Submitted", "Graded"))

        # If GPA goal, compute current GPA for those courses/semesters
        if goal.is_gpa_goal and goal.gpa_target is not None:
            # Get semester from goal or use current
            target_semester = goal.semester
            target_year = None

            # Get GPA entries for linked courses
            gpa_result = await db.execute(
                select(GpaEntry).where(
                    GpaEntry.user_id == goal.user_id,
                    GpaEntry.entry_type == "course",
                    GpaEntry.course_id.in_(course_ids),
                )
            )
            entries = gpa_result.scalars().all()

            if entries:
                total_qp = sum(
                    (e.credit_hours or 0) * (e.grade_points or 0)
                    for e in entries
                    if e.credit_hours and e.grade_points
                )
                total_credits = sum(e.credit_hours or 0 for e in entries if e.credit_hours)

                if total_credits > 0:
                    progress["current_gpa"] = round(total_qp / total_credits, 2)
                    progress["gap"] = round(goal.gpa_target - progress["current_gpa"], 2)
                    progress["is_met"] = progress["current_gpa"] >= goal.gpa_target

    return progress


@router.get("", response_model=List[GoalWithProgress])
async def list_goals(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
    semester: str | None = None,
    status: str | None = None,
    category: str | None = None,
):
    """List all goals for the current user with progress metrics."""
    query = select(Goal).where(Goal.user_id == current_user.id)

    if semester:
        query = query.where(Goal.semester == semester)
    if status:
        query = query.where(Goal.status == status)
    if category:
        query = query.where(Goal.category == category)

    query = query.order_by(Goal.created_at.desc())
    result = await db.execute(query)
    goals = result.scalars().all()

    # Compute progress for each goal
    goals_with_progress = []
    for goal in goals:
        progress = await _compute_goal_progress(goal, db)
        course_ids = await _get_linked_course_ids(goal.id, db)

        goals_with_progress.append(GoalWithProgress(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            semester=goal.semester,
            target_date=goal.target_date,
            status=goal.status,
            is_gpa_goal=goal.is_gpa_goal,
            gpa_target=goal.gpa_target,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            course_ids=course_ids,
            **progress,
        ))

    return goals_with_progress


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new goal with optional course links."""
    # Verify course ownership if course_ids provided
    if goal_in.course_ids:
        result = await db.execute(
            select(Course).where(
                Course.id.in_(goal_in.course_ids),
                Course.user_id == current_user.id,
            )
        )
        found_courses = result.scalars().all()
        if len(found_courses) != len(goal_in.course_ids):
            raise HTTPException(status_code=404, detail="One or more courses not found")

    goal = Goal(
        user_id=current_user.id,
        title=goal_in.title,
        description=goal_in.description,
        category=goal_in.category,
        semester=goal_in.semester,
        target_date=goal_in.target_date,
        is_gpa_goal=goal_in.is_gpa_goal,
        gpa_target=goal_in.gpa_target,
        status="Active",
    )
    db.add(goal)
    await db.flush()

    # Create course links
    for course_id in goal_in.course_ids:
        link = GoalCourse(goal_id=goal.id, course_id=course_id)
        db.add(link)

    await db.flush()
    await db.refresh(goal)

    course_ids = await _get_linked_course_ids(goal.id, db)
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        description=goal.description,
        category=goal.category,
        semester=goal.semester,
        target_date=goal.target_date,
        status=goal.status,
        is_gpa_goal=goal.is_gpa_goal,
        gpa_target=goal.gpa_target,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        course_ids=course_ids,
    )


@router.get("/{goal_id}", response_model=GoalWithProgress)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single goal with progress metrics."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    progress = await _compute_goal_progress(goal, db)
    course_ids = await _get_linked_course_ids(goal.id, db)

    return GoalWithProgress(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        description=goal.description,
        category=goal.category,
        semester=goal.semester,
        target_date=goal.target_date,
        status=goal.status,
        is_gpa_goal=goal.is_gpa_goal,
        gpa_target=goal.gpa_target,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        course_ids=course_ids,
        **progress,
    )


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a goal's fields and optionally its course links."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_in.model_dump(exclude_unset=True)
    course_ids = update_data.pop("course_ids", None)

    for key, value in update_data.items():
        setattr(goal, key, value)

    # Update course links if provided
    if course_ids is not None:
        # Verify course ownership
        result = await db.execute(
            select(Course).where(
                Course.id.in_(course_ids),
                Course.user_id == current_user.id,
            )
        )
        found_courses = result.scalars().all()
        if len(found_courses) != len(course_ids):
            raise HTTPException(status_code=404, detail="One or more courses not found")

        # Delete existing links
        await db.execute(
            select(GoalCourse).where(GoalCourse.goal_id == goal_id)
        )
        # Actually delete
        from sqlalchemy import delete
        await db.execute(delete(GoalCourse).where(GoalCourse.goal_id == goal_id))

        # Create new links
        for course_id in course_ids:
            link = GoalCourse(goal_id=goal.id, course_id=course_id)
            db.add(link)

    await db.flush()
    await db.refresh(goal)

    linked_ids = await _get_linked_course_ids(goal.id, db)
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        description=goal.description,
        category=goal.category,
        semester=goal.semester,
        target_date=goal.target_date,
        status=goal.status,
        is_gpa_goal=goal.is_gpa_goal,
        gpa_target=goal.gpa_target,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        course_ids=linked_ids,
    )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a goal and its course links."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)


@router.get("/gpa-status", response_model=List[dict])
async def get_gpa_goal_status(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get status of all GPA-linked goals for the current user."""
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == current_user.id,
            Goal.is_gpa_goal.is_(True),
            Goal.gpa_target.is_not(None),
        )
    )
    goals = result.scalars().all()

    statuses = []
    for goal in goals:
        progress = await _compute_goal_progress(goal, db)
        statuses.append({
            "goal_id": goal.id,
            "title": goal.title,
            "target_gpa": goal.gpa_target,
            "current_gpa": progress["current_gpa"],
            "gap": progress["gap"],
            "is_met": progress["is_met"],
            "semester": goal.semester,
            "status": goal.status,
        })

    return statuses