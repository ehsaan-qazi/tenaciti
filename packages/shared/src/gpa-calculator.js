/* =========================================================================
   GPA Calculator — Shared Business Logic
   
   Pure calculation functions with no UI dependencies.
   Used by both the authenticated GPA page and the public GPA calculator.
   ========================================================================= */

import { GRADE_SCALE, PERCENTAGE_THRESHOLDS } from './grade-scales.js';

/**
 * Converts a numeric percentage to its corresponding letter grade.
 * Uses the HEC 4.0 grading thresholds. Percentage is rounded before lookup.
 * 
 * @param {number} pct - The percentage score (0-100)
 * @returns {string} The letter grade (e.g., 'A', 'B+', 'F')
 */
export function percentageToLetter(pct) {
  const rounded = Math.round(pct);
  for (const [min, letter] of PERCENTAGE_THRESHOLDS) {
    if (rounded >= min) return letter;
  }
  return 'F';
}

/**
 * Calculates SGPA from an array of course entries.
 * 
 * @param {Array<{creditHours: number, grade: string}>} courses - Course entries with credits and letter grades
 * @returns {{ sgpa: number, totalCredits: number, totalQualityPoints: number, validCourses: number }}
 */
export function calculateSGPA(courses) {
  const validCourses = courses.filter(
    c => c.grade && GRADE_SCALE[c.grade] !== undefined && c.creditHours > 0
  );
  const totalCredits = validCourses.reduce((sum, c) => sum + c.creditHours, 0);
  const totalQualityPoints = validCourses.reduce(
    (sum, c) => sum + c.creditHours * GRADE_SCALE[c.grade], 0
  );
  const sgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return {
    sgpa,
    totalCredits,
    totalQualityPoints,
    validCourses: validCourses.length,
  };
}

/**
 * Calculates CGPA from an array of semester records.
 * 
 * @param {Array<{sgpa: number, creditHours: number}>} semesters - Semester records with SGPA and total credit hours
 * @returns {{ cgpa: number, totalCredits: number, totalQualityPoints: number, semesterCount: number }}
 */
export function calculateCGPA(semesters) {
  const validSemesters = semesters.filter(
    s => s.sgpa > 0 && s.creditHours > 0
  );
  const totalCredits = validSemesters.reduce((sum, s) => sum + s.creditHours, 0);
  const totalQualityPoints = validSemesters.reduce(
    (sum, s) => sum + s.sgpa * s.creditHours, 0
  );
  const cgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return {
    cgpa,
    totalCredits,
    totalQualityPoints,
    semesterCount: validSemesters.length,
  };
}

/**
 * Returns a CSS color variable name based on the letter grade.
 * Uses the design token variable names from @tenaciti/tokens.
 * 
 * @param {string} letter - The letter grade
 * @returns {string} CSS variable reference (e.g., 'var(--success)')
 */
export function gradeColor(letter) {
  const pts = GRADE_SCALE[letter] ?? 0;
  if (pts >= 3.7) return 'var(--success)';
  if (pts >= 3.0) return 'var(--primary)';
  if (pts >= 2.0) return 'var(--gradient-end)';
  if (pts >= 1.0) return 'var(--gradient-end)';
  return 'var(--error)';
}
