import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const GRADE_SCALE_OPTIONS = [
  { value: '4.0', label: '4.0 Scale (US Standard)' },
  { value: '5.0', label: '5.0 Scale (Weighted/AP)' },
  { value: '10', label: '10-Point Scale (India/Europe)' },
];

const LETTER_GRADES_4 = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
const LETTER_GRADES_5 = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
const LETTER_GRADES_10 = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

const GRADE_POINTS = {
  '4.0': { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 },
  '5.0': { 'A+': 5.0, 'A': 5.0, 'A-': 4.5, 'B+': 4.0, 'B': 3.5, 'B-': 3.0, 'C+': 2.5, 'C': 2.0, 'C-': 1.5, 'D+': 1.0, 'D': 0.5, 'D-': 0.0, 'F': 0.0 },
  '10': { 'A+': 10.0, 'A': 10.0, 'A-': 9.0, 'B+': 8.5, 'B': 8.0, 'B-': 7.5, 'C+': 7.0, 'C': 6.5, 'C-': 6.0, 'D+': 5.5, 'D': 5.0, 'D-': 4.5, 'F': 0.0 },
};

function GradeRow({ entry, index, scale, onChange, onDelete, courses, isEditing }) {
  const points = GRADE_POINTS[scale]?.[entry.grade_letter] ?? 0;
  const qualityPoints = entry.credit_hours * points;

  const letterOptions = scale === '4.0' ? LETTER_GRADES_4 : scale === '5.0' ? LETTER_GRADES_5 : LETTER_GRADES_10;

  return (
    <tr style={{ background: entry.is_manual ? 'var(--bg-tertiary)' : 'transparent' }}>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {isEditing ? (
          <select
            value={entry.course_id || ''}
            onChange={(e) => onChange(index, { course_id: parseInt(e.target.value) || null, course_label: courses.find(c => c.id === parseInt(e.target.value))?.name || entry.course_label })}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', width: '100%' }}
          >
            <option value="">Manual Entry</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} {c.name}</option>)}
          </select>
        ) : (
          <span style={{ fontSize: '13px', color: entry.course_id ? 'var(--text-primary)' : 'var(--amber)' }}>
            {entry.course_id ? '🔗' : '✏️'} {entry.course_label}
          </span>
        )}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {isEditing ? (
          <input
            type="number"
            step="0.5"
            min="0"
            max="10"
            value={entry.credit_hours}
            onChange={(e) => onChange(index, { credit_hours: parseFloat(e.target.value) || 0 })}
            style={{ width: '70px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', textAlign: 'center' }}
          />
        ) : (
          <span>{entry.credit_hours}</span>
        )}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {isEditing ? (
          <>
            <select
              value={entry.grade_letter || ''}
              onChange={(e) => {
                const letter = e.target.value;
                const percentage = letter ? (GRADE_POINTS[scale][letter] / Math.max(...Object.values(GRADE_POINTS[scale]))) * 100 : '';
                onChange(index, { grade_letter: letter || null, percentage });
              }}
              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', marginRight: '0.5rem' }}
            >
              <option value="">Select</option>
              {letterOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={entry.percentage || ''}
              onChange={(e) => {
                const pct = parseFloat(e.target.value);
                let letter = '';
                if (!isNaN(pct)) {
                  const maxPoints = Math.max(...Object.values(GRADE_POINTS[scale]));
                  const targetPoints = (pct / 100) * maxPoints;
                  letter = Object.entries(GRADE_POINTS[scale]).find(([_, v]) => v >= targetPoints)?.[0] || 'F';
                }
                onChange(index, { percentage: isNaN(pct) ? null : pct, grade_letter: letter || null });
              }}
              style={{ width: '70px', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', textAlign: 'center' }}
              placeholder="%"
            />
          </>
        ) : (
          <span style={{ fontWeight: 600, color: entry.grade_letter ? 'var(--green)' : 'var(--text-muted)' }}>
            {entry.grade_letter || (entry.percentage !== null && entry.percentage !== undefined ? `${entry.percentage}%` : '—')}
          </span>
        )}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: entry.grade_letter ? 'var(--green)' : 'var(--text-muted)' }}>
        {entry.grade_letter ? `${points.toFixed(2)}` : '—'}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--blue)' }}>
        {entry.grade_letter ? qualityPoints.toFixed(2) : '—'}
      </td>
      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
        {isEditing && (
          <button onClick={() => onDelete(index)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
        )}
      </td>
    </tr>
  );
}

