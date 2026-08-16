'use client';

import React, { useState } from 'react';
import {
  GRADE_SCALE,
  LETTER_GRADES,
  PERCENTAGE_THRESHOLDS,
  percentageToLetter,
  gradeColor,
  getMaxGPA,
  validateCustomScale,
  validateCustomThresholds,
  clampCredits,
  safeParseFloat,
} from '@tenaciti/shared';

const CUSTOM_SCALE_KEY = 'tenaciti_custom_gpa_scale';
const CUSTOM_THRESHOLDS_KEY = 'tenaciti_custom_pct_thresholds';
const MAX_COURSES = 20;
const MAX_SEMESTERS = 16;

function useCustomScale() {
  const [customScale, setCustomScaleState] = useState<Record<string, number> | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_SCALE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { valid } = validateCustomScale(parsed);
        if (valid) return parsed;
      }
    } catch { /* ignore */ }
    return null;
  });

  const [customThresholds, setCustomThresholdsState] = useState<[number, string][] | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_THRESHOLDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { valid } = validateCustomThresholds(parsed);
        if (valid) return parsed;
      }
    } catch { /* ignore */ }
    return null;
  });

  const activeScale: Record<string, number> = customScale || GRADE_SCALE;
  const activeThresholds = customThresholds || PERCENTAGE_THRESHOLDS;
  const maxGPA = getMaxGPA(activeScale);

  const setCustomScale = (scale: Record<string, number> | null) => {
    if (scale === null) {
      localStorage.removeItem(CUSTOM_SCALE_KEY);
      setCustomScaleState(null);
    } else {
      localStorage.setItem(CUSTOM_SCALE_KEY, JSON.stringify(scale));
      setCustomScaleState(scale);
    }
  };

  const setCustomThresholds = (thresholds: [number, string][] | null) => {
    if (thresholds === null) {
      localStorage.removeItem(CUSTOM_THRESHOLDS_KEY);
      setCustomThresholdsState(null);
    } else {
      localStorage.setItem(CUSTOM_THRESHOLDS_KEY, JSON.stringify(thresholds));
      setCustomThresholdsState(thresholds);
    }
  };

  return { activeScale, activeThresholds, maxGPA, customScale, customThresholds, setCustomScale, setCustomThresholds };
}

/* =========================================================================
   SGPA Calculator Tab 
   ========================================================================= */

