import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';

/* =========================================================================
   HEC 4.0 Grading Scale (COMSATS Standard — Fall 2021+)
   ========================================================================= */

const GRADE_SCALE = {
  'A':  4.00, 'A-': 3.70,
  'B+': 3.30, 'B':  3.00, 'B-': 2.70,
  'C+': 2.30, 'C':  2.00, 'C-': 1.70,
  'D':  1.00, 'F':  0.00,
};

const LETTER_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

// (min_percentage, letter_grade) — percentage is rounded before lookup
const PERCENTAGE_THRESHOLDS = [
  [85, 'A'], [80, 'A-'], [75, 'B+'], [70, 'B'], [65, 'B-'],
  [61, 'C+'], [58, 'C'], [55, 'C-'], [50, 'D'], [0, 'F'],
];

function percentageToLetter(pct) {
  const rounded = Math.round(pct);
  for (const [min, letter] of PERCENTAGE_THRESHOLDS) {
    if (rounded >= min) return letter;
  }
  return 'F';
}

function gradeColor(letter) {
  const pts = GRADE_SCALE[letter] ?? 0;
  if (pts >= 3.7) return 'var(--green)';
  if (pts >= 3.0) return '#22d3ee';
  if (pts >= 2.0) return 'var(--amber)';
  if (pts >= 1.0) return '#fb923c';
  return 'var(--red)';
}

/* =========================================================================
   SGPA Calculator Tab  (client-side only — quick calculator)
   ========================================================================= */