function SemesterSummary({ semester, entries, scale, isActive }) {
  const courseEntries = entries.filter(e => e.entry_type === 'course');
  const totalCredits = courseEntries.reduce((sum, e) => sum + e.credit_hours, 0);
  const totalQP = courseEntries.reduce((sum, e) => {
    const pts = GRADE_POINTS[scale]?.[e.grade_letter] ?? 0;
    return sum + e.credit_hours * pts;
  }, 0);
  const gpa = totalCredits > 0 ? totalQP / totalCredits : 0;

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderLeft: isActive ? '4px solid var(--green)' : '4px solid transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{semester.semester} {semester.academic_year || ''}</h3>
        <span className={`badge ${isActive ? 'badge-active' : ''}`} style={{ fontSize: '12px' }}>
          {isActive ? 'Current' : 'Completed'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', fontSize: '14px' }}>
        <div><span style={{ color: 'var(--text-muted)' }}>Credits</span><br /><strong>{totalCredits}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Quality Pts</span><br /><strong>{totalQP.toFixed(2)}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>GPA</span><br /><strong style={{ fontSize: '1.5rem', color: 'var(--green)' }}>{gpa.toFixed(2)}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Courses</span><br /><strong>{courseEntries.length}</strong></div>
      </div>
    </div>
  );
}

function WhatIfCalculator({ currentCGPA, currentCredits, remainingCredits, scale, onClose }) {
  const [targetCGPA, setTargetCGPA] = useState('');
  const [targetSemGPA, setTargetSemGPA] = useState('');
  const results = [];

  const maxPoints = Math.max(...Object.values(GRADE_POINTS[scale]));

  if (targetCGPA) {
    const needed = (parseFloat(targetCGPA) * (currentCredits + remainingCredits) - currentCGPA * currentCredits) / remainingCredits;
    results.push({
      name: `Target CGPA: ${targetCGPA}`,
      needed: needed.toFixed(2),
      achievable: needed <= maxPoints,
      letter: Object.entries(GRADE_POINTS[scale]).find(([_, v]) => v >= needed)?.[0] || 'A+',
    });
  }
  if (targetSemGPA) {
    const projCGPA = (currentCGPA * currentCredits + parseFloat(targetSemGPA) * remainingCredits) / (currentCredits + remainingCredits);
    results.push({
      name: `If Semester GPA = ${targetSemGPA}`,
      projected: projCGPA.toFixed(2),
      needed: targetSemGPA,
      achievable: parseFloat(targetSemGPA) <= maxPoints,
    });
  }

  // Straight A scenario
  const straightA = (currentCGPA * currentCredits + maxPoints * remainingCredits) / (currentCredits + remainingCredits);
  results.push({ name: 'Straight A\'s', projected: straightA.toFixed(2), needed: maxPoints, achievable: true });

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>🔮 What-If Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Target CGPA</label>
          <input type="number" step="0.01" min="0" max={maxPoints} value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} placeholder={maxPoints} />
        </div>
        <div className="form-group">
          <label>Target Semester GPA</label>
          <input type="number" step="0.01" min="0" max={maxPoints} value={targetSemGPA} onChange={e => setTargetSemGPA(e.target.value)} placeholder={maxPoints} />
        </div>
      </div>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {results.map((r, i) => (
          <div key={i} className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: r.achievable === false ? 'var(--red-dim)' : 'var(--bg-tertiary)' }}>
            <span>{r.name}</span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {r.needed && <span style={{ fontSize: '13px' }}>Need: <strong>{r.needed}</strong> ({r.letter})</span>}
              {r.projected && <span style={{ color: 'var(--green)' }}>Projected CGPA: <strong>{r.projected}</strong></span>}
              {!r.achievable && <span className="badge" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>Not Achievable</span>}
            </div>
          </div>
        ))}
      </div>
      <button className="secondary-btn" style={{ width: 'auto', marginTop: '1rem' }} onClick={onClose}>Close</button>
    </div>
  );
}

