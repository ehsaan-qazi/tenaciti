import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import CourseCard from '../components/Courses/CourseCard';
import NewCourseModal, { getCurrentSemester, getCurrentYear } from '../components/Courses/NewCourseModal';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('active'); // active, all

  const currentSemester = getCurrentSemester();
  const currentYear = getCurrentYear();

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiFetch('/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const semesterCourses = courses.filter(
    (c) => c.semester === currentSemester && String(c.academic_year) === currentYear
  );
  
  const displayedCourses = filter === 'all' ? courses : semesterCourses;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Courses
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: 'var(--on-surface-variant)' }}>
            Manage and access all your enrolled courses.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Add Course
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--surface-container-high)', paddingBottom: '16px' }}>
        <button
          onClick={() => setFilter('active')}
          style={{ padding: '8px 16px', borderRadius: '8px', background: filter === 'active' ? 'var(--surface-container-high)' : 'transparent', color: filter === 'active' ? 'var(--on-surface)' : 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: filter === 'active' ? '600' : '500', transition: 'all 0.2s' }}
        >
          {currentSemester} {currentYear} ({semesterCourses.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{ padding: '8px 16px', borderRadius: '8px', background: filter === 'all' ? 'var(--surface-container-high)' : 'transparent', color: filter === 'all' ? 'var(--on-surface)' : 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: filter === 'all' ? '600' : '500', transition: 'all 0.2s' }}
        >
          All Courses ({courses.length})
        </button>
      </div>

      {/* Courses Grid */}
      {loadingCourses ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: '240px', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {displayedCourses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', background: 'var(--surface-container-lowest)', borderRadius: '24px', border: '2px dashed var(--outline-variant)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--on-surface-variant)' }}>auto_stories</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>No courses found</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--on-surface-variant)' }}>You haven't added any courses for this view yet.</p>
              <button
                onClick={() => setShowModal(true)}
                style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Add New Course
              </button>
            </div>
          ) : (
            displayedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* New Course Modal */}
      {showModal && (
        <NewCourseModal
          onClose={() => setShowModal(false)}
          onCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}
