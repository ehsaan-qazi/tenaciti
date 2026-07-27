"""GPA Calculator Service — semester GPA, CGPA, what-if calculations, and grade scale conversions."""

from typing import List, Optional, Dict, Tuple, Any
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP


# Grade scale mappings for different grading systems
GRADE_SCALES = {
    "4.0": {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "D-": 0.7,
        "F": 0.0,
    },
    "5.0": {
        "A+": 5.0, "A": 5.0, "A-": 4.5,
        "B+": 4.0, "B": 3.5, "B-": 3.0,
        "C+": 2.5, "C": 2.0, "C-": 1.5,
        "D+": 1.0, "D": 0.5, "D-": 0.0,
        "F": 0.0,
    },
    "10": {
        "A+": 10.0, "A": 10.0, "A-": 9.0,
        "B+": 8.5, "B": 8.0, "B-": 7.5,
        "C+": 7.0, "C": 6.5, "C-": 6.0,
        "D+": 5.5, "D": 5.0, "D-": 4.5,
        "F": 0.0,
    },
}

# Percentage to letter grade thresholds (standard US grading)
PERCENTAGE_THRESHOLDS = {
    "4.0": [
        (97, "A+"), (93, "A"), (90, "A-"),
        (87, "B+"), (83, "B"), (80, "B-"),
        (77, "C+"), (73, "C"), (70, "C-"),
        (67, "D+"), (63, "D"), (60, "D-"),
        (0, "F"),
    ],
    "5.0": [
        (90, "A+"), (85, "A"), (80, "A-"),
        (75, "B+"), (70, "B"), (65, "B-"),
        (60, "C+"), (55, "C"), (50, "C-"),
        (45, "D+"), (40, "D"), (35, "D-"),
        (0, "F"),
    ],
    "10": [
        (95, "A+"), (90, "A"), (85, "A-"),
        (80, "B+"), (75, "B"), (70, "B-"),
        (65, "C+"), (60, "C"), (55, "C-"),
        (50, "D+"), (45, "D"), (40, "D-"),
        (0, "F"),
    ],
}


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


def get_scale_mapping(grade_scale: str) -> Dict[str, float]:
    """Get the letter-to-points mapping for a grade scale."""
    return GRADE_SCALES.get(grade_scale, GRADE_SCALES["4.0"])


def get_percentage_thresholds(grade_scale: str) -> List[Tuple[float, str]]:
    """Get percentage-to-letter thresholds for a grade scale."""
    return PERCENTAGE_THRESHOLDS.get(grade_scale, PERCENTAGE_THRESHOLDS["4.0"])


def letter_to_points(grade_letter: str, grade_scale: str = "4.0") -> Optional[float]:
    """Convert letter grade to numeric points on the given scale."""
    if not grade_letter:
        return None
    scale = get_scale_mapping(grade_scale)
    return scale.get(grade_letter.upper().strip(), None)


def percentage_to_letter(percentage: float, grade_scale: str = "4.0") -> str:
    """Convert percentage score to letter grade using scale-appropriate thresholds."""
    thresholds = get_percentage_thresholds(grade_scale)
    for min_pct, letter in thresholds:
        if percentage >= min_pct:
            return letter
    return "F"


def points_to_letter(points: float, grade_scale: str = "4.0") -> Optional[str]:
    """Find the letter grade that corresponds to the given numeric points."""
    scale = get_scale_mapping(grade_scale)
    for letter, pts in scale.items():
        if abs(pts - points) < 0.01:  # Floating point tolerance
            return letter
    return None


def sync_grade_fields(
    grade_letter: Optional[str] = None,
    percentage: Optional[float] = None,
    grade_scale: str = "4.0",
) -> Tuple[Optional[str], Optional[float], float]:
    """
    Synchronize grade_letter and percentage based on whichever is provided.
    Returns (synced_letter, synced_percentage, grade_points).
    """
    grade_points = None
    synced_letter = grade_letter
    synced_percentage = percentage

    if grade_letter and not percentage:
        # Convert letter to points, then estimate percentage midpoint
        grade_points = letter_to_points(grade_letter, grade_scale)
        if grade_points is not None:
            # Estimate percentage as midpoint of letter's range
            thresholds = get_percentage_thresholds(grade_scale)
            for i, (min_pct, letter) in enumerate(thresholds):
                if letter == grade_letter.upper():
                    next_min = thresholds[i + 1][0] if i + 1 < len(thresholds) else 0
                    synced_percentage = (min_pct + next_min) / 2
                    break
    elif percentage is not None and not grade_letter:
        # Convert percentage to letter
        synced_letter = percentage_to_letter(percentage, grade_scale)
        grade_points = letter_to_points(synced_letter, grade_scale)

    if grade_letter and percentage is not None:
        # Both provided - validate consistency, prefer letter for points
        grade_points = letter_to_points(grade_letter, grade_scale)
        # Check if percentage maps to same letter
        expected_letter = percentage_to_letter(percentage, grade_scale)
        if expected_letter != grade_letter.upper():
            # Letter takes precedence for grade points
            pass

    return synced_letter, synced_percentage, grade_points