function SGPACalculator() {
  const [courses, setCourses] = useState([
    { name: '', creditHours: 3, grade: '' },
  ]);

  const addCourse = () => setCourses([...courses, { name: '', creditHours: 3, grade: '' }]);
  const removeCourse = (i) => setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i, field, value) => {
    const updated = [...courses];
    updated[i] = { ...updated[i], [field]: value };
    setCourses(updated);
  };

  const validCourses = courses.filter(c => c.grade && GRADE_SCALE[c.grade] !== undefined && c.creditHours > 0);
  const totalCredits = validCourses.reduce((s, c) => s + c.creditHours, 0);
  const totalQP = validCourses.reduce((s, c) => s + c.creditHours * GRADE_SCALE[c.grade], 0);
  const sgpa = totalCredits > 0 ? totalQP / totalCredits : 0;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>Course Name</th>
              <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>Credit Hours</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>Grade</th>
              <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>Points</th>
              <th style={{ ...thStyle, width: '110px', textAlign: 'center' }}>Quality Pts</th>
              <th style={{ ...thStyle, width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => {
              const pts = GRADE_SCALE[c.grade];
              const qp = pts !== undefined ? c.creditHours * pts : null;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <input
                      type="text" value={c.name} placeholder={`Course ${i + 1}`}
                      onChange={e => updateCourse(i, 'name', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input
                      type="number" min="0.5" max="6" step="0.5" value={c.creditHours}
                      onChange={e => updateCourse(i, 'creditHours', parseFloat(e.target.value) || 0)}
                      style={{ ...inputStyle, width: '70px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <select
                      value={c.grade} onChange={e => updateCourse(i, 'grade', e.target.value)}
                      style={{ ...inputStyle, width: '90px', textAlign: 'center' }}
                    >
                      <option value="">—</option>
                      {LETTER_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: c.grade ? gradeColor(c.grade) : 'var(--text-muted)' }}>
                    {pts !== undefined ? pts.toFixed(2) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--blue)' }}>
                    {qp !== null ? qp.toFixed(2) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {courses.length > 1 && (
                      <button onClick={() => removeCourse(i)} style={deleteBtnStyle}>✕</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={addCourse} style={addRowBtnStyle}>+ Add Course</button>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
        <SummaryItem label="Total Credits" value={totalCredits} />
        <SummaryItem label="Quality Points" value={totalQP.toFixed(2)} />
        <SummaryItem label="Semester GPA" value={sgpa.toFixed(2)} large color="var(--green)" />
        <SummaryItem label="Grade" value={totalCredits > 0 ? percentageToLetter(sgpa * 25) : '—'} />
      </div>
    </div>
  );
}

/* =========================================================================
   CGPA Calculator Tab  (client-side only — quick calculator)
   ========================================================================= */

function CGPACalculator() {
  const [semesters, setSemesters] = useState([
    { label: 'Semester 1', sgpa: '', creditHours: '' },
  ]);

  const addSemester = () => setSemesters([...semesters, { label: `Semester ${semesters.length + 1}`, sgpa: '', creditHours: '' }]);
  const removeSemester = (i) => setSemesters(semesters.filter((_, idx) => idx !== i));
  const updateSemester = (i, field, value) => {
    const updated = [...semesters];
    updated[i] = { ...updated[i], [field]: value };
    setSemesters(updated);
  };

  const validSemesters = semesters.filter(s => s.sgpa !== '' && s.creditHours !== '' && parseFloat(s.sgpa) >= 0 && parseFloat(s.creditHours) > 0);
  const totalCredits = validSemesters.reduce((s, sem) => s + parseFloat(sem.creditHours), 0);
  const totalQP = validSemesters.reduce((s, sem) => s + parseFloat(sem.sgpa) * parseFloat(sem.creditHours), 0);
  const cgpa = totalCredits > 0 ? totalQP / totalCredits : 0;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>Semester</th>
              <th style={{ ...thStyle, width: '130px', textAlign: 'center' }}>SGPA</th>
              <th style={{ ...thStyle, width: '130px', textAlign: 'center' }}>Credit Hours</th>
              <th style={{ ...thStyle, width: '130px', textAlign: 'center' }}>Quality Points</th>
              <th style={{ ...thStyle, width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((s, i) => {
              const qp = s.sgpa && s.creditHours ? (parseFloat(s.sgpa) * parseFloat(s.creditHours)) : null;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <input
                      type="text" value={s.label} onChange={e => updateSemester(i, 'label', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input
                      type="number" min="0" max="4" step="0.01" value={s.sgpa}
                      onChange={e => updateSemester(i, 'sgpa', e.target.value)}
                      placeholder="0.00" style={{ ...inputStyle, width: '90px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input
                      type="number" min="1" max="30" step="1" value={s.creditHours}
                      onChange={e => updateSemester(i, 'creditHours', e.target.value)}
                      placeholder="0" style={{ ...inputStyle, width: '90px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--blue)' }}>
                    {qp !== null ? qp.toFixed(2) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {semesters.length > 1 && (
                      <button onClick={() => removeSemester(i)} style={deleteBtnStyle}>✕</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={addSemester} style={addRowBtnStyle}>+ Add Semester</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
        <SummaryItem label="Total Semesters" value={validSemesters.length} />
        <SummaryItem label="Total Credits" value={totalCredits} />
        <SummaryItem label="Total Quality Pts" value={totalQP.toFixed(2)} />
        <SummaryItem label="Cumulative GPA" value={cgpa.toFixed(2)} large color="var(--green)" />
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
  const [quizMax, setQuizMax] = useState(10);
  const [assignmentMax, setAssignmentMax] = useState(10);
  const [midtermMax, setMidtermMax] = useState(25);
  const [terminalMax, setTerminalMax] = useState(50);
  // Lab fields
  const [theoryPct, setTheoryPct] = useState('');
  const [practicalPct, setPracticalPct] = useState('');
  const [theoryCH, setTheoryCH] = useState('');
  const [practicalCH, setPracticalCH] = useState('');

  const updateQuiz = (i, v) => { const q = [...quizzes]; q[i] = v; setQuizzes(q); };
  const updateAssignment = (i, v) => { const a = [...assignments]; a[i] = v; setAssignments(a); };

  // Calculate results locally (same logic as backend)
  const validQuizzes = quizzes.filter(q => q !== '' && !isNaN(parseFloat(q))).map(Number);
  const validAssignments = assignments.filter(a => a !== '' && !isNaN(parseFloat(a))).map(Number);
  const quizAvg = validQuizzes.length > 0 ? validQuizzes.reduce((a, b) => a + b, 0) / validQuizzes.length : null;
  const assignAvg = validAssignments.length > 0 ? validAssignments.reduce((a, b) => a + b, 0) / validAssignments.length : null;
  const midtermPct = midterm !== '' && midtermMax > 0 ? (parseFloat(midterm) / midtermMax) * 100 : null;
  const terminalPct = terminal !== '' && terminalMax > 0 ? (parseFloat(terminal) / terminalMax) * 100 : null;

  let totalPct = null;
  let internalTotal = null;

  if (!hasLab) {
    let sessionalPct = 0;
    let sessionalCount = 0;
    if (quizAvg !== null && quizMax > 0) { sessionalPct += (quizAvg / quizMax) * 100; sessionalCount++; }
    if (assignAvg !== null && assignmentMax > 0) { sessionalPct += (assignAvg / assignmentMax) * 100; sessionalCount++; }
    if (sessionalCount > 0) sessionalPct /= sessionalCount;

    const sessionalWeighted = sessionalPct * 0.25;
    const midWeighted = (midtermPct || 0) * 0.25;
    const termWeighted = (terminalPct || 0) * 0.50;

    internalTotal = +(sessionalWeighted + midWeighted).toFixed(2);
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
  const predictedGPA = predictedGrade ? GRADE_SCALE[predictedGrade] : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '14px' }}>
          <input type="checkbox" checked={hasLab} onChange={e => setHasLab(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }}
          />
          This course has a Lab component
        </label>
      </div>

      {!hasLab ? (
        <>
          {/* Quizzes */}
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Quizzes (out of {quizMax} each)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {quizzes.map((q, i) => (
                <input key={i} type="number" min="0" max={quizMax} step="0.5" value={q}
                  onChange={e => updateQuiz(i, e.target.value)}
                  placeholder={`Q${i + 1}`}
                  style={{ ...inputStyle, width: '70px', textAlign: 'center' }}
                />
              ))}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Avg: {quizAvg !== null ? quizAvg.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* Assignments */}
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Assignments (out of {assignmentMax} each)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {assignments.map((a, i) => (
                <input key={i} type="number" min="0" max={assignmentMax} step="0.5" value={a}
                  onChange={e => updateAssignment(i, e.target.value)}
                  placeholder={`A${i + 1}`}
                  style={{ ...inputStyle, width: '70px', textAlign: 'center' }}
                />
              ))}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Avg: {assignAvg !== null ? assignAvg.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* Mid & Terminal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Mid-Term (out of {midtermMax})</h4>
              <input type="number" min="0" max={midtermMax} step="0.5" value={midterm}
                onChange={e => setMidterm(e.target.value)} placeholder="Score"
                style={{ ...inputStyle, width: '100%' }}
              />
              {midtermPct !== null && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{midtermPct.toFixed(1)}%</span>}
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Terminal Exam (out of {terminalMax})</h4>
              <input type="number" min="0" max={terminalMax} step="0.5" value={terminal}
                onChange={e => setTerminal(e.target.value)} placeholder="Score"
                style={{ ...inputStyle, width: '100%' }}
              />
              {terminalPct !== null && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{terminalPct.toFixed(1)}%</span>}
            </div>
          </div>

          {/* Weightage info */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <strong>Weightage:</strong> Quizzes/Assignments = 25% · Mid-Term = 25% · Terminal = 50%
          </div>
        </>
      ) : (
        /* Lab course mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Theory</h4>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '12px' }}>Percentage (%)</label>
              <input type="number" min="0" max="100" step="0.1" value={theoryPct}
                onChange={e => setTheoryPct(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Credit Hours</label>
              <input type="number" min="0.5" max="6" step="0.5" value={theoryCH}
                onChange={e => setTheoryCH(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-muted)' }}>Practical / Lab</h4>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '12px' }}>Percentage (%)</label>
              <input type="number" min="0" max="100" step="0.1" value={practicalPct}
                onChange={e => setPracticalPct(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Credit Hours</label>
              <input type="number" min="0.5" max="6" step="0.5" value={practicalCH}
                onChange={e => setPracticalCH(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', fontSize: '12px', color: 'var(--text-muted)', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <strong>Formula:</strong> Total % = ((Theory % × Theory CH) + (Practical % × Practical CH)) ÷ Total CH<br />
            <em>You must pass theory and lab separately. Failing either = failing the course.</em>
          </div>
        </div>
      )}

      {/* Result summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
        {!hasLab && <SummaryItem label="Internal Marks" value={internalTotal !== null ? `${internalTotal}%` : '—'} />}
        <SummaryItem label="Total Percentage" value={totalPct !== null ? `${totalPct}%` : '—'} />
        <SummaryItem label="Predicted Grade" value={predictedGrade || '—'} large color={predictedGrade ? gradeColor(predictedGrade) : 'var(--text-muted)'} />
        <SummaryItem label="Grade Points" value={predictedGPA !== null ? predictedGPA.toFixed(2) : '—'} color="var(--blue)" />
      </div>
    </div>
  );
}


/* =========================================================================
   Shared components & styles
   ========================================================================= */

function SummaryItem({ label, value, large, color }) {
  return (
    <div>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{label}</span>
      <strong style={{ fontSize: large ? '1.75rem' : '1.1rem', color: color || 'var(--text-primary)' }}>{value}</strong>
    </div>
  );
}

function GradeScaleTable() {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px' }}>HEC 4.0 Grading Scale</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '0.4rem', textAlign: 'left' }}>Grade</th>
            <th style={{ padding: '0.4rem', textAlign: 'center' }}>Percentage</th>
            <th style={{ padding: '0.4rem', textAlign: 'center' }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {PERCENTAGE_THRESHOLDS.map(([min, letter], i) => {
            const max = i === 0 ? 100 : PERCENTAGE_THRESHOLDS[i - 1][0] - 1;
            return (
              <tr key={letter} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.4rem', fontWeight: 600, color: gradeColor(letter) }}>{letter}</td>
                <td style={{ padding: '0.4rem', textAlign: 'center', color: 'var(--text-muted)' }}>{min} – {max}%</td>
                <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 600 }}>{GRADE_SCALE[letter].toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Shared inline styles
const thStyle = { padding: '0.75rem', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 };
const tdStyle = { padding: '0.6rem 0.75rem' };
const inputStyle = { padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '100%' };
const deleteBtnStyle = { background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem', borderRadius: '6px' };
const addRowBtnStyle = { marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', width: '100%', transition: 'all 0.2s' };


/* =========================================================================
   What-If Calculator (overlay)
   ========================================================================= */

function WhatIfCalculator({ currentCGPA, currentCredits, remainingCredits, onClose }) {
  const [targetCGPA, setTargetCGPA] = useState('');
  const [targetSemGPA, setTargetSemGPA] = useState('');
  const results = [];

  if (targetCGPA) {
    const needed = (parseFloat(targetCGPA) * (currentCredits + remainingCredits) - currentCGPA * currentCredits) / remainingCredits;
    const letter = LETTER_GRADES.find(g => GRADE_SCALE[g] >= needed) || 'A';
    results.push({
      name: `Target CGPA: ${targetCGPA}`,
      needed: needed.toFixed(2),
      achievable: needed <= 4.0,
      letter,
    });
  }
  if (targetSemGPA) {
    const projCGPA = (currentCGPA * currentCredits + parseFloat(targetSemGPA) * remainingCredits) / (currentCredits + remainingCredits);
    results.push({
      name: `If Semester GPA = ${targetSemGPA}`,
      projected: projCGPA.toFixed(2),
      needed: targetSemGPA,
      achievable: parseFloat(targetSemGPA) <= 4.0,
    });
  }

  // Straight A's
  const straightA = (currentCGPA * currentCredits + 4.0 * remainingCredits) / (currentCredits + remainingCredits);
  results.push({ name: "Straight A's", projected: straightA.toFixed(2), needed: 4.0, achievable: true });

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>🔮 What-If Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Target CGPA</label>
          <input type="number" step="0.01" min="0" max="4" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} placeholder="4.00" />
        </div>
        <div className="form-group">
          <label>Target Semester GPA</label>
          <input type="number" step="0.01" min="0" max="4" value={targetSemGPA} onChange={e => setTargetSemGPA(e.target.value)} placeholder="4.00" />
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


/* =========================================================================
   Main GPA Page
   ========================================================================= */

const TABS = [
  { key: 'sgpa', label: 'SGPA Calculator', icon: '📊' },
  { key: 'cgpa', label: 'CGPA Calculator', icon: '📈' },
  { key: 'internal', label: 'Internal Marks', icon: '📝' },
];

export default function GPAPage() {
  const [activeTab, setActiveTab] = useState('sgpa');
  const [entries, setEntries] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [cumulative, setCumulative] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    semester: '', academic_year: '', entry_type: 'course',
    course_id: null, course_label: '', credit_hours: 3,
    grade_letter: null, percentage: null,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, cumulativeRes, goalsRes, coursesRes] = await Promise.all([
        apiFetch('/gpa/entries'),
        apiFetch('/gpa/cumulative'),
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
        body: JSON.stringify({ ...formData, grade_scale: '4.0' }),
      });
      setShowAddModal(false);
      setFormData({ semester: '', academic_year: '', entry_type: 'course', course_id: null, course_label: '', credit_hours: 3, grade_letter: null, percentage: null });
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
        body: JSON.stringify({ ...entry, ...formData, grade_scale: '4.0' }),
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
    setFormData({ semester: '', academic_year: '', entry_type: 'course', course_id: null, course_label: '', credit_hours: 3, grade_letter: null, percentage: null });
    setShowAddModal(true);
  };

  const openEditModal = (index) => {
    const entry = entries[index];
    setFormData({
      semester: entry.semester, academic_year: entry.academic_year || '',
      entry_type: entry.entry_type, course_id: entry.course_id,
      course_label: entry.course_label, credit_hours: entry.credit_hours,
      grade_letter: entry.grade_letter, percentage: entry.percentage,
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
          <p className="page-subtitle">HEC 4.0 Scale · SGPA · CGPA · Internal Marks</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Entry</button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Calculator Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '12px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '0.6rem 1rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '14px', fontWeight: activeTab === tab.key ? 600 : 400, transition: 'all 0.2s',
              background: activeTab === tab.key ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Main content */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {activeTab === 'sgpa' && <SGPACalculator />}
            {activeTab === 'cgpa' && <CGPACalculator />}
            {activeTab === 'internal' && <InternalMarksCalculator />}
          </div>

          {/* Saved entries table */}
          {entries.length > 0 && (
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>📋 Saved Grade Entries</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                      <th style={thStyle}>Course</th>
                      <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Credits</th>
                      <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Grade</th>
                      <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Points</th>
                      <th style={{ ...thStyle, textAlign: 'center', width: '100px' }}>Quality Pts</th>
                      <th style={{ ...thStyle, width: '70px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => {
                      const pts = GRADE_SCALE[entry.grade_letter] ?? null;
                      const qp = pts !== null ? entry.credit_hours * pts : null;
                      return (
                        <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={tdStyle}>
                            <span style={{ fontSize: '13px' }}>
                              {entry.course_id ? '🔗' : '✏️'} {entry.course_label}
                            </span>
                            <br />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.semester} {entry.academic_year || ''}</span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{entry.credit_hours}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: entry.grade_letter ? gradeColor(entry.grade_letter) : 'var(--text-muted)' }}>
                            {entry.grade_letter || '—'}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>
                            {pts !== null ? pts.toFixed(2) : '—'}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: 'var(--blue)' }}>
                            {qp !== null ? qp.toFixed(2) : '—'}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <button onClick={() => openEditModal(idx)} style={{ ...deleteBtnStyle, color: 'var(--text-muted)', marginRight: '0.25rem' }}>✏️</button>
                            <button onClick={() => handleDelete(idx)} style={deleteBtnStyle}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* CGPA summary */}
          {cumulative && (
            <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--green)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cumulative CGPA</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)' }}>{cumulative.cumulative_gpa.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cumulative.total_credits} credits · {cumulative.semesters.length} semesters</div>
            </div>
          )}

          {/* Grade scale reference */}
          <GradeScaleTable />

          {/* GPA Goals */}
          {goals.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px' }}>🎯 GPA Goals</h4>
              {goals.map(g => (
                <div key={g.goal_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <span>{g.title}</span>
                  <span style={{ fontWeight: 600, color: g.is_met ? 'var(--green)' : 'var(--amber)' }}>
                    {g.current_gpa?.toFixed(2) || '—'} / {g.target_gpa}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '14px' }}>⚡ Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%', fontSize: '13px' }} onClick={openAddModal}>➕ Add Grade Entry</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%', fontSize: '13px' }} onClick={() => setShowWhatIf(true)}>🔮 What-If Scenario</button>
              <a href="/goals" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%', fontSize: '13px' }}>🎯 Manage Goals</button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* What-if */}
      {showWhatIf && cumulative && (
        <WhatIfCalculator
          currentCGPA={cumulative.cumulative_gpa}
          currentCredits={cumulative.total_credits}
          remainingCredits={remainingCredits || 15}
          onClose={() => setShowWhatIf(false)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay open" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Add Grade Entry</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Semester *</label>
                  <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} placeholder="2026" />
                </div>
              </div>
              {formData.entry_type === 'course' && (
                <>
                  <div className="form-group">
                    <label>Course</label>
                    <select value={formData.course_id || ''} onChange={e => {
                      const id = e.target.value ? parseInt(e.target.value) : null;
                      const course = courses.find(c => c.id === id);
                      setFormData({...formData, course_id: id, course_label: course?.name || '', credit_hours: course?.credit_hours || formData.credit_hours});
                    }}>
                      <option value="">Manual Entry</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} {c.name} ({c.credit_hours} cr)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Course Name (if manual)</label>
                    <input value={formData.course_label} onChange={e => setFormData({...formData, course_label: e.target.value})} placeholder="e.g., Programming Fundamentals" />
                  </div>
                </>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input type="number" step="0.5" min="0.5" max="6" value={formData.credit_hours} onChange={e => setFormData({...formData, credit_hours: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={formData.grade_letter || ''} onChange={e => {
                      const letter = e.target.value;
                      setFormData({...formData, grade_letter: letter || null});
                    }}>
                      <option value="">Select</option>
                      {LETTER_GRADES.map(g => <option key={g} value={g}>{g} ({GRADE_SCALE[g].toFixed(2)})</option>)}
                    </select>
                    <input type="number" min="0" max="100" step="0.1" value={formData.percentage || ''} onChange={e => {
                      const pct = parseFloat(e.target.value);
                      const letter = !isNaN(pct) ? percentageToLetter(pct) : null;
                      setFormData({...formData, percentage: isNaN(pct) ? null : pct, grade_letter: letter});
                    }} placeholder="%" style={{ width: '70px' }} />
                  </div>
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

      {/* Edit Modal */}
      {showEditModal && editingIndex !== null && (
        <div className="modal-overlay open" onClick={() => { setShowEditModal(false); setEditingIndex(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Grade Entry</h2>
              <button className="modal-close" onClick={() => { setShowEditModal(false); setEditingIndex(null); }}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Semester *</label>
                  <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input value={formData.course_label} onChange={e => setFormData({...formData, course_label: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input type="number" step="0.5" min="0.5" max="6" value={formData.credit_hours} onChange={e => setFormData({...formData, credit_hours: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={formData.grade_letter || ''} onChange={e => {
                      const letter = e.target.value;
                      setFormData({...formData, grade_letter: letter || null});
                    }}>
                      <option value="">Select</option>
                      {LETTER_GRADES.map(g => <option key={g} value={g}>{g} ({GRADE_SCALE[g].toFixed(2)})</option>)}
                    </select>
                    <input type="number" min="0" max="100" step="0.1" value={formData.percentage || ''} onChange={e => {
                      const pct = parseFloat(e.target.value);
                      const letter = !isNaN(pct) ? percentageToLetter(pct) : null;
                      setFormData({...formData, percentage: isNaN(pct) ? null : pct, grade_letter: letter});
                    }} placeholder="%" style={{ width: '70px' }} />
                  </div>
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
    </div>
  );
}