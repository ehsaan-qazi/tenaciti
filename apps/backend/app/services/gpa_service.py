"""GPA Calculator Service — HEC 4.0 grading scale (COMSATS standard).

Semester GPA, CGPA, what-if calculations, internal marks calculator,
and grade conversions using the official HEC grading policy (Fall 2021+).
"""

from typing import List, Optional, Dict, Tuple, Any
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# HEC 4.0 Grading Scale (approved by COMSATS Academic Council, Fall 2021)
# ---------------------------------------------------------------------------

GRADE_SCALE: Dict[str, float] = {
    "A":  4.00,
    "A-": 3.70,
    "B+": 3.30,
    "B":  3.00,
    "B-": 2.70,
    "C+": 2.30,
    "C":  2.00,
    "C-": 1.70,
    "D":  1.00,
    "F":  0.00,
}

# Ordered list of (minimum_percentage, letter_grade).
# Percentage is rounded to the nearest integer before lookup.
PERCENTAGE_THRESHOLDS: List[Tuple[int, str]] = [
    (85, "A"),
    (80, "A-"),
    (75, "B+"),
    (70, "B"),
    (65, "B-"),
    (61, "C+"),
    (58, "C"),
    (55, "C-"),
    (50, "D"),
    (0,  "F"),
]

# Keep legacy multi-scale dict for backward compat with existing API responses.
# Only "4.0" is actually used.
GRADE_SCALES: Dict[str, Dict[str, float]] = {
    "4.0": GRADE_SCALE,
}

# Valid letter grades in descending order (for UI dropdowns)
LETTER_GRADES: List[str] = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]


# ---------------------------------------------------------------------------
# Data class for internal calculations
# ---------------------------------------------------------------------------

@dataclass
class CalcEntry:
    """Lightweight entry for GPA calculations."""
    id: int
    entry_type: str  # "course" or "historical"
    course_id: Optional[int]
    course_label: str
    credit_hours: float
    grade_letter: Optional[str]
    percentage: Optional[float]
    grade_scale: str
    semester: str
    academic_year: Optional[str]


# ---------------------------------------------------------------------------
# Grade conversion helpers
# ---------------------------------------------------------------------------

def letter_to_points(grade_letter: str, grade_scale: str = "4.0") -> Optional[float]:
    """Convert letter grade to numeric grade points on the HEC 4.0 scale."""
    if not grade_letter:
        return None
    return GRADE_SCALE.get(grade_letter.strip(), None)


def percentage_to_letter(percentage: float, grade_scale: str = "4.0") -> str:
    """Convert percentage to letter grade using HEC thresholds.

    Key rule: percentage is rounded to the nearest whole number before lookup.
    Example: 79.6 → round(80) → A- (3.70), but 79.4 → round(79) → B+ (3.30).
    """
    rounded = round(percentage)
    for min_pct, letter in PERCENTAGE_THRESHOLDS:
        if rounded >= min_pct:
            return letter
    return "F"


def points_to_letter(points: float, grade_scale: str = "4.0") -> Optional[str]:
    """Find the letter grade that corresponds to the given numeric points."""
    for letter, pts in GRADE_SCALE.items():
        if abs(pts - points) < 0.01:
            return letter
    return None


def letter_to_percentage_midpoint(grade_letter: str) -> Optional[float]:
    """Estimate the percentage midpoint for a given letter grade.

    Used when user provides a letter grade but not a percentage.
    Returns the midpoint of that grade's percentage range.
    """
    if not grade_letter:
        return None
    grade_letter = grade_letter.strip()
    for i, (min_pct, letter) in enumerate(PERCENTAGE_THRESHOLDS):
        if letter == grade_letter:
            if i == 0:
                # Highest grade — midpoint between min and 100
                return (min_pct + 100) / 2
            else:
                # Midpoint between this grade's min and the previous grade's min
                prev_min = PERCENTAGE_THRESHOLDS[i - 1][0]
                return (min_pct + prev_min - 1) / 2
    return None


