import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import {
  UpcomingDeadlines as UpcomingDeadlinesWidget,
  TopicCoverage as TopicCoverageWidget,
  WeeklyWorkload as WeeklyWorkloadWidget,
  StreakSummaryCards,
  StreakHeatmap,
} from '../components/Dashboard/DashboardWidgets';
import { logActivity, getWeeklyWorkload } from '../api/streakApi';
import CourseCard from '../components/Courses/CourseCard';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Helpers imported from NewCourseModal
import NewCourseModal, { getCurrentSemester, getCurrentYear } from '../components/Courses/NewCourseModal';

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const currentSemester = getCurrentSemester();
  const currentYear = getCurrentYear();

  // Log activity when dashboard loads
  useEffect(() => {
    logActivity(1).catch(console.error);
  }, []);

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

  const semesterCourses = courses.filter(
    (c) => c.semester === currentSemester && String(c.academic_year) === currentYear
  );
  const displayedCourses = showAll ? courses : semesterCourses;
  const hasOtherCourses = courses.length > semesterCourses.length;

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Abstract Decor Blobs */}
      <div className="blob-1"></div>
      <div className="blob-2"></div>

      {/* Page Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px solid var(--surface-container-lowest)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--surface-container-lowest)' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, padding: 0, fontSize: '32px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {getGreeting()}, {firstName} <span style={{ display: 'inline-block', transformOrigin: '70% 70%' }}>👋</span>
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'JetBrains Mono', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>
                {currentSemester} {currentYear}
              </span>
              <span>·</span>
              <span>
                {semesterCourses.length} active course{semesterCourses.length !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
        </div>
        <button className="glass-btn-primary" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined">add</span>
          New Course
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>auto_stories</span>
            </div>
            <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono', background: 'var(--surface-container)', padding: '4px 8px', borderRadius: '6px', color: 'var(--on-surface-variant)' }}>Semester</span>
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--on-surface-variant)' }}>Active Courses</h2>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{semesterCourses.length}</div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary-container)', fontSize: '20px' }}>file_copy</span>
            </div>
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--on-surface-variant)' }}>Documents Uploaded</h2>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{semesterCourses.reduce((sum, c) => sum + (c.doc_upload_count || 0), 0)}</div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>task_alt</span>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', background: 'var(--surface-container)', padding: '4px 8px', borderRadius: '6px', color: 'var(--on-surface-variant)' }}>Progress</span>
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--on-surface-variant)' }}>Topics Completed</h2>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>—</div>
          </div>
        </div>
        <div className="glass-card" style={{ background: 'var(--secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--on-primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(ellipse at top right, white, transparent)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)', fontSize: '20px' }}>workspace_premium</span>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', color: 'var(--on-primary)' }}>Subscription</span>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Your Plan</h2>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--on-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{user?.plan === 'pro' ? 'Pro' : 'Free'}</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <UpcomingDeadlinesWidget />
          <TopicCoverageWidget />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <StreakSummaryCards />
          <WeeklyWorkloadWidget />
        </div>
      </div>

      {/* Full-width Streak Heatmap */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: '24px' }}>
        <StreakHeatmap />
      </div>

      {/* Courses Section */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--surface-container-high)', paddingBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            📚 {showAll ? 'All' : `${currentSemester} ${currentYear}`} Courses
            <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed-variant)', padding: '4px 8px', borderRadius: '6px' }}>
              {displayedCourses.length} Active
            </span>
          </h2>
          {hasOtherCourses && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>Show all</span>
              <button 
                style={{ width: '48px', height: '24px', borderRadius: '9999px', background: showAll ? 'var(--primary)' : 'var(--surface-container-highest)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setShowAll((v) => !v)}
              >
                <span style={{ position: 'absolute', top: '4px', left: showAll ? '28px' : '4px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: 'all 0.2s' }}></span>
              </button>
            </div>
          )}
        </div>

        {loadingCourses ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ height: '240px', animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {displayedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
            {/* Add course tile */}
            <div
              onClick={() => setShowModal(true)}
              style={{ borderRadius: '24px', padding: '16px', border: '2px dashed var(--outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', minHeight: '200px', transition: 'all 0.3s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--outline-variant)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--on-surface-variant)' }}>add</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--primary)' }}>Add New Course</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)' }}>Import syllabus to generate plan.</p>
            </div>
          </div>
        )}
      </div>

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