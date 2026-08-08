# ruff: noqa: E402, F401
import asyncio
import sys
from pathlib import Path
import random
from datetime import datetime, timedelta, timezone

# Add the project root to sys.path so we can import app modules
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import async_session
from app.models.user import User
from app.models.course import Course
from app.models.goal import Goal
from app.models.goal_course import GoalCourse
from app.models.gpa_entry import GpaEntry
from app.models.note import Note
from app.models.note_link import NoteLink
from app.models.roadmap_node import RoadmapNode
from app.models.self_assessment_log import SelfAssessmentLog
from app.models.streak import Streak
from app.models.streak_daily_log import StreakDailyLog
from app.models.topic import Topic
from app.models.topic_completion import TopicCompletion
from app.services.auth_service import hash_password

EMAIL = "marketing@tenaciti.com"
PASSWORD = "Password123!"

async def seed_data():
    async with async_session() as session:
        # 1. Create or get user
        result = await session.execute(select(User).where(User.email == EMAIL))
        user = result.scalars().first()
        
        if user:
            print(f"User {EMAIL} exists. Wiping their existing data...")
            # Delete associated records manually due to relationships, or cascade will handle if DB is setup right.
            # Easiest way is to delete the user entirely and recreate to rely on cascades.
            await session.delete(user)
            await session.commit()
            
        print("Creating Marketing User...")
        user = User(
            email=EMAIL,
            full_name="Marketing Demo",
            hashed_password=hash_password(PASSWORD),
            is_email_verified=True,
            plan="pro",
            created_at=datetime.now(timezone.utc) - timedelta(days=60)
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # 2. Add Streaks
        print("Creating Streaks...")
        streak = Streak(
            user_id=user.id,
            activity_streak_count=42,
            longest_activity_streak=42,
            last_activity_date=datetime.now(timezone.utc).date()
        )
        session.add(streak)
        await session.commit()
        await session.refresh(streak)
        
        # Backfill 42 days of activity
        today = datetime.now(timezone.utc).date()
        logs = []
        for i in range(42):
            date = today - timedelta(days=i)
            count = random.randint(1, 15)
            logs.append(StreakDailyLog(user_id=user.id, log_date=date, action_count=count))
        session.add_all(logs)
        
        # 3. Add Courses
        print("Creating Courses...")
        course1 = Course(user_id=user.id, name="Advanced Artificial Intelligence", code="CS401", semester="Fall", academic_year="2026", credit_hours=3.0, grade_letter="A")
        course2 = Course(user_id=user.id, name="Distributed Systems", code="CS402", semester="Fall", academic_year="2026", credit_hours=4.0, grade_letter="A-")
        course3 = Course(user_id=user.id, name="Quantum Computing", code="PHY501", semester="Fall", academic_year="2026", credit_hours=3.0, grade_letter="B+")
        session.add_all([course1, course2, course3])
        await session.commit()
        
        # 4. Add Topics & Completion
        print("Creating Topics...")
        topics = [
            Topic(course_id=course1.id, user_id=user.id, title="Neural Networks"),
            Topic(course_id=course1.id, user_id=user.id, title="Transformer Architectures"),
            Topic(course_id=course1.id, user_id=user.id, title="Reinforcement Learning"),
            Topic(course_id=course2.id, user_id=user.id, title="Consensus Algorithms"),
            Topic(course_id=course2.id, user_id=user.id, title="MapReduce"),
        ]
        session.add_all(topics)
        await session.commit()
        
        comps = [
            TopicCompletion(topic_id=topics[0].id, user_id=user.id, is_completed=True, confidence_rating=5),
            TopicCompletion(topic_id=topics[1].id, user_id=user.id, is_completed=True, confidence_rating=4),
            TopicCompletion(topic_id=topics[2].id, user_id=user.id, is_completed=False, confidence_rating=1),
            TopicCompletion(topic_id=topics[3].id, user_id=user.id, is_completed=True, confidence_rating=5),
            TopicCompletion(topic_id=topics[4].id, user_id=user.id, is_completed=False, confidence_rating=2),
        ]
        session.add_all(comps)
        
        # 5. Roadmap Nodes
        print("Creating Roadmap...")
        now = datetime.now(timezone.utc)
        nodes = [
            RoadmapNode(user_id=user.id, course_id=course1.id, title="Midterm Project: RL Agent", node_type="Project", deadline=now + timedelta(days=6)),
            RoadmapNode(user_id=user.id, course_id=course1.id, title="Read Attention Is All You Need", node_type="Assignment", deadline=now - timedelta(days=1), status="completed"),
            RoadmapNode(user_id=user.id, course_id=course2.id, title="Raft Implementation", node_type="Assignment", deadline=now - timedelta(days=2)), # overdue
            RoadmapNode(user_id=user.id, course_id=course3.id, title="Quantum Circuits Quiz", node_type="Quiz", deadline=now + timedelta(days=2)),
        ]
        session.add_all(nodes)
        await session.commit()
        
        # 6. Self Assessment
        print("Creating Self Assessments...")
        sas = [
            SelfAssessmentLog(roadmap_node_id=nodes[0].id, user_id=user.id, quality_self_rating=5, mood_energy=4, reflection_note="Went well", hours_before_deadline=12),
            SelfAssessmentLog(roadmap_node_id=nodes[1].id, user_id=user.id, quality_self_rating=3, mood_energy=3, reflection_note="Tough paper", hours_before_deadline=-2),
            SelfAssessmentLog(roadmap_node_id=nodes[2].id, user_id=user.id, quality_self_rating=4, mood_energy=2, reflection_note="Lots of debugging", hours_before_deadline=0),
            SelfAssessmentLog(roadmap_node_id=nodes[3].id, user_id=user.id, quality_self_rating=5, mood_energy=5, reflection_note="Easy stuff", hours_before_deadline=48),
        ]
        session.add_all(sas)
        
        # 7. Notes and Knowledge Web
        print("Creating Knowledge Web...")
        n1 = Note(user_id=user.id, course_id=course1.id, title="Self-Attention Mechanism", content="Details on self-attention.")
        n2 = Note(user_id=user.id, course_id=course1.id, title="Multi-Head Attention", content="How heads are concatenated.")
        n3 = Note(user_id=user.id, course_id=course1.id, title="Positional Encoding", content="Sine/cosine frequencies.")
        n4 = Note(user_id=user.id, course_id=course1.id, title="Transformers Overview", content="Encoder/Decoder stacks.")
        n5 = Note(user_id=user.id, course_id=course2.id, title="Paxos vs Raft", content="Consensus overview.")
        
        session.add_all([n1, n2, n3, n4, n5])
        await session.commit()
        
        links = [
            NoteLink(source_note_id=n4.id, target_note_id=n1.id),
            NoteLink(source_note_id=n4.id, target_note_id=n2.id),
            NoteLink(source_note_id=n4.id, target_note_id=n3.id),
            NoteLink(source_note_id=n1.id, target_note_id=n2.id),
        ]
        session.add_all(links)
        
        # 8. Goals
        print("Creating Goals...")
        goal1 = Goal(user_id=user.id, title="Achieve 3.9 GPA this semester", description="Focus on AI and Systems courses.", target_date=now + timedelta(days=90), status="Active")
        session.add(goal1)
        await session.commit()
        
        session.add_all([
            GoalCourse(goal_id=goal1.id, course_id=course1.id),
            GoalCourse(goal_id=goal1.id, course_id=course2.id),
        ])
        
        await session.commit()
        print(f"Successfully seeded marketing user: {EMAIL} with password: {PASSWORD}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())
