"""
Unit and API integration tests for Phase 7 Profile & Retrospective endpoints.
"""

import pytest
import pytest_asyncio
import uuid
from datetime import datetime, timezone, timedelta

from app.models.user import User
from app.models.course import Course
from app.models.roadmap_node import RoadmapNode
from app.models.topic import Topic
from app.models.topic_completion import TopicCompletion
from app.models.note import Note
from app.models.note_link import NoteLink
from app.models.self_assessment_log import SelfAssessmentLog
from app.services.auth_service import create_local_access_token, hash_password


@pytest_asyncio.fixture
async def setup_test_user_and_data(db_session):
    """Create a verified test user with courses, nodes, topics, self-assessments, notes, and links."""
    unique_email = f"profile_test_{uuid.uuid4().hex[:8]}@example.com"
    user = User(
        email=unique_email,
        hashed_password=hash_password("Password123!"),
        full_name="Profile Test User",
        is_email_verified=True,
        plan="free",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 1. Courses
    course_cs = Course(
        user_id=user.id,
        name="Computer Science 101",
        code="CS101",
        semester="Fall",
        academic_year="2026",
        credit_hours=4.0,
    )
    course_math = Course(
        user_id=user.id,
        name="Linear Algebra",
        code="MATH201",
        semester="Fall",
        academic_year="2026",
        credit_hours=3.0,
    )
    db_session.add_all([course_cs, course_math])
    await db_session.commit()
    await db_session.refresh(course_cs)
    await db_session.refresh(course_math)

    # 2. Roadmap Nodes
    now = datetime.now(timezone.utc)
    node1 = RoadmapNode(
        course_id=course_cs.id,
        user_id=user.id,
        title="Midterm Exam",
        node_type="Exam",
        deadline=now + timedelta(days=2),
        estimated_hours=10.0,
        actual_hours=12.0,
        confidence_at_creation=4,
        extraction_confidence=0.95,
        status="Submitted",
        grade=88.5,
        submitted_at=now - timedelta(hours=18),
    )
    node2 = RoadmapNode(
        course_id=course_math.id,
        user_id=user.id,
        title="Assignment 1",
        node_type="Assignment",
        deadline=now + timedelta(days=5),
        estimated_hours=4.0,
        actual_hours=3.5,
        confidence_at_creation=3,
        extraction_confidence=0.88,
        status="Graded",
        grade=92.0,
        submitted_at=now - timedelta(hours=36),
    )
    node3 = RoadmapNode(
        course_id=course_cs.id,
        user_id=user.id,
        title="Final Project",
        node_type="Project",
        deadline=now + timedelta(days=14),
        estimated_hours=20.0,
        confidence_at_creation=5,
        extraction_confidence=0.90,
        status="Pending",
    )
    db_session.add_all([node1, node2, node3])
    await db_session.commit()
    await db_session.refresh(node1)
    await db_session.refresh(node2)
    await db_session.refresh(node3)

    # 3. Self Assessments
    sal1 = SelfAssessmentLog(
        roadmap_node_id=node1.id,
        user_id=user.id,
        quality_self_rating=4,
        hours_before_deadline=18.0,
    )
    sal2 = SelfAssessmentLog(
        roadmap_node_id=node2.id,
        user_id=user.id,
        quality_self_rating=5,
        hours_before_deadline=36.0,
    )
    db_session.add_all([sal1, sal2])
    await db_session.commit()

    # 4. Topics & Completions
    topic1 = Topic(
        course_id=course_cs.id,
        user_id=user.id,
        linked_node_id=node1.id,
        title="Data Structures",
        is_confirmed=True,
    )
    topic2 = Topic(
        course_id=course_math.id,
        user_id=user.id,
        linked_node_id=node2.id,
        title="Matrix Multiplication",
        is_confirmed=True,
    )
    db_session.add_all([topic1, topic2])
    await db_session.commit()
    await db_session.refresh(topic1)
    await db_session.refresh(topic2)

    tc1 = TopicCompletion(
        topic_id=topic1.id,
        user_id=user.id,
        is_completed=True,
        confidence_rating=4,
        completed_at=now - timedelta(days=1),
    )
    tc2 = TopicCompletion(
        topic_id=topic2.id,
        user_id=user.id,
        is_completed=True,
        confidence_rating=5,
        completed_at=now - timedelta(days=2),
    )
    db_session.add_all([tc1, tc2])
    await db_session.commit()

    # 5. Notes & Note Links
    note1 = Note(
        user_id=user.id,
        course_id=course_cs.id,
        topic_id=topic1.id,
        roadmap_node_id=node1.id,
        title="Arrays and Trees",
        content="Overview of binary trees.",
    )
    note2 = Note(
        user_id=user.id,
        course_id=course_math.id,
        topic_id=topic2.id,
        roadmap_node_id=node2.id,
        title="Eigenvalues Notes",
        content="Calculations of eigenvalues.",
    )
    db_session.add_all([note1, note2])
    await db_session.commit()
    await db_session.refresh(note1)
    await db_session.refresh(note2)

    nl1 = NoteLink(
        source_note_id=note1.id,
        target_note_id=note2.id,
    )
    db_session.add(nl1)
    await db_session.commit()

    token = create_local_access_token(user_id=user.id, token_version=user.token_version, email=user.email)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


@pytest.mark.asyncio
async def test_get_profile_summary(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["total_nodes"] == 3
    assert data["completed_nodes"] == 2
    assert data["pending_nodes"] == 1
    assert data["completion_rate"] == 66.7
    assert data["avg_estimated_hours"] == 11.3
    assert data["avg_actual_hours"] == 7.8
    assert data["total_courses"] == 2
    assert data["total_topics"] == 2
    assert data["completed_topics"] == 2
    assert data["topic_completion_rate"] == 100.0
    assert data["total_notes"] == 2
    assert data["total_note_links"] == 1


@pytest.mark.asyncio
async def test_get_planning_accuracy(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/planning-accuracy", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "courses" in data
    assert len(data["courses"]) == 2
    assert data["overall_avg_estimated"] is not None
    assert data["overall_avg_actual"] is not None
    assert data["overall_accuracy_score"] is not None


@pytest.mark.asyncio
async def test_get_confidence_trends(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/confidence-trends?days=30", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "courses" in data
    assert "overall_trend" in data
    assert len(data["overall_trend"]) >= 1


@pytest.mark.asyncio
async def test_get_topic_coverage_trends(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/topic-coverage-trends?days=30", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "courses" in data
    assert "overall_trend" in data
    assert len(data["overall_trend"]) >= 1


@pytest.mark.asyncio
async def test_get_note_density_correlation(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/note-density-correlation", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "data_points" in data
    assert len(data["data_points"]) == 2
    assert "summary" in data
    assert isinstance(data["summary"], str)


@pytest.mark.asyncio
async def test_get_procrastination_fingerprint(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data
    response = await async_client.get("/api/v1/profile/procrastination-fingerprint", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "buckets" in data
    assert len(data["buckets"]) == 5
    assert data["total_submissions_analyzed"] == 2
    assert data["on_time_rate"] == 100.0
    assert "interpretation" in data


@pytest.mark.asyncio
async def test_get_retrospective_report(async_client, setup_test_user_and_data):
    user, headers = setup_test_user_and_data

    # Test GET route with include_all_time=True
    response = await async_client.get("/api/v1/profile/retrospective?include_all_time=true", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "All Time"
    assert "semester_summaries" in data
    assert len(data["semester_summaries"]) >= 1
    assert "course_details" in data
    assert len(data["course_details"]) == 2
    assert "insights" in data
    assert "recommendations" in data

    # Test POST route
    payload = {"semester": "Fall", "academic_year": "2026", "include_all_time": False}
    post_res = await async_client.post("/api/v1/profile/retrospective", json=payload, headers=headers)
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["period"] == "Fall 2026"