export default function GPAPage() {
  const [entries, setEntries] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [cumulative, setCumulative] = useState(null);
  const [goals, setGoals] = useState([]);
  const [scale, setScale] = useState('4.0');
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    semester: '',
    academic_year: '',
    entry_type: 'course',
    course_id: null,
    course_label: '',
    credit_hours: 3,
    grade_letter: null,
    percentage: null,
    grade_scale: '4.0',
  });

  useEffect(() => {
    loadData();
  }, [scale]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, cumulativeRes, goalsRes, coursesRes] = await Promise.all([
        apiFetch(`/gpa/entries?grade_scale=${scale}`),
        apiFetch(`/gpa/cumulative?grade_scale=${scale}`),
        apiFetch('/gpa/goals'),
        apiFetch('/courses'),
      ]);
      setEntries(entriesRes);
      setCumulative(cumulativeRes);
      setGoals(goalsRes);
      setCourses(coursesRes.filter(c => !c.is_archived));
      buildSemesters(entriesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buildSemesters = (entries) => {
    const grouped = {};
    entries.forEach(e => {
      const key = `${e.semester} ${e.academic_year || ''}`.trim();
      if (!grouped[key]) grouped[key] = { semester: e.semester, academic_year: e.academic_year, entries: [] };
      grouped[key].entries.push(e);
    });
    setSemesters(Object.values(grouped).sort((a, b) => {
      const order = { Spring: 1, Summer: 2, Fall: 3 };
      const ayA = a.academic_year || '0';
      const ayB = b.academic_year || '0';
      if (ayA !== ayB) return ayB.localeCompare(ayA);
      return (order[b.semester] || 0) - (order[a.semester] || 0);
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/gpa/entries', {
        method: 'POST',
        body: JSON.stringify({ ...formData, grade_scale: scale }),
      });
      setShowAddModal(false);
      setFormData({ semester: '', academic_year: '', entry_type: 'course', course_id: null, course_label: '', credit_hours: 3, grade_letter: null, percentage: null, grade_scale: scale });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const entry = entries[editingIndex];
      await apiFetch(`/gpa/entries/${entry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...entry, ...formData, grade_scale: scale }),
      });
      setShowEditModal(false);
      setEditingIndex(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await apiFetch(`/gpa/entries/${entries[index].id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setFormData({ semester: '', academic_year: '', entry_type: 'course', course_id: null, course_label: '', credit_hours: 3, grade_letter: null, percentage: null, grade_scale: scale });
    setShowAddModal(true);
  };

  const openEditModal = (index) => {
    const entry = entries[index];
    setFormData({
      semester: entry.semester,
      academic_year: entry.academic_year || '',
      entry_type: entry.entry_type,
      course_id: entry.course_id,
      course_label: entry.course_label,
      credit_hours: entry.credit_hours,
      grade_letter: entry.grade_letter,
      percentage: entry.percentage,
      grade_scale: entry.grade_scale,
    });
    setEditingIndex(index);
    setShowEditModal(true);
  };

  const currentSemesterEntries = semesters[0]?.entries || [];
  const remainingCredits = currentSemesterEntries
    .filter(e => e.entry_type === 'course' && !e.grade_letter)
    .reduce((sum, e) => sum + e.credit_hours, 0);

  if (loading) return <div className="page active"><div className="loading-screen"><div className="loading-spinner" />Loading GPA Calculator...</div></div>;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 GPA Calculator</h1>
          <p className="page-subtitle">Track semester GPA, cumulative CGPA, run what-if scenarios, and monitor GPA goals</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Entry</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="form-group" style={{ minWidth: '200px' }}>
          <label>Grade Scale</label>
          <select value={scale} onChange={e => setScale(e.target.value)} style={{ width: '100%' }}>
            {GRADE_SCALE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {cumulative && (
          <div className="stat-card" style={{ flex: 1, minWidth: '200px' }}>
            <div className="stat-card-top">
              <span className="stat-card-label">Cumulative CGPA</span>
              <span className="stat-card-icon">📊</span>
            </div>
            <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--green)' }}>{cumulative.cumulative_gpa.toFixed(2)}</div>
            <div className="stat-card-sub">{cumulative.total_credits} credits · {cumulative.semesters.length} semesters</div>
          </div>
        )}
        {goals.length > 0 && (
          <div className="stat-card" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid var(--amber)' }}>
            <div className="stat-card-top">
              <span className="stat-card-label">GPA Goals</span>
              <span className="stat-card-icon">🎯</span>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
              {goals.filter(g => g.is_met).length} / {goals.length} Met
            </div>
            <div className="stat-card-sub">
              {goals.map(g => <div key={g.goal_id} style={{ fontSize: '12px', color: g.is_met ? 'var(--green)' : 'var(--amber)' }}>🎯 {g.title}: {g.current_gpa?.toFixed(2) || '—'} / {g.target_gpa}</div>)}
            </div>
          </div>
        )}
        <button className="btn btn-secondary" onClick={() => setShowWhatIf(true)} style={{ height: 'fit-content' }}>🔮 What-If Calculator</button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <div>
          {semesters.map((sem, i) => (
            <SemesterSummary key={`${sem.semester}-${sem.academic_year}`} semester={sem} scale={scale} isActive={i === 0} />
          ))}
          {semesters.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>No GPA entries yet. Click "Add Entry" to start tracking your grades.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }} onClick={openAddModal}>Add Your First Grade</button>
            </div>
          )}

          <div className="card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>📝 Grade Entries</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Course</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Credits</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '180px' }}>Grade</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Points</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: '100px' }}>Quality Pts</th>
                    <th style={{ padding: '0.75rem', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <GradeRow
                      key={entry.id}
                      entry={entry}
                      index={idx}
                      scale={scale}
                      onChange={(i, changes) => {
                        const newEntries = [...entries];
                        newEntries[i] = { ...newEntries[i], ...changes };
                        setEntries(newEntries);
                      }}
                      onDelete={handleDelete}
                      courses={courses}
                      isEditing={editingIndex === idx}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>🎯 GPA Goals</h3>
            {goals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No GPA goals set. Create one from the Goals page.</p>
            ) : (
              goals.map(g => (
                <div key={g.goal_id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem', borderLeft: `4px solid ${g.is_met ? 'var(--green)' : 'var(--amber)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{g.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target: {g.target_gpa} · {g.semester || 'Overall'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: g.is_met ? 'var(--green)' : 'var(--amber)' }}>
                        {g.current_gpa?.toFixed(2) || '—'}
                      </div>
                      <div style={{ fontSize: '12px', color: g.is_met ? 'var(--green)' : 'var(--text-muted)' }}>
                        {g.is_met ? '✅ Goal Met' : `Gap: ${Math.abs(g.gap || 0).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>📋 Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={openAddModal}>➕ Add Grade Entry</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setShowWhatIf(true)}>🔮 Run What-If Scenario</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>📄 Export to PDF</button>
              <a href="/goals" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>🎯 Manage Goals</button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay open" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Add Grade Entry</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Semester *</label>
                  <select name="semester" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input name="academic_year" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} placeholder="2026" />
                </div>
              </div>
              <div className="form-group">
                <label>Entry Type</label>
                <select name="entry_type" value={formData.entry_type} onChange={e => setFormData({...formData, entry_type: e.target.value})}>
                  <option value="course">Course Grade</option>
                  <option value="historical">Historical Semester GPA</option>
                </select>
              </div>
              {formData.entry_type === 'course' && (
                <>
                  <div className="form-group">
                    <label>Course</label>
                    <select name="course_id" value={formData.course_id || ''} onChange={e => {
                      const id = e.target.value ? parseInt(e.target.value) : null;
                      const course = courses.find(c => c.id === id);
                      setFormData({...formData, course_id: id, course_label: course?.name || ''});
                    }}>
                      <option value="">Manual Entry</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} {c.name} ({c.credit_hours} cr)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Course Name (if manual)</label>
                    <input name="course_label" value={formData.course_label} onChange={e => setFormData({...formData, course_label: e.target.value})} placeholder="e.g., Software Engineering" />
                  </div>
                </>
              )}
              {formData.entry_type === 'historical' && (
                <div className="form-group">
                  <label>Semester Label</label>
                  <input name="course_label" value={formData.course_label} onChange={e => setFormData({...formData, course_label: e.target.value})} placeholder="e.g., Fall 2025 Semester" />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input type="number" step="0.5" min="0" max="10" name="credit_hours" value={formData.credit_hours} onChange={e => setFormData({...formData, credit_hours: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Grade Scale</label>
                  <select name="grade_scale" value={formData.grade_scale} onChange={e => setFormData({...formData, grade_scale: e.target.value})}>
                    {GRADE_SCALE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Grade (Letter or Percentage)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select name="grade_letter" value={formData.grade_letter || ''} onChange={e => {
                    const letter = e.target.value;
                    const maxPoints = Math.max(...Object.values(GRADE_POINTS[formData.grade_scale]));
                    const pct = letter ? (GRADE_POINTS[formData.grade_scale][letter] / maxPoints) * 100 : '';
                    setFormData({...formData, grade_letter: letter || null, percentage: pct || null});
                  }}>
                    <option value="">Select Letter</option>
                    {LETTER_GRADES_4.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" min="0" max="100" step="0.1" name="percentage" value={formData.percentage || ''} onChange={e => {
                    const pct = parseFloat(e.target.value);
                    let letter = '';
                    if (!isNaN(pct)) {
                      const maxPoints = Math.max(...Object.values(GRADE_POINTS[formData.grade_scale]));
                      const targetPoints = (pct / 100) * maxPoints;
                      letter = Object.entries(GRADE_POINTS[formData.grade_scale]).find(([_, v]) => v >= targetPoints)?.[0] || 'F';
                    }
                    setFormData({...formData, percentage: isNaN(pct) ? null : pct, grade_letter: letter || null});
                  }} placeholder="%" style={{ width: '80px' }} />
                  <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Auto-syncs</span>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingIndex !== null && (
        <div className="modal-overlay open" onClick={() => { setShowEditModal(false); setEditingIndex(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Grade Entry</h2>
              <button className="modal-close" onClick={() => { setShowEditModal(false); setEditingIndex(null); }}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              {/* Same form fields as add modal but pre-filled */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Semester *</label>
                  <select name="semester" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input name="academic_year" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input name="course_label" value={formData.course_label} onChange={e => setFormData({...formData, course_label: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input type="number" step="0.5" min="0" max="10" name="credit_hours" value={formData.credit_hours} onChange={e => setFormData({...formData, credit_hours: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Grade Scale</label>
                  <select name="grade_scale" value={formData.grade_scale} onChange={e => setFormData({...formData, grade_scale: e.target.value})}>
                    {GRADE_SCALE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Grade</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select name="grade_letter" value={formData.grade_letter || ''} onChange={e => {
                    const letter = e.target.value;
                    const maxPoints = Math.max(...Object.values(GRADE_POINTS[formData.grade_scale]));
                    const pct = letter ? (GRADE_POINTS[formData.grade_scale][letter] / maxPoints) * 100 : '';
                    setFormData({...formData, grade_letter: letter || null, percentage: pct || null});
                  }}>
                    <option value="">Select Letter</option>
                    {LETTER_GRADES_4.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" min="0" max="100" step="0.1" name="percentage" value={formData.percentage || ''} onChange={e => {
                    const pct = parseFloat(e.target.value);
                    let letter = '';
                    if (!isNaN(pct)) {
                      const maxPoints = Math.max(...Object.values(GRADE_POINTS[formData.grade_scale]));
                      const targetPoints = (pct / 100) * maxPoints;
                      letter = Object.entries(GRADE_POINTS[formData.grade_scale]).find(([_, v]) => v >= targetPoints)?.[0] || 'F';
                    }
                    setFormData({...formData, percentage: isNaN(pct) ? null : pct, grade_letter: letter || null});
                  }} placeholder="%" style={{ width: '80px' }} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditingIndex(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWhatIf && cumulative && (
        <WhatIfCalculator
          currentCGPA={cumulative.cumulative_gpa}
          currentCredits={cumulative.total_credits}
          remainingCredits={remainingCredits}
          scale={scale}
          onClose={() => setShowWhatIf(false)}
        />
      )}
    </div>
  );
}