function SGPACalculator() {
  const { activeScale, activeThresholds } = useCustomScale();
  const [courses, setCourses] = useState([
    { name: '', creditHours: 3, grade: '' },
  ]);

  const addCourse = () => {
    if (courses.length >= MAX_COURSES) return;
    setCourses([...courses, { name: '', creditHours: 3, grade: '' }]);
  };
  const removeCourse = (i: number) => setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: string, value: string | number) => {
    const updated = [...courses];
    if (field === 'creditHours') {
      value = clampCredits(value, 0.5, 6);
    }
    updated[i] = { ...updated[i], [field]: value };
    setCourses(updated);
  };

  const validCourses = courses.filter(c => c.grade && activeScale[c.grade] !== undefined && c.creditHours > 0);
  const totalCredits = validCourses.reduce((s, c) => s + c.creditHours, 0);
  const totalQP = validCourses.reduce((s, c) => s + c.creditHours * activeScale[c.grade], 0);
  const sgpa = totalCredits > 0 ? totalQP / totalCredits : 0;

  return (
    <div className="gpa-glass-card" style={{ gap: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Current Semester Calculation</h2>
      
      <div className="gpa-table-wrapper">
        <table className="gpa-table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Credits</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Grade</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Points</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Quality Pts</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => {
              const pts = activeScale[c.grade];
              const qp = pts !== undefined ? c.creditHours * pts : null;
              return (
                <tr key={i} className="gpa-table-row">
                  <td>
                    <input
                      className="gpa-input"
                      type="text" value={c.name} placeholder={`Course ${i + 1}`}
                      onChange={e => updateCourse(i, 'name', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      className="gpa-input"
                      type="number" min="0.5" max="6" step="0.5" value={c.creditHours}
                      onChange={e => updateCourse(i, 'creditHours', parseFloat(e.target.value) || 0)}
                      style={{ textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <select
                      className="gpa-select"
                      value={c.grade} onChange={e => updateCourse(i, 'grade', e.target.value)}
                    >
                      <option value="" disabled>Grade</option>
                      {LETTER_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: c.grade ? gradeColor(c.grade, activeScale) : 'var(--on-surface-variant)' }}>
                    {pts !== undefined ? pts.toFixed(2) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {qp !== null ? qp.toFixed(2) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {courses.length > 1 && (
                      <button onClick={() => removeCourse(i)} className="notes-action-btn" style={{ padding: '4px', background: 'transparent', border: 'none', minWidth: '0' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--error)' }}>close</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <button onClick={addCourse} className="notes-action-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }} disabled={courses.length >= MAX_COURSES}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Course {courses.length >= MAX_COURSES ? `(max ${MAX_COURSES})` : ''}
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--surface-container-highest)', margin: '8px 0' }} />

      {/* Summary */}
      <div className="gpa-summary-grid">
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Credits</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{totalCredits}</span>
        </div>
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Quality Points</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{totalQP.toFixed(2)}</span>
        </div>
        <div className="gpa-summary-item highlight">
          <span style={{ fontSize: '12px', color: 'var(--on-secondary-fixed-variant)', fontWeight: 500 }}>Semester GPA</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{sgpa.toFixed(2)}</span>
        </div>
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Letter Grade</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{totalCredits > 0 ? percentageToLetter(sgpa * 25, activeThresholds) : '—'}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CGPA Calculator Tab
   ========================================================================= */

function CGPACalculator() {
  const { maxGPA } = useCustomScale();
  const [semesters, setSemesters] = useState([
    { label: 'Semester 1', sgpa: '', creditHours: '' },
  ]);

  const addSemester = () => {
    if (semesters.length >= MAX_SEMESTERS) return;
    setSemesters([...semesters, { label: `Semester ${semesters.length + 1}`, sgpa: '', creditHours: '' }]);
  };
  const removeSemester = (i: number) => setSemesters(semesters.filter((_, idx) => idx !== i));
  const updateSemester = (i: number, field: string, value: string) => {
    const updated = [...semesters];
    if (field === 'sgpa' && value !== '') {
      const num = parseFloat(value);
      if (!isNaN(num) && num > maxGPA) value = String(maxGPA);
      if (!isNaN(num) && num < 0) value = '0';
    }
    if (field === 'creditHours' && value !== '') {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 60) value = '60';
      if (!isNaN(num) && num < 0) value = '0';
    }
    updated[i] = { ...updated[i], [field]: value };
    setSemesters(updated);
  };

  const validSemesters = semesters.filter(s => s.sgpa !== '' && s.creditHours !== '' && safeParseFloat(s.sgpa) >= 0 && safeParseFloat(s.creditHours) > 0);
  const totalCredits = validSemesters.reduce((s, sem) => s + safeParseFloat(sem.creditHours), 0);
  const totalQP = validSemesters.reduce((s, sem) => s + safeParseFloat(sem.sgpa) * safeParseFloat(sem.creditHours), 0);
  const cgpa = totalCredits > 0 ? totalQP / totalCredits : 0;

  return (
    <div className="gpa-glass-card" style={{ gap: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Cumulative GPA Calculation</h2>
      
      <div className="gpa-table-wrapper">
        <table className="gpa-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th style={{ width: '130px', textAlign: 'center' }}>SGPA</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Credit Hours</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Quality Points</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((s, i) => {
              const qp = s.sgpa && s.creditHours ? (parseFloat(s.sgpa) * parseFloat(s.creditHours)) : null;
              return (
                <tr key={i} className="gpa-table-row">
                  <td>
                    <input
                      className="gpa-input"
                      type="text" value={s.label} onChange={e => updateSemester(i, 'label', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      className="gpa-input"
                      type="number" min="0" max={maxGPA} step="0.01" value={s.sgpa}
                      onChange={e => updateSemester(i, 'sgpa', e.target.value)}
                      placeholder="0.00" style={{ textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      className="gpa-input"
                      type="number" min="1" max="60" step="1" value={s.creditHours}
                      onChange={e => updateSemester(i, 'creditHours', e.target.value)}
                      placeholder="0" style={{ textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {qp !== null ? qp.toFixed(2) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {semesters.length > 1 && (
                      <button onClick={() => removeSemester(i)} className="notes-action-btn" style={{ padding: '4px', background: 'transparent', border: 'none', minWidth: '0' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--error)' }}>close</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <button onClick={addSemester} className="notes-action-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }} disabled={semesters.length >= MAX_SEMESTERS}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Semester {semesters.length >= MAX_SEMESTERS ? `(max ${MAX_SEMESTERS})` : ''}
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--surface-container-highest)', margin: '8px 0' }} />

      <div className="gpa-summary-grid">
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Semesters</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{validSemesters.length}</span>
        </div>
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Credits</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{totalCredits}</span>
        </div>
        <div className="gpa-summary-item">
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Quality Pts</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>{totalQP.toFixed(2)}</span>
        </div>
        <div className="gpa-summary-item highlight">
          <span style={{ fontSize: '12px', color: 'var(--on-secondary-fixed-variant)', fontWeight: 500 }}>Cumulative GPA</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{cgpa.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Internal Marks Calculator Tab
   ========================================================================= */

function InternalMarksCalculator() {
  const [hasLab, setHasLab] = useState(false);
  const [quizzes, setQuizzes] = useState(['', '', '', '']);
  const [assignments, setAssignments] = useState(['', '', '', '']);
  const [midterm, setMidterm] = useState('');
  const [terminal, setTerminal] = useState('');
  const [quizMax] = useState(10);
  const [assignmentMax] = useState(10);
  const [midtermMax] = useState(25);
  const [terminalMax] = useState(50);
  // Lab fields
  const [theoryPct, setTheoryPct] = useState('');
  const [practicalPct, setPracticalPct] = useState('');
  const [theoryCH, setTheoryCH] = useState('');
  const [practicalCH, setPracticalCH] = useState('');

  const updateQuiz = (i: number, v: string) => {
    if (v !== '' && !isNaN(parseFloat(v))) {
      const num = parseFloat(v);
      if (num < 0) v = '0';
      if (num > quizMax) v = String(quizMax);
    }
    const q = [...quizzes]; q[i] = v; setQuizzes(q);
  };
  const updateAssignment = (i: number, v: string) => {
    if (v !== '' && !isNaN(parseFloat(v))) {
      const num = parseFloat(v);
      if (num < 0) v = '0';
      if (num > assignmentMax) v = String(assignmentMax);
    }
    const a = [...assignments]; a[i] = v; setAssignments(a);
  };

  const validQuizzes = quizzes.filter(q => q !== '' && !isNaN(parseFloat(q))).map(Number);
  const validAssignments = assignments.filter(a => a !== '' && !isNaN(parseFloat(a))).map(Number);
  const quizAvg = validQuizzes.length > 0 ? validQuizzes.reduce((a, b) => a + b, 0) / validQuizzes.length : null;
  const assignAvg = validAssignments.length > 0 ? validAssignments.reduce((a, b) => a + b, 0) / validAssignments.length : null;
  const midtermPct = midterm !== '' && midtermMax > 0 ? (parseFloat(midterm) / midtermMax) * 100 : null;
  const terminalPct = terminal !== '' && terminalMax > 0 ? (parseFloat(terminal) / terminalMax) * 100 : null;

  let totalPct = null;

  if (!hasLab) {
    let sessionalPct = 0;
    let sessionalCount = 0;
    if (quizAvg !== null && quizMax > 0) { sessionalPct += (quizAvg / quizMax) * 100; sessionalCount++; }
    if (assignAvg !== null && assignmentMax > 0) { sessionalPct += (assignAvg / assignmentMax) * 100; sessionalCount++; }
    if (sessionalCount > 0) sessionalPct /= sessionalCount;

    const sessionalWeighted = sessionalPct * 0.25;
    const midWeighted = (midtermPct || 0) * 0.25;
    const termWeighted = (terminalPct || 0) * 0.50;

    totalPct = +(sessionalWeighted + midWeighted + termWeighted).toFixed(2);
  } else {
    const tp = theoryPct !== '' ? parseFloat(theoryPct) : null;
    const pp = practicalPct !== '' ? parseFloat(practicalPct) : null;
    const tch = theoryCH !== '' ? parseFloat(theoryCH) : null;
    const pch = practicalCH !== '' ? parseFloat(practicalCH) : null;
    if (tp !== null && pp !== null && tch && pch) {
      totalPct = +((tp * tch + pp * pch) / (tch + pch)).toFixed(2);
    } else if (tp !== null) {
      totalPct = tp;
    }
  }

  const predictedGrade = totalPct !== null ? percentageToLetter(totalPct) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Controls */}
      <div className="gpa-glass-card" style={{ padding: '16px 24px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 500 }}>
          <div style={{ position: 'relative', display: 'flex' }}>
            <input 
              type="checkbox" 
              checked={hasLab} 
              onChange={e => setHasLab(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
          Lab Component
        </label>
        <button 
          className="notes-action-btn"
          onClick={() => {
            setHasLab(false); setQuizzes(['', '', '', '']); setAssignments(['', '', '', '']); setMidterm(''); setTerminal('');
            setTheoryPct(''); setPracticalPct(''); setTheoryCH(''); setPracticalCH('');
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span> Reset
        </button>
      </div>

      <div className="gpa-grid">
        <div className="gpa-main-col">
          {!hasLab ? (
            <>
              {/* Quizzes & Assignments */}
              <div className="gpa-internal-grid">
                
                {/* Quizzes */}
                <div className="gpa-internal-card group">
                  <div className="card-glow" style={{ background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.05), transparent)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--gradient-start)' }}>quiz</span> Quizzes
                    </h3>
                    <span style={{ background: 'var(--surface-container-high)', padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 500 }}>Weight: 15%</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {quizzes.map((q, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Q{i+1}</label>
                        <input className="gpa-input-box" type="number" min="0" max={quizMax} step="0.5" value={q}
                          onChange={e => updateQuiz(i, e.target.value)} placeholder="-" />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(196, 199, 199, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Current Average</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)' }}>{quizAvg !== null ? `${quizAvg.toFixed(1)} / ${quizMax}` : '—'}</span>
                  </div>
                </div>

                {/* Assignments */}
                <div className="gpa-internal-card group">
                  <div className="card-glow" style={{ background: 'linear-gradient(to bottom right, rgba(113, 42, 226, 0.05), transparent)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>assignment</span> Assignments
                    </h3>
                    <span style={{ background: 'var(--surface-container-high)', padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 500 }}>Weight: 25%</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {assignments.map((a, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>A{i+1}</label>
                        <input className="gpa-input-box" type="number" min="0" max={assignmentMax} step="0.5" value={a}
                          onChange={e => updateAssignment(i, e.target.value)} placeholder="-" />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(196, 199, 199, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Current Average</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)' }}>{assignAvg !== null ? `${assignAvg.toFixed(1)} / ${assignmentMax}` : '—'}</span>
                  </div>
                </div>

              </div>

              {/* Exams */}
              <div className="gpa-internal-grid">
                
                {/* Mid-Term */}
                <div className="gpa-internal-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--gradient-mid)' }}>description</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Mid-Term</h4>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Weight: 20%</span>
                    </div>
                  </div>
                  <div style={{ width: '96px', position: 'relative' }}>
                    <input className="gpa-input-box" type="number" min="0" max={midtermMax} step="0.5" value={midterm}
                        onChange={e => {
                          let v = e.target.value;
                          if (v !== '' && !isNaN(parseFloat(v))) {
                            const n = parseFloat(v);
                            if (n < 0) v = '0';
                            if (n > midtermMax) v = String(midtermMax);
                          }
                          setMidterm(v);
                        }} style={{ paddingRight: '24px', textAlign: 'center' }} />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>/ {midtermMax}</span>
                  </div>
                </div>

                {/* Terminal Exam */}
                <div className="gpa-internal-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>school</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Terminal Exam</h4>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Weight: 40%</span>
                    </div>
                  </div>
                  <div style={{ width: '96px', position: 'relative' }}>
                    <input className="gpa-input-box" type="number" min="0" max={terminalMax} step="0.5" value={terminal}
                        onChange={e => {
                          let v = e.target.value;
                          if (v !== '' && !isNaN(parseFloat(v))) {
                            const n = parseFloat(v);
                            if (n < 0) v = '0';
                            if (n > terminalMax) v = String(terminalMax);
                          }
                          setTerminal(v);
                        }} placeholder="-" style={{ paddingRight: '24px', textAlign: 'center' }} />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>/ {terminalMax}</span>
                  </div>
                </div>

              </div>
            </>
          ) : (
            /* Lab Course Mode */
            <div className="gpa-internal-grid">
              <div className="gpa-internal-card">
                <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>Theory</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Percentage (%)</label>
                    <input className="gpa-input-box" type="number" min="0" max="100" step="0.1" value={theoryPct}
                      onChange={e => {
                        let v = e.target.value;
                        if (v !== '' && !isNaN(parseFloat(v))) { if (parseFloat(v) < 0) v = '0'; if (parseFloat(v) > 100) v = '100'; }
                        setTheoryPct(v);
                      }} placeholder="0" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Credit Hours</label>
                    <input className="gpa-input-box" type="number" min="0.5" max="10" step="0.5" value={theoryCH}
                      onChange={e => {
                        let v = e.target.value;
                        if (v !== '' && !isNaN(parseFloat(v))) { if (parseFloat(v) < 0) v = '0'; if (parseFloat(v) > 10) v = '10'; }
                        setTheoryCH(v);
                      }} placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="gpa-internal-card">
                <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>Practical / Lab</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Percentage (%)</label>
                    <input className="gpa-input-box" type="number" min="0" max="100" step="0.1" value={practicalPct}
                      onChange={e => {
                        let v = e.target.value;
                        if (v !== '' && !isNaN(parseFloat(v))) { if (parseFloat(v) < 0) v = '0'; if (parseFloat(v) > 100) v = '100'; }
                        setPracticalPct(v);
                      }} placeholder="0" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Credit Hours</label>
                    <input className="gpa-input-box" type="number" min="0.5" max="10" step="0.5" value={practicalCH}
                      onChange={e => {
                        let v = e.target.value;
                        if (v !== '' && !isNaN(parseFloat(v))) { if (parseFloat(v) < 0) v = '0'; if (parseFloat(v) > 10) v = '10'; }
                        setPracticalCH(v);
                      }} placeholder="0" />
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', fontSize: '14px', color: 'var(--on-surface-variant)', padding: '16px', background: 'var(--surface-container-low)', borderRadius: '12px' }}>
                <strong>Formula:</strong> Total % = ((Theory % × Theory CH) + (Practical % × Practical CH)) ÷ Total CH<br />
                <em>You must pass theory and lab separately. Failing either = failing the course.</em>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="gpa-sidebar">
          
          {/* Main Result Card */}
          <div className="gpa-prediction-card">
            <div className="prediction-glow-1"></div>
            <div className="prediction-glow-2"></div>
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <span style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>Current Standing</span>
              <div style={{ fontSize: '72px', fontWeight: 700, lineHeight: 1 }}>{predictedGrade || '—'}</div>
              <span style={{ fontSize: '16px', opacity: 0.9, marginTop: '8px' }}>Predicted Grade</span>
            </div>
            <div style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '20px', borderRadius: '16px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Percentage</span>
                <span style={{ fontSize: '18px', fontWeight: 600 }}>{totalPct !== null ? `${totalPct}%` : '—'}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalPct || 0}%`, background: 'linear-gradient(to right, var(--success), var(--gradient-mid))', borderRadius: '999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>0%</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>100%</span>
              </div>
            </div>
          </div>
          
          {/* What-If Scenario widget */}
          <div className="gpa-glass-card">
            <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--gradient-end)' }}>explore</span> What-If Scenario
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
              Calculate what you need on your remaining assessments to hit your target grade.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px' }}>Target Grade</label>
                <select className="gpa-select" style={{ padding: '10px 12px' }}>
                  <option>A (85%+)</option>
                  <option>A- (80%+)</option>
                  <option>B+ (75%+)</option>
                  <option>B (70%+)</option>
                </select>
              </div>
              <div style={{ background: 'var(--surface-container)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(196,199,199,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Required in Terminal</span>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--error)' }}>—</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--on-surface-variant)', opacity: 0.8 }}>Based on current weights and scores.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Shared components & styles
   ========================================================================= */

function CustomScaleEditor({ onClose }: { onClose: () => void }) {
  const { activeScale, activeThresholds, setCustomScale, setCustomThresholds } = useCustomScale();
  const [editScale, setEditScale] = useState<Record<string, number | string>>(() => ({ ...activeScale }));
  const [editThresholds, setEditThresholds] = useState(() => (activeThresholds as [number, string][]).map(t => [...t] as [number | string, string]));
  const [errors, setErrors] = useState<string[]>([]);

  const handleScaleChange = (grade: string, value: string) => {
    const num = parseFloat(value);
    setEditScale(prev => ({ ...prev, [grade]: isNaN(num) ? value : num }));
  };

  const handleThresholdChange = (index: number, value: string) => {
    const num = parseInt(value, 10);
    setEditThresholds(prev => {
      const updated = prev.map(t => [...t] as [number | string, string]);
      updated[index][0] = isNaN(num) ? value : num;
      return updated;
    });
  };

  const handleSave = () => {
    const cleanScale: Record<string, number> = {};
    for (const grade of LETTER_GRADES) {
      cleanScale[grade] = typeof editScale[grade] === 'number' ? editScale[grade] as number : parseFloat(editScale[grade] as string) || 0;
    }
    const scaleResult = validateCustomScale(cleanScale);
    const thresholdResult = validateCustomThresholds(editThresholds);
    const allErrors = [...scaleResult.errors, ...thresholdResult.errors];
    setErrors(allErrors);
    if (allErrors.length === 0) {
      const isDefault = LETTER_GRADES.every(g => cleanScale[g] === GRADE_SCALE[g as keyof typeof GRADE_SCALE]);
      const isDefaultThresholds = editThresholds.every((t, i) => t[0] === PERCENTAGE_THRESHOLDS[i][0]);
      if (isDefault) setCustomScale(null); else setCustomScale(cleanScale);
      if (isDefaultThresholds) setCustomThresholds(null); else setCustomThresholds(editThresholds as unknown as [number, string][]);
      onClose();
    }
  };

  const handleReset = () => {
    setEditScale({ ...GRADE_SCALE });
    setEditThresholds((PERCENTAGE_THRESHOLDS as [number, string][]).map(t => [...t] as [number | string, string]));
    setErrors([]);
  };

  return (
    <div className="gpa-glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span> Customize Scale
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>
        Max allowed GPA: 10.0 · Values must decrease from A to F · F must be 0
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '11px', color: 'var(--on-surface-variant)' }}>Grade</th>
            <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '11px', color: 'var(--on-surface-variant)' }}>Points</th>
            <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '11px', color: 'var(--on-surface-variant)' }}>Min %</th>
          </tr>
        </thead>
        <tbody>
          {LETTER_GRADES.map((grade, idx) => (
            <tr key={grade} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
              <td style={{ padding: '6px 0', fontWeight: 600, color: gradeColor(grade, editScale as Record<string, number>) }}>{grade}</td>
              <td style={{ padding: '4px 0', textAlign: 'center' }}>
                <input
                  className="gpa-input"
                  type="number" step="0.01" min="0" max="10"
                  value={editScale[grade]}
                  onChange={e => handleScaleChange(grade, e.target.value)}
                  disabled={grade === 'F'}
                  style={{ width: '64px', textAlign: 'center', padding: '4px 6px', fontSize: '13px' }}
                />
              </td>
              <td style={{ padding: '4px 0', textAlign: 'center' }}>
                <input
                  className="gpa-input"
                  type="number" step="1" min="0" max="100"
                  value={editThresholds[idx]?.[0] ?? ''}
                  onChange={e => handleThresholdChange(idx, e.target.value)}
                  disabled={grade === 'F'}
                  style={{ width: '52px', textAlign: 'center', padding: '4px 6px', fontSize: '13px' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button className="notes-action-btn" onClick={handleReset} style={{ flex: 1, fontSize: '13px', padding: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span> Reset to HEC 4.0
        </button>
        <button className="notes-action-btn primary" onClick={handleSave} style={{ flex: 1, fontSize: '13px', padding: '8px', background: 'var(--primary)', color: 'var(--on-primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> Save
        </button>
      </div>
    </div>
  );
}

function GradeScaleTable() {
  const { activeScale, activeThresholds, customScale } = useCustomScale();
  const [showEditor, setShowEditor] = useState(false);

  if (showEditor) {
    return <CustomScaleEditor onClose={() => setShowEditor(false)} />;
  }

  return (
    <div className="gpa-glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>rule</span>
          <h3 style={{ margin: 0, fontSize: '20px' }}>{customScale ? 'Custom Scale' : 'HEC 4.0 Scale'}</h3>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500 }}
          title="Customize Scale"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span> Customize
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <tbody>
          {(activeThresholds as [number, string][]).map(([min, letter], i) => {
            const max = i === 0 ? 100 : (activeThresholds[i - 1][0] as number) - 1;
            return (
              <tr key={letter} style={{ borderBottom: '1px solid var(--surface-container-highest)' }}>
                <td style={{ padding: '8px 0', fontWeight: 600, color: gradeColor(letter as string, activeScale) }}>{letter}</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{(activeScale[letter] ?? 0).toFixed(2)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: letter === 'A' ? 'var(--success)' : 'var(--on-surface-variant)' }}>{min} – {max}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {customScale && (
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
          Using custom scale
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Main Wrapper
   ========================================================================= */

const TABS = [
  { key: 'sgpa', label: 'SGPA', icon: 'bar_chart' },
  { key: 'cgpa', label: 'CGPA', icon: 'trending_up' },
  { key: 'internal', label: 'Internal', icon: 'edit_document' },
];

export function GPACalculator() {
  const [activeTab, setActiveTab] = useState('sgpa');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="gpa-tabs-container" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`notes-action-btn ${activeTab === tab.key ? 'primary' : ''}`}
            style={{ flex: 1, padding: '12px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          {activeTab === 'sgpa' && <SGPACalculator />}
          {activeTab === 'cgpa' && <CGPACalculator />}
          {activeTab === 'internal' && <InternalMarksCalculator />}
        </div>
        <div>
          <GradeScaleTable />
        </div>
      </div>
    </div>
  );
}