def sync_grade_fields(
    grade_letter: Optional[str] = None,
    percentage: Optional[float] = None,
    grade_scale: str = "4.0",
) -> Tuple[Optional[str], Optional[float], Optional[float]]:
    """Synchronize grade_letter and percentage based on whichever is provided.

    Returns (synced_letter, synced_percentage, grade_points).
    """
    grade_points = None
    synced_letter = grade_letter
    synced_percentage = percentage

    if grade_letter and percentage is None:
        # Letter provided, no percentage — estimate midpoint
        grade_points = letter_to_points(grade_letter)
        synced_percentage = letter_to_percentage_midpoint(grade_letter)
    elif percentage is not None and not grade_letter:
        # Percentage provided, no letter — convert using HEC thresholds
        synced_letter = percentage_to_letter(percentage)
        grade_points = letter_to_points(synced_letter)
    elif grade_letter and percentage is not None:
        # Both provided — letter takes precedence for grade points
        grade_points = letter_to_points(grade_letter)

    return synced_letter, synced_percentage, grade_points


# ---------------------------------------------------------------------------
# Model → CalcEntry converter
# ---------------------------------------------------------------------------

def _entry_to_calc(entry) -> CalcEntry:
    """Convert a GpaEntry ORM model to CalcEntry."""
    return CalcEntry(
        id=entry.id,
        entry_type=entry.entry_type,
        course_id=entry.course_id,
        course_label=entry.course_label,
        credit_hours=float(entry.credit_hours),
        grade_letter=entry.grade_letter,
        percentage=entry.percentage,
        grade_scale=entry.grade_scale,
        semester=entry.semester,
        academic_year=entry.academic_year,
    )


# ---------------------------------------------------------------------------
# GPA calculations
# ---------------------------------------------------------------------------

def calculate_semester_gpa(entries: List[CalcEntry], grade_scale: str = "4.0") -> Tuple[float, float, float]:
    """Calculate GPA for a single semester.

    Formula: GPA = Σ(Grade Points × Credit Hours) ÷ Σ(Credit Hours)
    Returns (gpa, total_quality_points, total_credits).
    """
    total_qp = 0.0
    total_credits = 0.0

    for entry in entries:
        if entry.entry_type != "course":
            continue
        if entry.credit_hours <= 0:
            continue

        grade_points = letter_to_points(entry.grade_letter)
        if grade_points is None:
            continue

        total_qp += entry.credit_hours * grade_points
        total_credits += entry.credit_hours

    gpa = total_qp / total_credits if total_credits > 0 else 0.0
    return round(gpa, 2), round(total_qp, 2), total_credits


def calculate_cgpa(entries: List[CalcEntry]) -> Tuple[float, float, float]:
    """Calculate cumulative GPA across all semesters.

    Formula: CGPA = Σ(All Quality Points) ÷ Σ(All Credit Hours)
    Returns (cgpa, total_quality_points, total_credits).
    """
    course_entries = [e for e in entries if e.entry_type == "course"]

    total_qp = 0.0
    total_credits = 0.0

    for entry in course_entries:
        if entry.credit_hours <= 0:
            continue
        grade_points = letter_to_points(entry.grade_letter)
        if grade_points is None:
            continue

        total_qp += entry.credit_hours * grade_points
        total_credits += entry.credit_hours

    cgpa = total_qp / total_credits if total_credits > 0 else 0.0
    return round(cgpa, 2), round(total_qp, 2), total_credits


def build_semester_summaries(entries: List[CalcEntry], grade_scale: str = "4.0") -> List[Dict]:
    """Build semester summaries from entries, sorted chronologically."""
    from collections import defaultdict
    grouped = defaultdict(list)
    for entry in entries:
        key = (entry.semester, entry.academic_year or "")
        grouped[key].append(entry)

    summaries = []
    semester_order = {"Spring": 1, "Summer": 2, "Fall": 3}

    for (semester, year), sem_entries in sorted(
        grouped.items(),
        key=lambda x: (x[0][1] or "0", semester_order.get(x[0][0], 0))
    ):
        gpa, qp, credits = calculate_semester_gpa(sem_entries, grade_scale)

        entry_responses = []
        for e in sorted(sem_entries, key=lambda x: x.course_label):
            gp = letter_to_points(e.grade_letter)
            entry_responses.append({
                "id": e.id,
                "entry_type": e.entry_type,
                "course_id": e.course_id,
                "course_label": e.course_label,
                "credit_hours": e.credit_hours,
                "grade_letter": e.grade_letter,
                "percentage": e.percentage,
                "grade_scale": e.grade_scale,
                "semester": e.semester,
                "academic_year": e.academic_year,
                "grade_points": gp,
                "quality_points": round(e.credit_hours * gp, 2) if gp is not None else None,
            })

        summaries.append({
            "semester": semester,
            "academic_year": year if year else None,
            "total_credits": credits,
            "total_quality_points": qp,
            "gpa": gpa,
            "entry_count": len([e for e in sem_entries if e.entry_type == "course"]),
            "entries": entry_responses,
        })

    return summaries


