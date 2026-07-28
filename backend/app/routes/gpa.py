"""GPA routes — CRUD for GPA entries, semester/CGPA summaries, what-if calculator, internal marks."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.course import Course
from app.models.gpa_entry import GpaEntry
from app.models.goal import Goal
from app.schemas.gpa import (
    GpaEntryCreate,
    GpaEntryUpdate,
    GpaEntryResponse,
    SemesterGpaSummary,
    CumulativeGpaSummary,
    WhatIfRequest,
    WhatIfResponse,
    WhatIfScenario,
    GpaGoalStatus,
    InternalMarksRequest,
    InternalMarksResponse,
)
from app.services.gpa_service import (
    percentage_to_letter,
    sync_grade_fields,
    calculate_cgpa,
    calculate_what_if_scenarios,
    build_semester_summaries,
    calculate_internal_marks,
    enrich_entry_response,
    _entry_to_calc,
    GRADE_SCALE,
    LETTER_GRADES,
    PERCENTAGE_THRESHOLDS,
)

router = APIRouter(prefix="/gpa", tags=["GPA Calculator"])


def _enrich_response(entry: GpaEntry) -> GpaEntryResponse:
    """Enrich DB entry with computed fields for response."""
    calc_entry = _entry_to_calc(entry)
    enriched = enrich_entry_response(calc_entry)
    enriched["user_id"] = entry.user_id
    enriched["created_at"] = entry.created_at
    enriched["updated_at"] = entry.updated_at
    return GpaEntryResponse(**enriched)


@router.post("/entries", response_model=GpaEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_gpa_entry(
    entry_in: GpaEntryCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new GPA entry (course grade or historical semester)."""
    # Verify course ownership if course_id provided
    if entry_in.course_id is not None:
        result = await db.execute(
            select(Course).where(
                Course.id == entry_in.course_id,
                Course.user_id == current_user.id,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Course not found")

    # Sync grade fields using HEC 4.0 scale
    grade_letter, percentage, _ = sync_grade_fields(
        grade_letter=entry_in.grade_letter,
        percentage=entry_in.percentage,
    )

    entry = GpaEntry(
        user_id=current_user.id,
        semester=entry_in.semester,
        academic_year=entry_in.academic_year,
        entry_type=entry_in.entry_type,
        course_id=entry_in.course_id,
        course_label=entry_in.course_label,
        credit_hours=entry_in.credit_hours,
        grade_letter=grade_letter,
        percentage=percentage,
        grade_scale="4.0",
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    return _enrich_response(entry)


@router.get("/entries", response_model=List[GpaEntryResponse])
async def list_gpa_entries(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
    semester: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    entry_type: Optional[str] = Query(None),
    course_id: Optional[int] = Query(None),
):
    """List GPA entries with optional filters."""
    query = select(GpaEntry).where(GpaEntry.user_id == current_user.id)

    if semester:
        query = query.where(GpaEntry.semester == semester)
    if academic_year:
        query = query.where(GpaEntry.academic_year == academic_year)
    if entry_type:
        query = query.where(GpaEntry.entry_type == entry_type)
    if course_id:
        query = query.where(GpaEntry.course_id == course_id)

    query = query.order_by(GpaEntry.semester.desc(), GpaEntry.course_label)
    result = await db.execute(query)
    entries = result.scalars().all()

    return [_enrich_response(e) for e in entries]


@router.get("/entries/{entry_id}", response_model=GpaEntryResponse)
async def get_gpa_entry(
    entry_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single GPA entry."""
    result = await db.execute(
        select(GpaEntry).where(
            GpaEntry.id == entry_id,
            GpaEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="GPA entry not found")

    return _enrich_response(entry)


@router.put("/entries/{entry_id}", response_model=GpaEntryResponse)
async def update_gpa_entry(
    entry_id: int,
    entry_in: GpaEntryUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a GPA entry. Sync grade fields on change."""
    result = await db.execute(
        select(GpaEntry).where(
            GpaEntry.id == entry_id,
            GpaEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="GPA entry not found")

    # Verify course ownership if course_id being changed
    if entry_in.course_id is not None:
        result = await db.execute(
            select(Course).where(
                Course.id == entry_in.course_id,
                Course.user_id == current_user.id,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Course not found")

    update_data = entry_in.model_dump(exclude_unset=True)

    # Handle grade sync if grade_letter or percentage changed
    grade_fields_changed = any(k in update_data for k in ("grade_letter", "percentage"))
    if grade_fields_changed:
        new_letter = update_data.get("grade_letter", entry.grade_letter)
        new_percentage = update_data.get("percentage", entry.percentage)

        synced_letter, synced_percentage, _ = sync_grade_fields(
            grade_letter=new_letter,
            percentage=new_percentage,
        )
        update_data["grade_letter"] = synced_letter
        update_data["percentage"] = synced_percentage

    # Always force HEC 4.0 scale
    update_data["grade_scale"] = "4.0"

    for key, value in update_data.items():
        setattr(entry, key, value)

    await db.flush()
    await db.refresh(entry)

    return _enrich_response(entry)


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gpa_entry(
    entry_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a GPA entry."""
    result = await db.execute(
        select(GpaEntry).where(
            GpaEntry.id == entry_id,
            GpaEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="GPA entry not found")

    await db.delete(entry)


@router.get("/semester-summary", response_model=List[SemesterGpaSummary])
async def get_semester_summaries(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get GPA summary grouped by semester."""
    result = await db.execute(
        select(GpaEntry).where(GpaEntry.user_id == current_user.id)
    )
    entries = result.scalars().all()

    calc_entries = [_entry_to_calc(e) for e in entries]
    summaries = build_semester_summaries(calc_entries)

    return [
        SemesterGpaSummary(
            semester=s["semester"],
            academic_year=s["academic_year"],
            total_credits=s["total_credits"],
            total_quality_points=s["total_quality_points"],
            gpa=s["gpa"],
            entry_count=s["entry_count"],
            entries=[GpaEntryResponse(**e) for e in s["entries"]],
        )
        for s in summaries
    ]


@router.get("/cumulative", response_model=CumulativeGpaSummary)
async def get_cumulative_gpa(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get cumulative GPA across all semesters."""
    result = await db.execute(
        select(GpaEntry).where(GpaEntry.user_id == current_user.id)
    )
    entries = result.scalars().all()

    calc_entries = [_entry_to_calc(e) for e in entries]

    # Filter to course entries only for CGPA calculation
    course_entries = [e for e in calc_entries if e.entry_type == "course"]
    cgpa, total_qp, total_credits = calculate_cgpa(course_entries)

    # Build semester summaries
    summaries = build_semester_summaries(calc_entries)

    return CumulativeGpaSummary(
        semesters=[
            SemesterGpaSummary(
                semester=s["semester"],
                academic_year=s["academic_year"],
                total_credits=s["total_credits"],
                total_quality_points=s["total_quality_points"],
                gpa=s["gpa"],
                entry_count=s["entry_count"],
                entries=[GpaEntryResponse(**e) for e in s["entries"]],
            )
            for s in summaries
        ],
        cumulative_gpa=cgpa,
        total_credits=total_credits,
        total_quality_points=total_qp,
    )


@router.post("/what-if", response_model=WhatIfResponse)
async def calculate_what_if(
    request: WhatIfRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Calculate what-if scenarios for GPA planning."""
    # Get current entries
    result = await db.execute(
        select(GpaEntry).where(GpaEntry.user_id == current_user.id)
    )
    entries = result.scalars().all()

    calc_entries = [_entry_to_calc(e) for e in entries]
    course_entries = [e for e in calc_entries if e.entry_type == "course"]

    # Calculate current CGPA
    current_cgpa, total_qp, total_credits = calculate_cgpa(course_entries)

    # Build what-if scenarios
    what_if_result = calculate_what_if_scenarios(
        current_entries=course_entries,
        remaining_credits=request.remaining_credits,
        target_cgpa=request.target_cgpa,
        target_semester_gpa=request.target_semester_gpa,
    )

    scenarios = [
        WhatIfScenario(
            name=s["name"],
            description=s["description"],
            projected_cgpa=s["projected_cgpa"],
            projected_credits=s["projected_credits"],
            grade_needed=s.get("grade_needed"),
        )
        for s in what_if_result["scenarios"]
    ]

    return WhatIfResponse(
        current_cgpa=current_cgpa,
        current_credits=total_credits,
        scenarios=scenarios,
        grade_needed_for_target=what_if_result.get("grade_needed_for_target_cgpa"),
        is_target_achievable=what_if_result.get("is_target_achievable"),
    )


@router.get("/goals", response_model=List[GpaGoalStatus])
async def get_gpa_goals_status(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Get status of all GPA-linked goals."""
    # Get GPA goals
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == current_user.id,
            Goal.is_gpa_goal.is_(True),
            Goal.gpa_target.is_not(None),
            Goal.status == "Active",
        )
    )
    goals = result.scalars().all()

    # Get all course entries for CGPA calculation
    entries_result = await db.execute(
        select(GpaEntry).where(
            GpaEntry.user_id == current_user.id,
            GpaEntry.entry_type == "course",
        )
    )
    entries = entries_result.scalars().all()
    calc_entries = [_entry_to_calc(e) for e in entries]

    # Calculate current CGPA
    current_cgpa, _, _ = calculate_cgpa(calc_entries)

    # Get course IDs linked to each goal
    from app.models.goal_course import GoalCourse
    goal_ids = [g.id for g in goals]

    goal_course_links = {}
    if goal_ids:
        links_result = await db.execute(
            select(GoalCourse).where(GoalCourse.goal_id.in_(goal_ids))
        )
        for link in links_result.scalars().all():
            if link.goal_id not in goal_course_links:
                goal_course_links[link.goal_id] = []
            goal_course_links[link.goal_id].append(link.course_id)

    # For each goal, compute progress
    goal_statuses = []
    for goal in goals:
        linked_course_ids = goal_course_links.get(goal.id, [])

        if linked_course_ids:
            # Filter entries to linked courses
            goal_entries = [e for e in calc_entries if e.course_id in linked_course_ids]
        else:
            # No linked courses - use all entries (overall CGPA)
            goal_entries = calc_entries

        if goal_entries:
            goal_gpa, _, _ = calculate_cgpa(goal_entries)
        else:
            goal_gpa = 0.0

        gap = round(goal.gpa_target - goal_gpa, 2) if goal.gpa_target else 0
        is_met = goal_gpa >= (goal.gpa_target or 0)

        goal_statuses.append(GpaGoalStatus(
            goal_id=goal.id,
            title=goal.title,
            target_gpa=goal.gpa_target or 0,
            current_gpa=round(goal_gpa, 2),
            gap=gap,
            is_met=is_met,
            semester=goal.semester,
        ))

    return goal_statuses


@router.get("/grade-scales", response_model=dict)
async def get_grade_scales():
    """Get the HEC 4.0 grading scale and percentage thresholds."""
    return {
        "scale": GRADE_SCALE,
        "letter_grades": LETTER_GRADES,
        "percentage_thresholds": [
            {"min_percentage": t[0], "grade": t[1]}
            for t in PERCENTAGE_THRESHOLDS
        ],
    }


@router.post("/internal-marks", response_model=InternalMarksResponse)
async def calculate_internal_marks_endpoint(
    request: InternalMarksRequest,
    current_user: User = Depends(get_verified_user),
):
    """Calculate internal marks using COMSATS evaluation structure.

    Standard (no lab): Quizzes/Assignments 25%, Mid-term 25%, Terminal 50%.
    Lab course: weighted average of theory and practical by credit hours.
    """
    result = calculate_internal_marks(
        quizzes=request.quizzes,
        assignments=request.assignments,
        midterm=request.midterm,
        terminal=request.terminal,
        quiz_max=request.quiz_max,
        assignment_max=request.assignment_max,
        midterm_max=request.midterm_max,
        terminal_max=request.terminal_max,
        has_lab=request.has_lab,
        theory_percentage=request.theory_percentage,
        practical_percentage=request.practical_percentage,
        theory_credit_hours=request.theory_credit_hours,
        practical_credit_hours=request.practical_credit_hours,
    )
    return InternalMarksResponse(**result)


@router.post("/entries/from-roadmap/{node_id}", response_model=GpaEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_gpa_entry_from_roadmap(
    node_id: int,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a GPA entry pre-filled from a graded roadmap node."""
    from app.models.roadmap_node import RoadmapNode

    result = await db.execute(
        select(RoadmapNode).where(
            RoadmapNode.id == node_id,
            RoadmapNode.user_id == current_user.id,
        )
    )
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Roadmap node not found")

    if node.status != "Graded" or node.grade is None:
        raise HTTPException(status_code=400, detail="Node must be graded to create GPA entry")

    # Get course for credit hours
    course_result = await db.execute(
        select(Course).where(
            Course.id == node.course_id,
            Course.user_id == current_user.id,
        )
    )
    course = course_result.scalar_one_or_none()

    # Convert grade (percentage) to letter using HEC thresholds
    grade_percentage = float(node.grade) if node.grade else 0
    grade_letter = percentage_to_letter(grade_percentage)
    credit_hours = float(course.credit_hours) if course and course.credit_hours else 3.0

    entry = GpaEntry(
        user_id=current_user.id,
        semester=course.semester if course else "Unknown",
        academic_year=course.academic_year if course else None,
        entry_type="course",
        course_id=node.course_id,
        course_label=node.title,
        credit_hours=credit_hours,
        grade_letter=grade_letter,
        percentage=grade_percentage,
        grade_scale="4.0",
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    return _enrich_response(entry)