def _entry_to_calc(entry) -> CalcEntry:
    """Convert a GpaEntry model to CalcEntry."""
    grade_points = letter_to_points(entry.grade_letter, entry.grade_scale)
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


def calculate_semester_gpa(entries: List[CalcEntry], grade_scale: str = "4.0") -> Tuple[float, float, float]:
    """
    Calculate GPA for a single semester.
    Returns (gpa, total_quality_points, total_credits).
    """
    total_qp = 0.0
    total_credits = 0.0

    for entry in entries:
        if entry.entry_type != "course":
            continue
        if entry.credit_hours <= 0:
            continue

        grade_points = letter_to_points(entry.grade_letter, entry.grade_scale)
        if grade_points is None:
            continue

        total_qp += entry.credit_hours * grade_points
        total_credits += entry.credit_hours

    gpa = total_qp / total_credits if total_credits > 0 else 0.0
    return round(gpa, 2), total_qp, total_credits


def calculate_cgpa(entries: List[CalcEntry]) -> Tuple[float, float, float]:
    """
    Calculate cumulative GPA across all semesters.
    Returns (cgpa, total_quality_points, total_credits).
    """
    # Filter to course entries only
    course_entries = [e for e in entries if e.entry_type == "course"]

    total_qp = 0.0
    total_credits = 0.0

    for entry in course_entries:
        if entry.credit_hours <= 0:
            continue
        grade_points = letter_to_points(entry.grade_letter, entry.grade_scale)
        if grade_points is None:
            continue

        total_qp += entry.credit_hours * grade_points
        total_credits += entry.credit_hours

    cgpa = total_qp / total_credits if total_credits > 0 else 0.0
    return round(cgpa, 2), total_qp, total_credits


def build_semester_summaries(entries: List[CalcEntry], grade_scale: str = "4.0") -> List[Dict]:
    """Build semester summaries from entries, sorted chronologically."""
    # Group by semester + academic_year
    from collections import defaultdict
    grouped = defaultdict(list)
    for entry in entries:
        key = (entry.semester, entry.academic_year or "")
        grouped[key].append(entry)

    summaries = []
    # Sort by academic year then semester order
    semester_order = {"Spring": 1, "Summer": 2, "Fall": 3}

    for (semester, year), sem_entries in sorted(
        grouped.items(),
        key=lambda x: (x[0][1] or "0", semester_order.get(x[0][0], 0))
    ):
        gpa, qp, credits = calculate_semester_gpa(sem_entries, grade_scale)

        # Build entry responses
        entry_responses = []
        for e in sorted(sem_entries, key=lambda x: x.course_label):
            gp = letter_to_points(e.grade_letter, e.grade_scale)
            entry_responses.append({
                "id": e.id,
                "course_label": e.course_label,
                "credit_hours": e.credit_hours,
                "grade_letter": e.grade_letter,
                "percentage": e.percentage,
                "grade_scale": e.grade_scale,
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


def calculate_what_if_scenarios(
    current_entries: List[CalcEntry],
    remaining_credits: float,
    target_cgpa: Optional[float] = None,
    target_semester_gpa: Optional[float] = None,
    grade_scale: str = "4.0",
) -> Dict:
    """
    Calculate what-if scenarios for GPA planning.
    """
    # Current CGPA
    current_cgpa, current_qp, current_credits = calculate_cgpa(current_entries)

    scenarios = []

    # Scenario 1: Target CGPA - what grade average needed on remaining credits
    if target_cgpa is not None and remaining_credits > 0:
        # target_cgpa = (current_qp + remaining_credits * needed_gpa) / (current_credits + remaining_credits)
        # needed_gpa = (target_cgpa * (current_credits + remaining_credits) - current_qp) / remaining_credits
        needed_gpa = (
            target_cgpa * (current_credits + remaining_credits) - current_qp
        ) / remaining_credits

        scenarios.append({
            "name": f"Achieve {target_cgpa:.2f} CGPA",
            "description": f"Need {needed_gpa:.2f} GPA on {remaining_credits} remaining credits",
            "projected_cgpa": target_cgpa,
            "projected_credits": current_credits + remaining_credits,
            "grade_needed": round(needed_gpa, 2),
        })

        # Check if achievable (max on scale)
        max_scale = max(GRADE_SCALES[grade_scale].values())
        is_achievable = needed_gpa <= max_scale
    else:
        is_achievable = None

    # Scenario 2: Target semester GPA
    if target_semester_gpa is not None and remaining_credits > 0:
        # Projected CGPA if we hit target semester GPA
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

    # Scenario 3: Straight A's
    max_grade = max(GRADE_SCALES[grade_scale].values())
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

    # Scenario 4: Current trajectory (maintain current semester GPA)
    if current_entries:
        # Calculate current semester GPA from most recent entries
        from collections import defaultdict
        recent_semester = None
        if current_entries:
            # Find most recent semester with entries
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
        "grade_needed_for_target_cgpa": round(needed_gpa, 2) if target_cgpa else None,
        "is_target_achievable": is_achievable,
    }


def enrich_entry_response(entry: CalcEntry) -> Dict[str, Any]:
    """Enrich a CalcEntry with computed fields for API response."""
    grade_points = letter_to_points(entry.grade_letter, entry.grade_scale)
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