# ---------------------------------------------------------------------------
# What-if scenarios
# ---------------------------------------------------------------------------

def calculate_what_if_scenarios(
    current_entries: List[CalcEntry],
    remaining_credits: float,
    target_cgpa: Optional[float] = None,
    target_semester_gpa: Optional[float] = None,
    grade_scale: str = "4.0",
) -> Dict:
    """Calculate what-if scenarios for GPA planning."""
    current_cgpa, current_qp, current_credits = calculate_cgpa(current_entries)

    scenarios = []
    is_achievable = None
    needed_gpa = None

    # Scenario 1: Target CGPA — what grade average needed on remaining credits
    if target_cgpa is not None and remaining_credits > 0:
        needed_gpa = (
            target_cgpa * (current_credits + remaining_credits) - current_qp
        ) / remaining_credits

        grade_needed_letter = points_to_letter(needed_gpa) or (
            "Above A" if needed_gpa > 4.0 else "Below F"
        )

        scenarios.append({
            "name": f"Achieve {target_cgpa:.2f} CGPA",
            "description": f"Need {needed_gpa:.2f} GPA on {remaining_credits} remaining credits ({grade_needed_letter} average)",
            "projected_cgpa": target_cgpa,
            "projected_credits": current_credits + remaining_credits,
            "grade_needed": round(needed_gpa, 2),
        })

        is_achievable = needed_gpa <= 4.0
    
    # Scenario 2: Target semester GPA
    if target_semester_gpa is not None and remaining_credits > 0:
        projected_qp = current_qp + remaining_credits * target_semester_gpa
        projected_credits = current_credits + remaining_credits
        projected_cgpa = projected_qp / projected_credits if projected_credits > 0 else 0

        scenarios.append({
            "name": f"Earn {target_semester_gpa:.2f} this semester",
            "description": f"Projected CGPA: {projected_cgpa:.2f}",
            "projected_cgpa": round(projected_cgpa, 2),
            "projected_credits": projected_credits,
            "grade_needed": target_semester_gpa,
        })

    # Scenario 3: Straight A's (max = 4.0)
    max_grade = 4.0
    max_qp = current_qp + remaining_credits * max_grade
    max_credits = current_credits + remaining_credits
    max_cgpa = max_qp / max_credits if max_credits > 0 else 0

    scenarios.append({
        "name": "Best case (straight A's)",
        "description": f"Max possible CGPA: {max_cgpa:.2f}",
        "projected_cgpa": round(max_cgpa, 2),
        "projected_credits": max_credits,
        "grade_needed": max_grade,
    })

    # Scenario 4: Current trajectory
    if current_entries:
        semesters = {}
        for e in current_entries:
            key = (e.semester, e.academic_year or "")
            if key not in semesters:
                semesters[key] = []
            semesters[key].append(e)

        if semesters:
            sorted_sems = sorted(
                semesters.items(),
                key=lambda x: (x[0][1] or "0", {"Spring": 1, "Summer": 2, "Fall": 3}.get(x[0][0], 0)),
                reverse=True,
            )
            recent_entries = sorted_sems[0][1]
            recent_gpa, _, _ = calculate_semester_gpa(recent_entries, grade_scale)

            proj_qp = current_qp + remaining_credits * recent_gpa
            proj_credits = current_credits + remaining_credits
            proj_cgpa = proj_qp / proj_credits if proj_credits > 0 else 0

            scenarios.append({
                "name": f"Maintain {recent_gpa:.2f} semester GPA",
                "description": f"Projected CGPA: {proj_cgpa:.2f}",
                "projected_cgpa": round(proj_cgpa, 2),
                "projected_credits": proj_credits,
                "grade_needed": recent_gpa,
            })

    return {
        "scenarios": scenarios,
        "grade_needed_for_target_cgpa": round(needed_gpa, 2) if needed_gpa is not None else None,
        "is_target_achievable": is_achievable,
    }


# ---------------------------------------------------------------------------
# Internal marks calculator
# ---------------------------------------------------------------------------

