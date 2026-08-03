import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import LoadingScreen from '../components/LoadingScreen';

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

  if (loading) return <LoadingScreen message="Loading Goals..." />;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h1>🎯 Goals</h1>
          <p>Track your semester goals and GPA targets</p>
        </div>
        <button 
          style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          onClick={openCreateModal}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> New Goal
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--error-container)', border: '1px solid var(--error)', borderRadius: '12px', color: 'var(--on-error-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--on-error-container)', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
        </div>
      )}

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '24px', border: '1px dashed var(--outline-variant)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎯</span>
          <h3 style={{ fontSize: '24px', margin: '0 0 8px', color: 'var(--on-surface)' }}>No goals yet</h3>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '0 auto 24px' }}>
            Create your first goal to start tracking your semester progress. Set GPA targets or task-based goals.
          </p>
          <button 
            style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            onClick={openCreateModal}
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const isCompleted = goal.status === 'Complete' || (!goal.is_gpa_goal && goal.total_nodes > 0 && goal.completed_nodes === goal.total_nodes) || (goal.is_gpa_goal && goal.is_met);
            const cardClasses = `goal-card-glass ${isCompleted ? 'goal-card-completed' : ''} group`;
            const bgGradientClass = goal.is_gpa_goal ? 'linear-gradient(to bottom right, rgba(113, 42, 226, 0.05), transparent)' : 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), transparent)';

            return (
              <div key={goal.id} className={cardClasses}>
                <div className="goal-ambient-bg" style={{ background: bgGradientClass }}></div>
                <div className="goal-card-content">
                  <div>
                    {/* Header: Title and Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--on-surface)', textDecoration: isCompleted ? 'line-through' : 'none', textDecorationColor: 'var(--on-surface-variant)' }}>{goal.title}</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEditModal(goal)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span></button>
                        <button onClick={() => handleDelete(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span></button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {isCompleted ? (
                        <span style={{ padding: '4px 8px', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', borderRadius: '999px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete</span>
                      ) : (
                        <span style={{ padding: '4px 8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '999px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{goal.status || 'Active'}</span>
                      )}
                      
                      {goal.is_gpa_goal ? (
                        <span style={{ padding: '4px 8px', background: 'rgba(113, 42, 226, 0.1)', color: 'var(--secondary)', borderRadius: '999px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPA Goal</span>
                      ) : null}
                      
                      {goal.category && (
                        <span style={{ padding: '4px 8px', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)', borderRadius: '999px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{goal.category}</span>
                      )}
                    </div>

                    {/* Description */}
                    {goal.description && (
                      <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{goal.description}</p>
                    )}

                    {/* GPA Progress Section */}
                    {goal.is_gpa_goal && goal.current_gpa !== null && (
                      <div style={{ background: 'var(--surface-container)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Current vs Target</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{goal.current_gpa.toFixed(2)}</span>
                              <span style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>/ {goal.gpa_target?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ padding: '4px 8px', background: goal.is_met ? 'rgba(34, 197, 94, 0.1)' : 'var(--error-container)', color: goal.is_met ? 'var(--success)' : 'var(--on-error-container)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                              {goal.is_met ? 'Target Met' : 'Falling Short'}
                            </span>
                            {!goal.is_met && (
                              <span style={{ fontSize: '11px', color: 'var(--error)' }}>
                                {goal.gap > 0 ? `+${goal.gap.toFixed(2)}` : goal.gap?.toFixed(2)} to target
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((goal.current_gpa / goal.gpa_target) * 100, 100)}%`, background: goal.is_met ? 'var(--success)' : 'linear-gradient(to right, var(--error), var(--gradient-end))', borderRadius: '999px' }}></div>
                        </div>
                      </div>
                    )}

                    {/* Task Progress Section */}
                    {!goal.is_gpa_goal && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Progress</span>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>{goal.completed_nodes || 0}/{goal.total_nodes || 0} tasks</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${goal.total_nodes > 0 ? ((goal.completed_nodes || 0) / goal.total_nodes) * 100 : 0}%`, background: 'linear-gradient(to right, var(--gradient-end), var(--success))', borderRadius: '999px' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(196, 199, 199, 0.3)', color: 'var(--on-surface-variant)', fontSize: '12px', marginTop: '24px' }}>
                    {goal.semester && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span> {goal.semester}
                      </div>
                    )}
                    {goal.target_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span> {new Date(goal.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {(goal.course_ids && goal.course_ids.length > 0) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>school</span> {goal.course_ids.length} course{goal.course_ids.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={closeModal}>
          <div className="glass-modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: 600 }}>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="E.g., Dean's List Fall 2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Optional details..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Academic, Personal..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Semester</label>
                  <input type="text" name="semester" value={formData.semester} onChange={handleChange} placeholder="Fall 2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Target Date</label>
                <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none', color: 'var(--on-surface)' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'var(--surface-container-low)', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)' }}>
                <input type="checkbox" name="is_gpa_goal" checked={formData.is_gpa_goal} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>This is a GPA Goal</span>
              </label>

              {formData.is_gpa_goal && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>GPA Target (e.g. 3.8)</label>
                  <input type="number" step="0.01" min="0" max="4.0" name="gpa_target" value={formData.gpa_target} onChange={handleChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)', background: 'var(--surface)', fontSize: '16px', outline: 'none' }} />
                </div>
              )}

              {courses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Linked Courses (Optional)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: 'var(--surface-container-low)', borderRadius: '12px', border: '1px solid rgba(196, 199, 199, 0.5)' }}>
                    {courses.map(course => (
                      <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.course_ids.includes(course.id)} onChange={() => handleCourseToggle(course.id)} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={course.name}>{course.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', border: 'none', fontWeight: 500, cursor: 'pointer', color: 'var(--on-surface-variant)' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Saving...' : 'Save Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}