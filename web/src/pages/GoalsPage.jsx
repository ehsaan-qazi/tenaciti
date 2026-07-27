import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    semester: '',
    target_date: '',
    is_gpa_goal: false,
    gpa_target: '',
    course_ids: [],
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentSemester = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 7) return 'Summer';
    return 'Fall';
  };

  useEffect(() => {
    fetchGoals();
    fetchCourses();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await apiFetch('/goals');
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiFetch('/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category.trim() || null,
      semester: formData.semester || currentSemester(),
      target_date: formData.target_date || null,
      is_gpa_goal: formData.is_gpa_goal,
      gpa_target: formData.is_gpa_goal && formData.gpa_target ? parseFloat(formData.gpa_target) : null,
      course_ids: formData.course_ids.map(Number),
    };

    try {
      if (editingGoal) {
        await apiFetch(`/goals/${editingGoal.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/goals', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      fetchGoals();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await apiFetch(`/goals/${goalId}`, { method: 'DELETE' });
      fetchGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      semester: currentSemester(),
      target_date: '',
      is_gpa_goal: false,
      gpa_target: '',
      course_ids: [],
    });
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || '',
      semester: goal.semester || currentSemester(),
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      is_gpa_goal: goal.is_gpa_goal || false,
      gpa_target: goal.gpa_target ? String(goal.gpa_target) : '',
      course_ids: goal.course_ids || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'course_ids') {
      // handled separately
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter(id => id !== courseId)
        : [...prev.course_ids, courseId],
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: { bg: 'var(--green-dim)', color: 'var(--green)', text: 'Active' },
      Complete: { bg: 'var(--blue-dim)', color: 'var(--blue)', text: 'Complete' },
      Abandoned: { bg: 'var(--red-dim)', color: 'var(--red)', text: 'Abandoned' },
    };
    const s = styles[status] || styles.Active;
    return <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>{s.text}</span>;
  };

  const getProgressBar = (goal) => {
    if (!goal.is_gpa_goal) {
      const total = goal.total_nodes || 0;
      const completed = goal.completed_nodes || 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '0.25rem' }}>
            <span>Progress: {completed}/{total} tasks</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--green), var(--blue))', transition: 'width 0.3s' }} />
          </div>
        </div>
      );
    }
    return null;
  };

  const getGpaStatus = (goal) => {
    if (!goal.is_gpa_goal || goal.current_gpa === null) return null;
    const gap = goal.gap;
    const isMet = goal.is_met;
    return (
      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current GPA</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: isMet ? 'var(--green)' : 'var(--amber)' }}>{goal.current_gpa.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Target: {goal.gpa_target?.toFixed(2)}</span>
          <span style={{ color: isMet ? 'var(--green)' : 'var(--amber)', fontWeight: 600 }}>
            {isMet ? '✓ Target Met' : `${gap > 0 ? '+' : ''}${gap?.toFixed(2)} to target`}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">🎯 Goals</h1>
          <p className="page-subtitle">Track your semester goals and GPA targets</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + New Goal
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--red)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No goals yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Create your first goal to start tracking your semester progress. Set GPA targets or task-based goals.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {goals.map(goal => (
            <div key={goal.id} className="goal-card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{goal.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {getStatusBadge(goal.status)}
                    {goal.is_gpa_goal && <span style={{ background: 'var(--purple-dim)', color: 'var(--purple)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '10px', fontWeight: 600 }}>GPA Goal</span>}
                    {goal.category && <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '10px' }}>{goal.category}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(goal)} style={{ padding: '0.35rem 0.6rem' }}>✏️</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(goal.id)} style={{ padding: '0.35rem 0.6rem', color: 'var(--red)' }}>🗑️</button>
                </div>
              </div>

              {goal.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '0.75rem' }}>{goal.description}</p>
              )}

              <div style={{ display: 'flex', gap: '1rem', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span>📅 {goal.semester || 'All semesters'}</span>
                {goal.target_date && <span>🎯 Due: {new Date(goal.target_date).toLocaleDateString()}</span>}
                {goal.linked_courses_count > 0 && <span>📚 {goal.linked_courses_count} course{goal.linked_courses_count > 1 ? 's' : ''}</span>}
              </div>

              {getProgressBar(goal)}
              {getGpaStatus(goal)}

              {goal.linked_courses_count > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {goal.completed_nodes}/{goal.total_nodes} tasks completed
                    {goal.is_gpa_goal && goal.current_gpa !== null && (
                      <> · GPA: {goal.current_gpa.toFixed(2)} / {goal.gpa_target?.toFixed(2)} target</>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay open" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingGoal ? 'Edit Goal' : 'Create Goal'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Maintain 3.5 GPA" required autoFocus />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Optional details about this goal..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Academic, Personal, Career" />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleChange}>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Date</label>
                  <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} />
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" name="is_gpa_goal" checked={formData.is_gpa_goal} onChange={handleChange} />
                  <span>🎓 GPA Target Goal</span>
                </label>
                {formData.is_gpa_goal && (
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label>Target GPA (4.0 scale)</label>
                    <input type="number" step="0.01" min="0" max="4.0" name="gpa_target" value={formData.gpa_target} onChange={handleChange} placeholder="e.g., 3.5" />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '0.5rem' }}>Link Courses (Optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflow: 'auto' }}>
                  {courses.map(course => (
                    <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: formData.course_ids.includes(course.id) ? 'var(--green-dim)' : 'var(--bg-tertiary)', border: formData.course_ids.includes(course.id) ? '1px solid var(--green)' : '1px solid var(--border)', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                      <input type="checkbox" checked={formData.course_ids.includes(course.id)} onChange={() => handleCourseToggle(course.id)} style={{ width: '14px', height: '14px', accentColor: 'var(--green)' }} />
                      <span style={{ color: formData.course_ids.includes(course.id) ? 'var(--green)' : 'var(--text-primary)' }}>
                        {course.code} {course.name}
                      </span>
                    </label>
                  ))}
                  {courses.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No courses yet — create one first</span>}
                </div>
              </div>

              {error && <div className="error-message" style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '0.5rem' }}>{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingGoal ? 'Save Changes' : 'Create Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}