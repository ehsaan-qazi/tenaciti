"""
Profile & Retrospective service — analytical engine for Phase 7 profile metrics,
planning accuracy, confidence trends, topic coverage trends, note-density correlations,
procrastination fingerprints, and auto-generated retrospective reports.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.roadmap_node import RoadmapNode
from app.models.topic import Topic
from app.models.topic_completion import TopicCompletion
from app.models.note import Note
from app.models.note_link import NoteLink
from app.models.self_assessment_log import SelfAssessmentLog
from app.models.streak import Streak

from app.schemas.profile import (
    ProfileSummaryResponse,
    PlanningAccuracyResponse,
    CoursePlanningAccuracy,
    ConfidenceTrendsResponse,
    CourseConfidenceTrend,
    ConfidenceTrendPoint,
    TopicCoverageTrendsResponse,
    CourseTopicCoverageTrend,
    TopicCoverageTrendPoint,
    NoteDensityCorrelationResponse,
    NoteDensityPoint,
    ProcrastinationFingerprintResponse,
    ProcrastinationBucket,
    RetrospectiveReportResponse,
    RetrospectiveSemesterSummary,
    RetrospectiveCourseDetail,
    RetrospectiveRequest,
    ProfileTrendsQuery,
)


def calculate_pearson_r(x: List[float], y: List[float]) -> Optional[float]:
    """Calculate Pearson correlation coefficient r between two numeric series."""
    if len(x) != len(y) or len(x) < 2:
        return None
    
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n

    cov = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    var_x = sum((xi - mean_x) ** 2 for xi in x)
    var_y = sum((yi - mean_y) ** 2 for yi in y)

    if var_x == 0 or var_y == 0:
        return None

    r = cov / (math.sqrt(var_x) * math.sqrt(var_y))
    # Clamp to [-1.0, 1.0] to handle floating point precision artifacts
    return max(-1.0, min(1.0, round(r, 3)))


class ProfileService:
    """Service layer handling academic profile analytics & retrospective reports."""

    @staticmethod
    async def get_profile_summary(user_id: int, db: AsyncSession) -> ProfileSummaryResponse:
        """
        Compute overall user profile summary metrics:
        - Total nodes, completed nodes, pending nodes, completion rate
        - Avg estimated vs actual hours
        - Total active courses
        - Topics total, completed, completion rate
        - Notes & note links totals
        """
        # 1. Roadmap nodes stats
        nodes_res = await db.execute(
            select(
                func.count(RoadmapNode.id).label("total"),
                func.count(RoadmapNode.id).filter(
                    RoadmapNode.status.in_(["Submitted", "Graded"])
                ).label("completed"),
                func.count(RoadmapNode.id).filter(
                    RoadmapNode.status.in_(["Pending", "In Progress"])
                ).label("pending"),
                func.avg(RoadmapNode.estimated_hours).label("avg_est"),
                func.avg(RoadmapNode.actual_hours).filter(
                    RoadmapNode.status.in_(["Submitted", "Graded"])
                ).label("avg_act"),
            ).where(RoadmapNode.user_id == user_id)
        )
        n_row = nodes_res.one()

        total_nodes = n_row.total or 0
        completed_nodes = n_row.completed or 0
        pending_nodes = n_row.pending or 0
        completion_rate = round((completed_nodes / total_nodes * 100.0), 1) if total_nodes > 0 else 0.0
        avg_est = round(float(n_row.avg_est), 1) if n_row.avg_est is not None else None
        avg_act = round(float(n_row.avg_act), 1) if n_row.avg_act is not None else None

        # 2. Active courses count
        courses_res = await db.execute(
            select(func.count(Course.id)).where(
                and_(Course.user_id == user_id, Course.is_archived.is_(False))
            )
        )
        total_courses = courses_res.scalar_one() or 0

        # 3. Topics stats
        topics_total_res = await db.execute(
            select(func.count(Topic.id)).where(Topic.user_id == user_id)
        )
        total_topics = topics_total_res.scalar_one() or 0

        topics_comp_res = await db.execute(
            select(func.count(TopicCompletion.id)).where(
                and_(
                    TopicCompletion.user_id == user_id,
                    TopicCompletion.is_completed.is_(True),
                )
            )
        )
        completed_topics = topics_comp_res.scalar_one() or 0
        topic_completion_rate = round((completed_topics / total_topics * 100.0), 1) if total_topics > 0 else 0.0

        # 4. Notes stats
        notes_res = await db.execute(
            select(func.count(Note.id)).where(Note.user_id == user_id)
        )
        total_notes = notes_res.scalar_one() or 0

        note_links_res = await db.execute(
            select(func.count(NoteLink.id))
            .select_from(NoteLink)
            .join(Note, NoteLink.source_note_id == Note.id)
            .where(Note.user_id == user_id)
        )
        total_note_links = note_links_res.scalar_one() or 0

        return ProfileSummaryResponse(
            total_nodes=total_nodes,
            completed_nodes=completed_nodes,
            pending_nodes=pending_nodes,
            completion_rate=completion_rate,
            avg_estimated_hours=avg_est,
            avg_actual_hours=avg_act,
            total_courses=total_courses,
            total_topics=total_topics,
            completed_topics=completed_topics,
            topic_completion_rate=topic_completion_rate,
            total_notes=total_notes,
            total_note_links=total_note_links,
        )

    @staticmethod
    async def get_planning_accuracy(user_id: int, db: AsyncSession) -> PlanningAccuracyResponse:
        """
        Compute estimated vs actual hours gap and planning accuracy per course and overall.
        Accuracy score formula: max(0, 100 - abs(hours_gap_pct))
        """
        courses_res = await db.execute(
            select(Course).where(Course.user_id == user_id).order_by(Course.name)
        )
        courses = courses_res.scalars().all()

        course_accuracies: List[CoursePlanningAccuracy] = []

        total_est_sum = 0.0
        total_act_sum = 0.0
        submitted_nodes_count = 0

        for course in courses:
            nodes_res = await db.execute(
                select(
                    func.count(RoadmapNode.id).label("total_nodes"),
                    func.count(RoadmapNode.id).filter(
                        RoadmapNode.status.in_(["Submitted", "Graded"])
                    ).label("submitted_nodes"),
                    func.avg(RoadmapNode.estimated_hours).filter(
                        RoadmapNode.status.in_(["Submitted", "Graded"])
                    ).label("avg_est"),
                    func.avg(RoadmapNode.actual_hours).filter(
                        RoadmapNode.status.in_(["Submitted", "Graded"])
                    ).label("avg_act"),
                    func.sum(RoadmapNode.estimated_hours).filter(
                        RoadmapNode.status.in_(["Submitted", "Graded"])
                    ).label("sum_est"),
                    func.sum(RoadmapNode.actual_hours).filter(
                        RoadmapNode.status.in_(["Submitted", "Graded"])
                    ).label("sum_act"),
                ).where(
                    and_(
                        RoadmapNode.course_id == course.id,
                        RoadmapNode.user_id == user_id,
                    )
                )
            )
            row = nodes_res.one()
            t_nodes = row.total_nodes or 0
            s_nodes = row.submitted_nodes or 0

            avg_est = round(float(row.avg_est), 1) if row.avg_est is not None else None
            avg_act = round(float(row.avg_act), 1) if row.avg_act is not None else None

            hours_gap = None
            hours_gap_pct = None
            accuracy_score = None

            if avg_est is not None and avg_act is not None:
                hours_gap = round(avg_act - avg_est, 1)
                if avg_est > 0:
                    hours_gap_pct = round((hours_gap / avg_est) * 100.0, 1)
                    accuracy_score = round(max(0.0, 100.0 - abs(hours_gap_pct)), 1)
                else:
                    accuracy_score = 100.0 if hours_gap == 0 else 0.0

            if row.sum_est is not None:
                total_est_sum += float(row.sum_est)
            if row.sum_act is not None:
                total_act_sum += float(row.sum_act)
            submitted_nodes_count += s_nodes

            course_accuracies.append(
                CoursePlanningAccuracy(
                    course_id=course.id,
                    course_name=course.name,
                    course_code=course.code,
                    total_nodes=t_nodes,
                    submitted_nodes=s_nodes,
                    avg_estimated_hours=avg_est,
                    avg_actual_hours=avg_act,
                    hours_gap=hours_gap,
                    hours_gap_pct=hours_gap_pct,
                    accuracy_score=accuracy_score,
                )
            )

        overall_avg_est = None
        overall_avg_act = None
        overall_hours_gap = None
        overall_accuracy_score = None

        if submitted_nodes_count > 0:
            overall_avg_est = round(total_est_sum / submitted_nodes_count, 1)
            overall_avg_act = round(total_act_sum / submitted_nodes_count, 1)
            overall_hours_gap = round(overall_avg_act - overall_avg_est, 1)
            if overall_avg_est > 0:
                overall_gap_pct = (overall_hours_gap / overall_avg_est) * 100.0
                overall_accuracy_score = round(max(0.0, 100.0 - abs(overall_gap_pct)), 1)

        return PlanningAccuracyResponse(
            courses=course_accuracies,
            overall_avg_estimated=overall_avg_est,
            overall_avg_actual=overall_avg_act,
            overall_hours_gap=overall_hours_gap,
            overall_accuracy_score=overall_accuracy_score,
        )

    @staticmethod
    async def get_confidence_trends(
        user_id: int, query: ProfileTrendsQuery, db: AsyncSession
    ) -> ConfidenceTrendsResponse:
        """
        Calculate confidence trend timeline over the last N days per course and overall.
        Groups node confidence ratings by date (YYYY-MM-DD).
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=query.days)

        # Base query for nodes created within timeframe with confidence rating
        base_stmt = select(RoadmapNode).where(
            and_(
                RoadmapNode.user_id == user_id,
                RoadmapNode.created_at >= cutoff_date,
                RoadmapNode.confidence_at_creation.isnot(None),
            )
        )

        if query.course_id:
            base_stmt = base_stmt.where(RoadmapNode.course_id == query.course_id)

        res = await db.execute(base_stmt.order_by(RoadmapNode.created_at.asc()))
        nodes = res.scalars().all()

        # Group by course and date
        course_date_map: Dict[int, Dict[str, List[RoadmapNode]]] = {}
        overall_date_map: Dict[str, List[RoadmapNode]] = {}

        # Pre-fetch relevant course names
        courses_res = await db.execute(
            select(Course).where(Course.user_id == user_id)
        )
        courses_dict = {c.id: c for c in courses_res.scalars().all()}

        for n in nodes:
            d_str = n.created_at.strftime("%Y-%m-%d")
            
            if n.course_id not in course_date_map:
                course_date_map[n.course_id] = {}
            if d_str not in course_date_map[n.course_id]:
                course_date_map[n.course_id][d_str] = []
            course_date_map[n.course_id][d_str].append(n)

            if d_str not in overall_date_map:
                overall_date_map[d_str] = []
            overall_date_map[d_str].append(n)

        course_trends: List[CourseConfidenceTrend] = []
        for c_id, date_map in course_date_map.items():
            c_obj = courses_dict.get(c_id)
            if not c_obj:
                continue
            
            trend_points: List[ConfidenceTrendPoint] = []
            for d_str in sorted(date_map.keys()):
                group = date_map[d_str]
                conf_creation = sum(item.confidence_at_creation for item in group) / len(group)
                ext_conf_list = [float(item.extraction_confidence) for item in group if item.extraction_confidence is not None]
                avg_ext = sum(ext_conf_list) / len(ext_conf_list) if ext_conf_list else None

                trend_points.append(
                    ConfidenceTrendPoint(
                        date=d_str,
                        avg_confidence_at_creation=round(conf_creation, 2),
                        avg_extraction_confidence=round(avg_ext, 2) if avg_ext is not None else None,
                        node_count=len(group),
                    )
                )
            
            course_trends.append(
                CourseConfidenceTrend(
                    course_id=c_id,
                    course_name=c_obj.name,
                    course_code=c_obj.code,
                    trend=trend_points,
                )
            )

        overall_trend_points: List[ConfidenceTrendPoint] = []
        for d_str in sorted(overall_date_map.keys()):
            group = overall_date_map[d_str]
            conf_creation = sum(item.confidence_at_creation for item in group) / len(group)
            ext_conf_list = [float(item.extraction_confidence) for item in group if item.extraction_confidence is not None]
            avg_ext = sum(ext_conf_list) / len(ext_conf_list) if ext_conf_list else None

            overall_trend_points.append(
                ConfidenceTrendPoint(
                    date=d_str,
                    avg_confidence_at_creation=round(conf_creation, 2),
                    avg_extraction_confidence=round(avg_ext, 2) if avg_ext is not None else None,
                    node_count=len(group),
                )
            )

        return ConfidenceTrendsResponse(
            courses=course_trends,
            overall_trend=overall_trend_points,
        )

    @staticmethod
    async def get_topic_coverage_trends(
        user_id: int, query: ProfileTrendsQuery, db: AsyncSession
    ) -> TopicCoverageTrendsResponse:
        """
        Calculate topic completion coverage trends over time.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=query.days)

        tc_stmt = (
            select(TopicCompletion, Topic)
            .join(Topic, TopicCompletion.topic_id == Topic.id)
            .where(
                and_(
                    TopicCompletion.user_id == user_id,
                    TopicCompletion.is_completed.is_(True),
                    TopicCompletion.completed_at >= cutoff_date,
                )
            )
        )
        if query.course_id:
            tc_stmt = tc_stmt.where(Topic.course_id == query.course_id)

        res = await db.execute(tc_stmt.order_by(TopicCompletion.completed_at.asc()))
        completions = res.all()

        # Fetch course & total topic details
        courses_res = await db.execute(
            select(Course).where(Course.user_id == user_id)
        )
        courses_dict = {c.id: c for c in courses_res.scalars().all()}

        # Count total topics per course
        topics_count_res = await db.execute(
            select(Topic.course_id, func.count(Topic.id)).where(Topic.user_id == user_id).group_by(Topic.course_id)
        )
        course_topic_totals = {c_id: count for c_id, count in topics_count_res.all()}
        grand_total_topics = sum(course_topic_totals.values()) or 1

        course_date_completions: Dict[int, Dict[str, int]] = {}
        overall_date_completions: Dict[str, int] = {}

        for tc, t in completions:
            d_str = tc.completed_at.strftime("%Y-%m-%d") if tc.completed_at else datetime.now(timezone.utc).strftime("%Y-%m-%d")
            
            if t.course_id not in course_date_completions:
                course_date_completions[t.course_id] = {}
            course_date_completions[t.course_id][d_str] = course_date_completions[t.course_id].get(d_str, 0) + 1
            overall_date_completions[d_str] = overall_date_completions.get(d_str, 0) + 1

        course_coverage_trends: List[CourseTopicCoverageTrend] = []
        for c_id, date_counts in course_date_completions.items():
            c_obj = courses_dict.get(c_id)
            if not c_obj:
                continue

            c_total = course_topic_totals.get(c_id, 1)
            running_count = 0
            trend_points: List[TopicCoverageTrendPoint] = []
            
            for d_str in sorted(date_counts.keys()):
                running_count += date_counts[d_str]
                pct = round(min(100.0, (running_count / c_total) * 100.0), 1)
                trend_points.append(
                    TopicCoverageTrendPoint(
                        date=d_str,
                        completed_topics=running_count,
                        total_topics=c_total,
                        coverage_pct=pct,
                    )
                )

            course_coverage_trends.append(
                CourseTopicCoverageTrend(
                    course_id=c_id,
                    course_name=c_obj.name,
                    course_code=c_obj.code,
                    trend=trend_points,
                )
            )

        running_overall = 0
        overall_trend_points: List[TopicCoverageTrendPoint] = []
        for d_str in sorted(overall_date_completions.keys()):
            running_overall += overall_date_completions[d_str]
            pct = round(min(100.0, (running_overall / grand_total_topics) * 100.0), 1)
            overall_trend_points.append(
                TopicCoverageTrendPoint(
                    date=d_str,
                    completed_topics=running_overall,
                    total_topics=grand_total_topics,
                    coverage_pct=pct,
                )
            )

        return TopicCoverageTrendsResponse(
            courses=course_coverage_trends,
            overall_trend=overall_trend_points,
        )

    @staticmethod
    async def get_note_density_correlation(user_id: int, db: AsyncSession) -> NoteDensityCorrelationResponse:
        """
        Analyze correlation between note density (notes/links written per topic/node)
        and academic outcomes (quality rating or node grade).
        """
        # Fetch topics with linked roadmap nodes, course names, completions, and notes
        topics_res = await db.execute(
            select(Topic)
            .options(
                selectinload(Topic.course),
                selectinload(Topic.linked_node),
                selectinload(Topic.completions),
                selectinload(Topic.notes),
            )
            .where(Topic.user_id == user_id)
        )
        topics = topics_res.scalars().all()

        note_links_res = await db.execute(
            select(NoteLink)
            .join(Note, NoteLink.source_note_id == Note.id)
            .where(Note.user_id == user_id)
        )
        links = note_links_res.scalars().all()
        note_link_counts: Dict[int, int] = {}
        for link in links:
            note_link_counts[link.source_note_id] = note_link_counts.get(link.source_note_id, 0) + 1
            note_link_counts[link.target_note_id] = note_link_counts.get(link.target_note_id, 0) + 1

        # Pre-fetch self assessment logs by roadmap node id
        sal_res = await db.execute(
            select(SelfAssessmentLog).where(SelfAssessmentLog.user_id == user_id)
        )
        sal_dict = {sal.roadmap_node_id: sal for sal in sal_res.scalars().all()}

        data_points: List[NoteDensityPoint] = []
        notes_vec: List[float] = []
        links_vec: List[float] = []

        for t in topics:
            c_name = t.course.name if t.course else "Unknown"
            n_count = len(t.notes)
            
            l_count = sum(note_link_counts.get(n.id, 0) for n in t.notes)

            comp_conf = None
            if t.completions:
                comp = t.completions[0]
                comp_conf = comp.confidence_rating

            grade_val = None
            quality_val = None
            if t.linked_node:
                if t.linked_node.grade is not None:
                    grade_val = float(t.linked_node.grade)
                sal = sal_dict.get(t.linked_node.id)
                if sal:
                    quality_val = sal.quality_self_rating

            if comp_conf is not None and quality_val is None:
                quality_val = comp_conf

            dp = NoteDensityPoint(
                topic_id=t.id,
                topic_title=t.title,
                course_id=t.course_id,
                course_name=c_name,
                notes_count=n_count,
                note_links_count=l_count,
                completion_confidence=comp_conf,
                node_grade=grade_val,
                node_quality_rating=quality_val,
            )
            data_points.append(dp)

            notes_vec.append(float(n_count))
            links_vec.append(float(l_count))

        # Calculate Pearson correlations where paired values exist
        # 1. Notes vs Grade
        notes_g_pairs = [(notes_vec[i], data_points[i].node_grade) for i in range(len(data_points)) if data_points[i].node_grade is not None]
        r_notes_grade = calculate_pearson_r([p[0] for p in notes_g_pairs], [p[1] for p in notes_g_pairs]) if notes_g_pairs else None

        # 2. Links vs Grade
        links_g_pairs = [(links_vec[i], data_points[i].node_grade) for i in range(len(data_points)) if data_points[i].node_grade is not None]
        r_links_grade = calculate_pearson_r([p[0] for p in links_g_pairs], [p[1] for p in links_g_pairs]) if links_g_pairs else None

        # 3. Notes vs Quality
        notes_q_pairs = [(notes_vec[i], float(data_points[i].node_quality_rating)) for i in range(len(data_points)) if data_points[i].node_quality_rating is not None]
        r_notes_quality = calculate_pearson_r([p[0] for p in notes_q_pairs], [p[1] for p in notes_q_pairs]) if notes_q_pairs else None

        # 4. Links vs Quality
        links_q_pairs = [(links_vec[i], float(data_points[i].node_quality_rating)) for i in range(len(data_points)) if data_points[i].node_quality_rating is not None]
        r_links_quality = calculate_pearson_r([p[0] for p in links_q_pairs], [p[1] for p in links_q_pairs]) if links_q_pairs else None

        # Formulate dynamic interpretation summary
        summary_parts = []
        if r_notes_quality is not None and r_notes_quality > 0.3:
            summary_parts.append(f"Strong positive correlation (r = {r_notes_quality}) between note count and submission quality.")
        elif r_notes_quality is not None and r_notes_quality < -0.3:
            summary_parts.append(f"Negative correlation (r = {r_notes_quality}) between note count and submission quality.")
        
        if r_links_grade is not None and r_links_grade > 0.3:
            summary_parts.append(f"Interlinked notes show a clear positive impact on node grades (r = {r_links_grade}).")
        
        if not summary_parts:
            if len(data_points) == 0:
                summary_text = "No topic note data available yet. Create and link notes to topics to view correlation insights."
            else:
                summary_text = "Data collection in progress. Keep writing linked notes and submitting assessments to unlock stronger statistical insights."
        else:
            summary_text = " ".join(summary_parts)

        return NoteDensityCorrelationResponse(
            data_points=data_points,
            correlation_notes_vs_grade=r_notes_grade,
            correlation_links_vs_grade=r_links_grade,
            correlation_notes_vs_quality=r_notes_quality,
            correlation_links_vs_quality=r_links_quality,
            summary=summary_text,
        )

    @staticmethod
    async def get_procrastination_fingerprint(user_id: int, db: AsyncSession) -> ProcrastinationFingerprintResponse:
        """
        Analyze submission timing relative to deadlines:
        - 0-6 hrs ("Last Minute")
        - 6-24 hrs ("Same Day")
        - 24-72 hrs (1-3 days, "Early")
        - 72-168 hrs (3-7 days, "Well Prepared")
        - 168+ hrs (1+ weeks, "Proactive")
        """
        sal_res = await db.execute(
            select(SelfAssessmentLog, RoadmapNode)
            .join(RoadmapNode, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
            .where(
                and_(
                    SelfAssessmentLog.user_id == user_id,
                    RoadmapNode.status.in_(["Submitted", "Graded"]),
                )
            )
        )
        logs = sal_res.all()

        hours_list: List[float] = []
        for sal, node in logs:
            h = None
            if sal.hours_before_deadline is not None:
                h = float(sal.hours_before_deadline)
            elif node.submitted_at and node.deadline:
                delta = (node.deadline - node.submitted_at).total_seconds() / 3600.0
                h = delta
            
            if h is not None:
                hours_list.append(h)

        total_analyzed = len(hours_list)

        # Buckets definition
        b_0_6 = 0
        b_6_24 = 0
        b_24_72 = 0
        b_72_168 = 0
        b_168_plus = 0

        for h in hours_list:
            if h < 6:
                b_0_6 += 1
            elif h < 24:
                b_6_24 += 1
            elif h < 72:
                b_24_72 += 1
            elif h < 168:
                b_72_168 += 1
            else:
                b_168_plus += 1

        def pct(cnt: int) -> float:
            return round((cnt / total_analyzed * 100.0), 1) if total_analyzed > 0 else 0.0

        buckets = [
            ProcrastinationBucket(
                range_label="0-6 hrs",
                range_start_hours=0.0,
                range_end_hours=6.0,
                count=b_0_6,
                percentage=pct(b_0_6),
            ),
            ProcrastinationBucket(
                range_label="6-24 hrs",
                range_start_hours=6.0,
                range_end_hours=24.0,
                count=b_6_24,
                percentage=pct(b_6_24),
            ),
            ProcrastinationBucket(
                range_label="1-3 days",
                range_start_hours=24.0,
                range_end_hours=72.0,
                count=b_24_72,
                percentage=pct(b_24_72),
            ),
            ProcrastinationBucket(
                range_label="3-7 days",
                range_start_hours=72.0,
                range_end_hours=168.0,
                count=b_72_168,
                percentage=pct(b_72_168),
            ),
            ProcrastinationBucket(
                range_label="1+ week",
                range_start_hours=168.0,
                range_end_hours=None,
                count=b_168_plus,
                percentage=pct(b_168_plus),
            ),
        ]

        avg_h = round(sum(hours_list) / total_analyzed, 1) if total_analyzed > 0 else None
        
        median_h = None
        if total_analyzed > 0:
            sorted_h = sorted(hours_list)
            mid = total_analyzed // 2
            if total_analyzed % 2 == 0:
                median_h = round((sorted_h[mid - 1] + sorted_h[mid]) / 2.0, 1)
            else:
                median_h = round(sorted_h[mid], 1)

        on_time_cnt = sum(1 for h in hours_list if h >= 0)
        early_cnt = sum(1 for h in hours_list if h >= 24)
        last_min_cnt = sum(1 for h in hours_list if 0 <= h < 6)

        on_time_rate = pct(on_time_cnt)
        early_submission_rate = pct(early_cnt)
        last_minute_rate = pct(last_min_cnt)

        # Behavioral Archetype Interpretation
        if total_analyzed == 0:
            interpretation = "No submission data yet. Submit roadmap node self-assessments to reveal your procrastination profile."
        elif early_submission_rate >= 60.0:
            interpretation = f"Early Planner: You submit {early_submission_rate}% of your work more than 24 hours ahead of deadlines."
        elif last_minute_rate >= 50.0:
            interpretation = f"Deadline Sprinter: {last_minute_rate}% of your submissions happen in the final 6 hours before deadline."
        else:
            interpretation = f"Balanced Submitter: You maintain a steady pacing with an average buffer of {avg_h or 0} hours before deadlines."

        return ProcrastinationFingerprintResponse(
            buckets=buckets,
            avg_hours_before_deadline=avg_h,
            median_hours_before_deadline=median_h,
            on_time_rate=on_time_rate,
            early_submission_rate=early_submission_rate,
            last_minute_rate=last_minute_rate,
            total_submissions_analyzed=total_analyzed,
            interpretation=interpretation,
        )

    @staticmethod
    async def get_retrospective_report(
        user_id: int, request: RetrospectiveRequest, db: AsyncSession
    ) -> RetrospectiveReportResponse:
        """
        Generate full retrospective report for a semester or all time.
        Includes semester summaries, course details, streaks, GPA stats, qualitative insights, and recommendations.
        """
        # Fetch user's courses
        c_stmt = select(Course).where(Course.user_id == user_id)
        if not request.include_all_time:
            if request.semester:
                c_stmt = c_stmt.where(Course.semester == request.semester)
            if request.academic_year:
                c_stmt = c_stmt.where(Course.academic_year == request.academic_year)

        c_res = await db.execute(c_stmt.order_by(Course.semester, Course.name))
        courses = c_res.scalars().all()

        period_title = "All Time"
        if not request.include_all_time:
            if request.semester and request.academic_year:
                period_title = f"{request.semester} {request.academic_year}"
            elif request.semester:
                period_title = f"{request.semester} Semester"
            elif request.academic_year:
                period_title = f"AY {request.academic_year}"

        # Group courses by semester
        semesters_map: Dict[str, List[Course]] = {}
        for c in courses:
            sem_key = f"{c.semester} {c.academic_year}" if c.academic_year else c.semester
            if sem_key not in semesters_map:
                semesters_map[sem_key] = []
            semesters_map[sem_key].append(c)

        # Pre-fetch streaks
        streak_res = await db.execute(select(Streak).where(Streak.user_id == user_id))
        user_streak = streak_res.scalar_one_or_none()
        act_streak_max = user_streak.longest_activity_streak if user_streak else 0
        ontime_streak_max = user_streak.longest_on_time_streak if user_streak else 0

        semester_summaries: List[RetrospectiveSemesterSummary] = []
        course_details: List[RetrospectiveCourseDetail] = []

        total_nodes_all = 0
        completed_nodes_all = 0
        total_est_hours_all = 0.0
        total_act_hours_all = 0.0

        for sem_name, sem_courses in semesters_map.items():
            sem_course_ids = [c.id for c in sem_courses]
            
            # Nodes for this semester
            n_res = await db.execute(
                select(RoadmapNode).where(
                    and_(
                        RoadmapNode.user_id == user_id,
                        RoadmapNode.course_id.in_(sem_course_ids),
                    )
                )
            )
            sem_nodes = n_res.scalars().all()
            
            t_nodes = len(sem_nodes)
            c_nodes = sum(1 for n in sem_nodes if n.status in ["Submitted", "Graded"])

            total_nodes_all += t_nodes
            completed_nodes_all += c_nodes

            # Grades & Hours
            grades = [float(n.grade) for n in sem_nodes if n.grade is not None]
            avg_grade = round(sum(grades) / len(grades), 1) if grades else None

            # Self assessments
            node_ids = [n.id for n in sem_nodes]
            sal_qualities = []
            sal_buffers = []

            if node_ids:
                sal_res = await db.execute(
                    select(SelfAssessmentLog).where(
                        and_(
                            SelfAssessmentLog.user_id == user_id,
                            SelfAssessmentLog.roadmap_node_id.in_(node_ids),
                        )
                    )
                )
                sals = sal_res.scalars().all()
                sal_qualities = [sal.quality_self_rating for sal in sals if sal.quality_self_rating is not None]
                sal_buffers = [float(sal.hours_before_deadline) for sal in sals if sal.hours_before_deadline is not None]

            avg_qual = round(sum(sal_qualities) / len(sal_qualities), 1) if sal_qualities else None
            avg_h_before = round(sum(sal_buffers) / len(sal_buffers), 1) if sal_buffers else None

            sem_est_sum = sum(float(n.estimated_hours) for n in sem_nodes if n.estimated_hours and n.status in ["Submitted", "Graded"])
            sem_act_sum = sum(float(n.actual_hours) for n in sem_nodes if n.actual_hours and n.status in ["Submitted", "Graded"])
            
            total_est_hours_all += sem_est_sum
            total_act_hours_all += sem_act_sum

            sem_hours_gap = round(sem_act_sum - sem_est_sum, 1)

            # Topics
            top_res = await db.execute(
                select(Topic).where(
                    and_(
                        Topic.user_id == user_id,
                        Topic.course_id.in_(sem_course_ids),
                    )
                )
            )
            sem_topics = top_res.scalars().all()
            top_total = len(sem_topics)

            top_comp_cnt = 0
            if sem_topics:
                tc_res = await db.execute(
                    select(func.count(TopicCompletion.id)).where(
                        and_(
                            TopicCompletion.user_id == user_id,
                            TopicCompletion.topic_id.in_([t.id for t in sem_topics]),
                            TopicCompletion.is_completed.is_(True),
                        )
                    )
                )
                top_comp_cnt = tc_res.scalar_one() or 0

            top_cov_pct = round((top_comp_cnt / top_total * 100.0), 1) if top_total > 0 else 0.0

            # Notes
            notes_cnt_res = await db.execute(
                select(func.count(Note.id)).where(
                    and_(
                        Note.user_id == user_id,
                        Note.course_id.in_(sem_course_ids),
                    )
                )
            )
            notes_cnt = notes_cnt_res.scalar_one() or 0

            note_links_cnt_res = await db.execute(
                select(func.count(NoteLink.id))
                .select_from(NoteLink)
                .join(Note, NoteLink.source_note_id == Note.id)
                .where(Note.user_id == user_id)
            )
            links_cnt = note_links_cnt_res.scalar_one() or 0

            comp_rate = round((c_nodes / t_nodes * 100.0), 1) if t_nodes > 0 else 0.0

            semester_summaries.append(
                RetrospectiveSemesterSummary(
                    semester=sem_name,
                    academic_year=sem_courses[0].academic_year if sem_courses else None,
                    total_nodes=t_nodes,
                    completed_nodes=c_nodes,
                    completion_rate=comp_rate,
                    avg_grade=avg_grade,
                    avg_quality_rating=avg_qual,
                    avg_hours_before_deadline=avg_h_before,
                    total_estimated_hours=round(sem_est_sum, 1),
                    total_actual_hours=round(sem_act_sum, 1),
                    hours_gap=sem_hours_gap,
                    topics_completed=top_comp_cnt,
                    topics_total=top_total,
                    topic_coverage_pct=top_cov_pct,
                    notes_created=notes_cnt,
                    note_links_created=links_cnt,
                    activity_streak_max=act_streak_max,
                    on_time_streak_max=ontime_streak_max,
                )
            )

            # Per-course breakdown
            for c in sem_courses:
                c_nodes_list = [n for n in sem_nodes if n.course_id == c.id]
                c_t_nodes = len(c_nodes_list)
                c_c_nodes = sum(1 for n in c_nodes_list if n.status in ["Submitted", "Graded"])
                
                c_grades = [float(n.grade) for n in c_nodes_list if n.grade is not None]
                c_avg_grade = round(sum(c_grades) / len(c_grades), 1) if c_grades else None

                c_n_ids = [n.id for n in c_nodes_list]
                c_sal_qual = []
                if c_n_ids:
                    sal_c_res = await db.execute(
                        select(SelfAssessmentLog.quality_self_rating).where(
                            and_(
                                SelfAssessmentLog.user_id == user_id,
                                SelfAssessmentLog.roadmap_node_id.in_(c_n_ids),
                            )
                        )
                    )
                    c_sal_qual = [r for r in sal_c_res.scalars().all() if r is not None]
                c_avg_qual = round(sum(c_sal_qual) / len(c_sal_qual), 1) if c_sal_qual else None

                c_est = sum(float(n.estimated_hours) for n in c_nodes_list if n.estimated_hours and n.status in ["Submitted", "Graded"])
                c_act = sum(float(n.actual_hours) for n in c_nodes_list if n.actual_hours and n.status in ["Submitted", "Graded"])
                c_score = None
                if c_est > 0:
                    gap_p = ((c_act - c_est) / c_est) * 100.0
                    c_score = round(max(0.0, 100.0 - abs(gap_p)), 1)

                c_topics = [t for t in sem_topics if t.course_id == c.id]
                c_t_topics = len(c_topics)
                c_c_topics = 0
                if c_topics:
                    tc_c_res = await db.execute(
                        select(func.count(TopicCompletion.id)).where(
                            and_(
                                TopicCompletion.user_id == user_id,
                                TopicCompletion.topic_id.in_([t.id for t in c_topics]),
                                TopicCompletion.is_completed.is_(True),
                            )
                        )
                    )
                    c_c_topics = tc_c_res.scalar_one() or 0
                c_top_pct = round((c_c_topics / c_t_topics * 100.0), 1) if c_t_topics > 0 else 0.0

                c_notes_res = await db.execute(
                    select(func.count(Note.id)).where(
                        and_(Note.user_id == user_id, Note.course_id == c.id)
                    )
                )
                c_notes_cnt = c_notes_res.scalar_one() or 0

                course_details.append(
                    RetrospectiveCourseDetail(
                        course_id=c.id,
                        course_name=c.name,
                        course_code=c.code,
                        semester=sem_name,
                        nodes_completed=c_c_nodes,
                        nodes_total=c_t_nodes,
                        avg_grade=c_avg_grade,
                        avg_quality=c_avg_qual,
                        planning_accuracy_score=c_score,
                        topic_coverage_pct=c_top_pct,
                        notes_count=c_notes_cnt,
                        note_links_count=links_cnt,
                    )
                )

        # Formulate insights & recommendations
        overall_comp_rate = round((completed_nodes_all / total_nodes_all * 100.0), 1) if total_nodes_all > 0 else 0.0
        overall_hours_gap = round(total_act_hours_all - total_est_hours_all, 1)

        insights = []
        if overall_comp_rate >= 80.0:
            insights.append(f"High Task Completion: You completed {overall_comp_rate}% of all roadmap assessment nodes.")
        elif overall_comp_rate > 0:
            insights.append(f"Assessment Progress: {overall_comp_rate}% completion rate across active courses.")

        if overall_hours_gap > 0:
            insights.append(f"Time Underestimation: Actual task execution exceeded estimates by {overall_hours_gap} total hours.")
        elif overall_hours_gap < 0:
            insights.append(f"Efficient Execution: Tasks completed {abs(overall_hours_gap)} hours faster than estimated.")
        else:
            insights.append("Balanced Time Estimation: Task estimates closely matched actual hours.")

        recommendations = []
        if overall_hours_gap > 5:
            recommendations.append("Adjust baseline estimates: Increase time buffers by 15-25% for upcoming assignment nodes.")
        recommendations.append("Maintain knowledge density: Ensure each topic has at least 1 linked markdown note prior to exams.")
        recommendations.append("Pacing optimization: Target completing topic checkboxes 48+ hours ahead of major tests.")

        overall_stats = {
            "total_courses": len(courses),
            "total_nodes": total_nodes_all,
            "completed_nodes": completed_nodes_all,
            "overall_completion_rate": overall_comp_rate,
            "total_estimated_hours": round(total_est_hours_all, 1),
            "total_actual_hours": round(total_act_hours_all, 1),
            "overall_hours_gap": overall_hours_gap,
            "longest_activity_streak": act_streak_max,
            "longest_on_time_streak": ontime_streak_max,
        }

        return RetrospectiveReportResponse(
            user_id=user_id,
            generated_at=datetime.now(timezone.utc).isoformat(),
            period=period_title,
            semester_summaries=semester_summaries,
            course_details=course_details,
            overall_stats=overall_stats,
            insights=insights,
            recommendations=recommendations,
        )