def calculate_internal_marks(
    quizzes: Optional[List[float]] = None,
    assignments: Optional[List[float]] = None,
    midterm: Optional[float] = None,
    terminal: Optional[float] = None,
    quiz_max: float = 10.0,
    assignment_max: float = 10.0,
    midterm_max: float = 25.0,
    terminal_max: float = 50.0,
    has_lab: bool = False,
    theory_percentage: Optional[float] = None,
    practical_percentage: Optional[float] = None,
    theory_credit_hours: Optional[float] = None,
    practical_credit_hours: Optional[float] = None,
) -> Dict[str, Any]:
    """Calculate internal marks using COMSATS evaluation structure.

    Standard weightage (no lab):
        Quizzes/Assignments: 25%
        Mid-Term Exam: 25%
        Terminal Exam: 50%

    With lab:
        Total % = ((% Theory × Theory CH) + (% Practical × Practical CH)) ÷ Total CH
    """
    result: Dict[str, Any] = {
        "quiz_average": None,
        "assignment_average": None,
        "midterm_percentage": None,
        "terminal_percentage": None,
        "internal_total": None,
        "total_percentage": None,
        "predicted_grade": None,
        "predicted_gpa": None,
        "has_lab": has_lab,
    }

    # Quiz average (out of max)
    if quizzes:
        valid_quizzes = [q for q in quizzes if q is not None]
        if valid_quizzes:
            result["quiz_average"] = round(sum(valid_quizzes) / len(valid_quizzes), 2)

    # Assignment average (out of max)
    if assignments:
        valid_assignments = [a for a in assignments if a is not None]
        if valid_assignments:
            result["assignment_average"] = round(sum(valid_assignments) / len(valid_assignments), 2)

    # Midterm percentage
    if midterm is not None and midterm_max > 0:
        result["midterm_percentage"] = round((midterm / midterm_max) * 100, 2)

    # Terminal percentage
    if terminal is not None and terminal_max > 0:
        result["terminal_percentage"] = round((terminal / terminal_max) * 100, 2)

    if not has_lab:
        # Standard calculation (no lab)
        # Internal = sessional marks (quizzes + assignments out of 25%) + midterm (25%)
        # Total = internal + terminal (50%)
        sessional_pct = 0.0
        sessional_components = 0

        if result["quiz_average"] is not None and quiz_max > 0:
            sessional_pct += (result["quiz_average"] / quiz_max) * 100
            sessional_components += 1
        if result["assignment_average"] is not None and assignment_max > 0:
            sessional_pct += (result["assignment_average"] / assignment_max) * 100
            sessional_components += 1

        if sessional_components > 0:
            sessional_pct /= sessional_components

        # Weighted contributions
        sessional_weighted = sessional_pct * 0.25  # 25% weight
        midterm_weighted = (result["midterm_percentage"] or 0) * 0.25  # 25% weight
        terminal_weighted = (result["terminal_percentage"] or 0) * 0.50  # 50% weight

        result["internal_total"] = round(sessional_weighted + midterm_weighted, 2)
        result["total_percentage"] = round(sessional_weighted + midterm_weighted + terminal_weighted, 2)
    else:
        # Lab course: weighted average by credit hours
        if (theory_percentage is not None and practical_percentage is not None
                and theory_credit_hours and practical_credit_hours):
            total_ch = theory_credit_hours + practical_credit_hours
            result["total_percentage"] = round(
                (theory_percentage * theory_credit_hours + practical_percentage * practical_credit_hours) / total_ch,
                2
            )
        elif theory_percentage is not None:
            result["total_percentage"] = theory_percentage

    # Predict grade from total percentage
    if result["total_percentage"] is not None:
        result["predicted_grade"] = percentage_to_letter(result["total_percentage"])
        result["predicted_gpa"] = letter_to_points(result["predicted_grade"])

    return result


# ---------------------------------------------------------------------------
# Response enrichment
# ---------------------------------------------------------------------------

def enrich_entry_response(entry: CalcEntry) -> Dict[str, Any]:
    """Enrich a CalcEntry with computed fields for API response."""
    grade_points = letter_to_points(entry.grade_letter)
    quality_points = (
        round(entry.credit_hours * grade_points, 2)
        if grade_points is not None else None
    )

    return {
        "id": entry.id,
        "user_id": None,  # Set by caller
        "semester": entry.semester,
        "academic_year": entry.academic_year,
        "entry_type": entry.entry_type,
        "course_id": entry.course_id,
        "course_label": entry.course_label,
        "credit_hours": entry.credit_hours,
        "grade_letter": entry.grade_letter,
        "percentage": entry.percentage,
        "grade_scale": entry.grade_scale,
        "grade_points": grade_points,
        "quality_points": quality_points,
        "created_at": None,  # Set by caller
        "updated_at": None,  # Set by caller
    }