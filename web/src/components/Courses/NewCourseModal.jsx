import React, { useState } from 'react';
import { apiFetch } from '../../api/client';

export function getCurrentSemester() {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 7) return 'Summer';
  return 'Fall';
}

export function getCurrentYear() {
  return String(new Date().getFullYear());
}

export default function NewCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    semester: getCurrentSemester(),
    academic_year: getCurrentYear(),
    credit_hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Course name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        semester: form.semester,
        academic_year: form.academic_year,
        credit_hours: form.credit_hours ? parseFloat(form.credit_hours) : null,
      };
      const created = await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📖 New Course</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Software Engineering"
              autoFocus
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Course Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SE301"
              />
            </div>
            <div className="form-group">
              <label>Credit Hours</label>
              <input
                name="credit_hours"
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={form.credit_hours}
                onChange={handleChange}
                placeholder="e.g. 3"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange}>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
              </select>
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input
                name="academic_year"
                value={form.academic_year}
                onChange={handleChange}
                placeholder="e.g. 2026"
              />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
