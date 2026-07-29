"""
Streak service — activity and on-time submission streak tracking.

Features:
- Activity streak: consecutive days with any logged activity
- On-time streak: consecutive submissions made before deadline
- GitHub-style 12-week heatmap (84 days)
- Automatic streak maintenance on daily activity log
"""

from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.streak import Streak
from app.models.streak_daily_log import StreakDailyLog
from app.models.roadmap_node import RoadmapNode
from app.models.self_assessment_log import SelfAssessmentLog
from app.models.topic_completion import TopicCompletion
from app.models.user import User


class StreakService:
    """Business logic for streak tracking."""

    HEATMAP_WEEKS = 12  # 12 weeks = 84 days for GitHub-style heatmap

    @staticmethod
    async def get_or_create_streak(user_id: int, db: AsyncSession) -> Streak:
        """Get existing streak record or create a new one for the user."""
        result = await db.execute(
            select(Streak).where(Streak.user_id == user_id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            streak = Streak(user_id=user_id)
            db.add(streak)
            await db.flush()
            await db.refresh(streak)

        return streak

    @staticmethod
    async def log_activity(
        user_id: int,
        activity_date: Optional[date] = None,
        action_count: int = 1,
        db: AsyncSession = None,
    ) -> Tuple[Streak, StreakDailyLog]:
        """
        Log a user activity for the given date.

        Updates the daily log and recalculates streak counts.
        Should be called whenever the user performs a meaningful action:
        - Viewing dashboard
        - Completing a topic
        - Submitting a roadmap node
        - Creating/updating a note
        - etc.

        Returns the updated Streak and the daily log entry.
        """
        if activity_date is None:
            activity_date = date.today()

        streak = await StreakService.get_or_create_streak(user_id, db)

        # Upsert daily log
        result = await db.execute(
            select(StreakDailyLog).where(
                StreakDailyLog.user_id == user_id,
                StreakDailyLog.log_date == activity_date,
            )
        )
        daily_log = result.scalar_one_or_none()

        if daily_log:
            daily_log.action_count += action_count
        else:
            daily_log = StreakDailyLog(
                user_id=user_id,
                log_date=activity_date,
                action_count=action_count,
            )
            db.add(daily_log)

        # Recalculate activity streak
        await StreakService._recalculate_activity_streak(streak, user_id, db)

        await db.flush()
        await db.refresh(streak)
        await db.refresh(daily_log)

        return streak, daily_log

    @staticmethod
    async def _recalculate_activity_streak(
        streak: Streak, user_id: int, db: AsyncSession
    ) -> None:
        """
        Recalculate the activity streak based on daily logs.

        Activity streak = number of consecutive days (including today if logged)
        with action_count > 0, going backwards from the most recent logged day.
        """
        # Get all logged dates for this user, sorted descending
        result = await db.execute(
            select(StreakDailyLog.log_date)
            .where(
                StreakDailyLog.user_id == user_id,
                StreakDailyLog.action_count > 0,
            )
            .order_by(StreakDailyLog.log_date.desc())
        )
        logged_dates = [row[0] for row in result.fetchall()]

        if not logged_dates:
            streak.activity_streak_count = 0
            streak.last_activity_date = None
            return

        today = date.today()
        most_recent = logged_dates[0]

        # Check if streak is broken (gap > 1 day from today/most recent)
        if most_recent < today - timedelta(days=1):
            # Streak broken - no activity yesterday or today
            streak.activity_streak_count = 0
            streak.last_activity_date = most_recent
            return

        # Count consecutive days backwards from most_recent (or today if logged today)
        start_date = today if today in logged_dates else most_recent
        streak_count = 0
        check_date = start_date

        logged_date_set = set(logged_dates)

        while check_date in logged_date_set:
            streak_count += 1
            check_date -= timedelta(days=1)

        streak.activity_streak_count = streak_count
        streak.last_activity_date = most_recent

        # Update longest streak
        if streak_count > streak.longest_activity_streak:
            streak.longest_activity_streak = streak_count

    @staticmethod
    async def log_submission(
        user_id: int,
        node_id: int,
        submitted_at: datetime,
        deadline: Optional[datetime],
        db: AsyncSession,
    ) -> None:
        """
        Log a roadmap node submission and update on-time streak.

        Called when a node is marked as Submitted or Graded.
        """
        streak = await StreakService.get_or_create_streak(user_id, db)

        # Determine if submission was on time
        is_on_time = False
        if deadline:
            # Compare in UTC
            submitted_utc = submitted_at
            if submitted_utc.tzinfo is None:
                submitted_utc = submitted_utc.replace(tzinfo=timezone.utc)
            deadline_utc = deadline
            if deadline_utc.tzinfo is None:
                deadline_utc = deadline_utc.replace(tzinfo=timezone.utc)
            is_on_time = submitted_utc <= deadline_utc

        if is_on_time:
            await StreakService._recalculate_on_time_streak(streak, user_id, db)
        else:
            # Late submission breaks the on-time streak
            streak.on_time_streak_count = 0

        await db.flush()
        await db.refresh(streak)

    @staticmethod
    async def _recalculate_on_time_streak(
        streak: Streak, user_id: int, db: AsyncSession
    ) -> None:
        """
        Recalculate the on-time submission streak.

        On-time streak = consecutive submissions made on time, ordered by submission date.
        A single late submission breaks the streak.
        """
        # Get all submissions with their on-time status, ordered by submitted_at desc
        result = await db.execute(
            select(RoadmapNode, SelfAssessmentLog)
            .join(SelfAssessmentLog, SelfAssessmentLog.roadmap_node_id == RoadmapNode.id)
            .where(
                RoadmapNode.user_id == user_id,
                RoadmapNode.status.in_(["Submitted", "Graded"]),
                SelfAssessmentLog.user_id == user_id,
            )
            .order_by(RoadmapNode.submitted_at.desc().nullslast())
        )

        submissions = result.all()

        if not submissions:
            streak.on_time_streak_count = 0
            return

        # Check consecutive on-time submissions from most recent
        on_time_streak = 0
        for node, assessment in submissions:
            is_on_time = False
            if node.deadline and node.submitted_at:
                submitted_utc = node.submitted_at
                if submitted_utc.tzinfo is None:
                    submitted_utc = submitted_utc.replace(tzinfo=timezone.utc)
                deadline_utc = node.deadline
                if deadline_utc.tzinfo is None:
                    deadline_utc = deadline_utc.replace(tzinfo=timezone.utc)
                is_on_time = submitted_utc <= deadline_utc

            if is_on_time:
                on_time_streak += 1
            else:
                break  # Late submission breaks the streak

        streak.on_time_streak_count = on_time_streak

        if on_time_streak > streak.longest_on_time_streak:
            streak.longest_on_time_streak = on_time_streak

    @staticmethod
    async def get_streak_summary(user_id: int, db: AsyncSession) -> dict:
        """Get a summary of all streak metrics for the dashboard."""
        streak = await StreakService.get_or_create_streak(user_id, db)

        # Ensure activity streak is up to date
        await StreakService._recalculate_activity_streak(streak, user_id, db)
        await StreakService._recalculate_on_time_streak(streak, user_id, db)
        await db.flush()
        await db.refresh(streak)

        return {
            "activity_streak": streak.activity_streak_count,
            "on_time_streak": streak.on_time_streak_count,
            "longest_activity_streak": streak.longest_activity_streak,
            "longest_on_time_streak": streak.longest_on_time_streak,
            "last_activity_date": streak.last_activity_date.isoformat()
            if streak.last_activity_date
            else None,
        }

    @staticmethod
    async def get_heatmap_data(user_id: int, db: AsyncSession) -> List[dict]:
        """
        Get 12-week (84 day) heatmap data for the GitHub-style calendar.

        Returns list of {date: "YYYY-MM-DD", count: int, level: 0-4}
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=StreakService.HEATMAP_WEEKS * 7 - 1)

        result = await db.execute(
            select(StreakDailyLog.log_date, StreakDailyLog.action_count)
            .where(
                StreakDailyLog.user_id == user_id,
                StreakDailyLog.log_date >= start_date,
                StreakDailyLog.log_date <= end_date,
            )
            .order_by(StreakDailyLog.log_date)
        )

        logs = {row.log_date: row.action_count for row in result.fetchall()}

        heatmap = []
        current = start_date
        while current <= end_date:
            count = logs.get(current, 0)

            # Determine level (0-4) like GitHub
            if count == 0:
                level = 0
            elif count <= 2:
                level = 1
            elif count <= 5:
                level = 2
            elif count <= 10:
                level = 3
            else:
                level = 4

            heatmap.append(
                {
                    "date": current.isoformat(),
                    "count": count,
                    "level": level,
                }
            )
            current += timedelta(days=1)

        return heatmap

    @staticmethod
    async def get_upcoming_deadlines(
        user_id: int, days_ahead: int = 14, db: AsyncSession = None
    ) -> List[dict]:
        """
        Get upcoming roadmap node deadlines within the specified days.

        Returns list of nodes with deadline info, sorted by date.
        Includes overdue items (past deadline, not submitted/graded).
        """
        now = datetime.now(timezone.utc)
        future_cutoff = now + timedelta(days=days_ahead)

        result = await db.execute(
            select(RoadmapNode)
            .where(
                RoadmapNode.user_id == user_id,
                RoadmapNode.status.in_(["Pending", "In Progress"]),
                RoadmapNode.deadline.is_not(None),
            )
            .order_by(RoadmapNode.deadline.asc())
        )

        nodes = result.scalars().all()

        upcoming = []
        overdue = []

        for node in nodes:
            deadline_utc = node.deadline
            if deadline_utc.tzinfo is None:
                deadline_utc = deadline_utc.replace(tzinfo=timezone.utc)

            days_until = (deadline_utc - now).total_seconds() / 86400

            node_data = {
                "id": node.id,
                "title": node.title,
                "node_type": node.node_type,
                "deadline": node.deadline.isoformat() if node.deadline else None,
                "weight_percent": float(node.weight_percent) if node.weight_percent else None,
                "is_placeholder": node.is_placeholder,
                "is_confirmed": node.is_confirmed,
                "days_until": round(days_until, 1),
                "is_overdue": days_until < 0,
            }

            if days_until < 0:
                overdue.append(node_data)
            else:
                upcoming.append(node_data)

        # Sort: overdue first (most overdue first), then upcoming
        overdue.sort(key=lambda x: x["days_until"])
        upcoming.sort(key=lambda x: x["days_until"])

        return {"overdue": overdue, "upcoming": upcoming}

    @staticmethod
    async def get_topic_coverage(user_id: int, db: AsyncSession) -> List[dict]:
        """
        Get per-course topic completion stats for the dashboard glance.

        Returns list of {course_id, course_name, total, completed, progress_pct}
        """
        from app.models.course import Course
        from app.models.topic import Topic

        result = await db.execute(
            select(Course).where(Course.user_id == user_id, Course.is_archived == False)
        )
        courses = result.scalars().all()

        coverage = []
        for course in courses:
            # Count total topics for this course
            total_result = await db.execute(
                select(func.count(Topic.id)).where(
                    Topic.course_id == course.id,
                    Topic.user_id == user_id,
                )
            )
            total = total_result.scalar() or 0

            if total == 0:
                continue

            # Count completed topics
            completed_result = await db.execute(
                select(func.count(TopicCompletion.id)).where(
                    TopicCompletion.user_id == user_id,
                    TopicCompletion.is_completed == True,
                    TopicCompletion.topic_id.in_(
                        select(Topic.id).where(
                            Topic.course_id == course.id,
                            Topic.user_id == user_id,
                        )
                    ),
                )
            )
            completed = completed_result.scalar() or 0

            coverage.append(
                {
                    "course_id": course.id,
                    "course_name": course.name,
                    "course_code": course.code,
                    "total": total,
                    "completed": completed,
                    "progress_pct": round((completed / total * 100) if total > 0 else 0),
                }
            )

        return coverage

    @staticmethod
    async def get_weekly_workload(user_id: int, db: AsyncSession) -> dict:
        """
        Calculate estimated hours due this week (Monday-Sunday).

        Returns {this_week_hours, this_week_items, next_week_hours, next_week_items}
        """
        now = datetime.now(timezone.utc)
        # Start of this week (Monday)
        days_since_monday = now.weekday()
        week_start = now - timedelta(days=days_since_monday)
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)
        next_week_end = week_end + timedelta(days=7)

        result = await db.execute(
            select(RoadmapNode)
            .where(
                RoadmapNode.user_id == user_id,
                RoadmapNode.status.in_(["Pending", "In Progress"]),
                RoadmapNode.deadline.is_not(None),
                RoadmapNode.estimated_hours.is_not(None),
            )
            .order_by(RoadmapNode.deadline.asc())
        )
        nodes = result.scalars().all()

        this_week_hours = 0.0
        this_week_items = 0
        next_week_hours = 0.0
        next_week_items = 0

        for node in nodes:
            deadline_utc = node.deadline
            if deadline_utc.tzinfo is None:
                deadline_utc = deadline_utc.replace(tzinfo=timezone.utc)

            hours = float(node.estimated_hours or 0)

            if week_start <= deadline_utc < week_end:
                this_week_hours += hours
                this_week_items += 1
            elif week_end <= deadline_utc < next_week_end:
                next_week_hours += hours
                next_week_items += 1

        return {
            "this_week": {
                "hours": round(this_week_hours, 1),
                "items": this_week_items,
            },
            "next_week": {
                "hours": round(next_week_hours, 1),
                "items": next_week_items,
            },
        }

    @staticmethod
    async def check_and_notify_inactive(user_id: int, db: AsyncSession) -> bool:
        """
        Check if user has been inactive today (late in the day).
        Returns True if a nudge notification should be sent.

        This is a placeholder for the notification logic - actual
        email/push sending would be implemented separately.
        """
        from app.config import settings

        now = datetime.now(timezone.utc)
        today = now.date()

        # Only nudge after 6 PM local time (assuming UTC for now)
        # In production, use user's timezone
        if now.hour < 18:
            return False

        # Check if any activity logged today
        result = await db.execute(
            select(StreakDailyLog).where(
                StreakDailyLog.user_id == user_id,
                StreakDailyLog.log_date == today,
                StreakDailyLog.action_count > 0,
            )
        )
        today_log = result.scalar_one_or_none()

        if today_log:
            return False  # Already active today

        # Check if user has any pending items due soon
        deadlines = await StreakService.get_upcoming_deadlines(user_id, days_ahead=3, db=db)
        has_upcoming = len(deadlines["overdue"]) > 0 or len(deadlines["upcoming"]) > 0

        return has_upcoming