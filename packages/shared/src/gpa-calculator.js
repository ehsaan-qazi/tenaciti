/* =========================================================================
   GPA Calculator — Shared Business Logic
   
   Pure calculation functions with no UI dependencies.
   Used by both the authenticated GPA page and the public GPA calculator.
   ========================================================================= */

import { GRADE_SCALE, PERCENTAGE_THRESHOLDS } from './grade-scales.js';

/**
 * Converts a numeric percentage to its corresponding letter grade.
 * Uses the given thresholds or defaults to HEC 4.0. Percentage is rounded before lookup.
 * 
 * @param {number} pct - The percentage score (0-100)
 * @param {Array<[number, string]>} [thresholds] - Custom thresholds (optional)
 * @returns {string} The letter grade (e.g., 'A', 'B+', 'F')
 */
export function percentageToLetter(pct, thresholds = PERCENTAGE_THRESHOLDS) {
  const rounded = Math.round(pct);
  for (const [min, letter] of thresholds) {
    if (rounded >= min) return letter;
  }
  return 'F';
}

/**
 * Calculates SGPA from an array of course entries.
 * 
 * @param {Array<{creditHours: number, grade: string}>} courses - Course entries with credits and letter grades
 * @param {Record<string, number>} [scale] - Custom grade scale (optional, defaults to HEC 4.0)
 * @returns {{ sgpa: number, totalCredits: number, totalQualityPoints: number, validCourses: number }}
 */
export function calculateSGPA(courses, scale = GRADE_SCALE) {
  const validCourses = courses.filter(
    c => c.grade && scale[c.grade] !== undefined && c.creditHours > 0
  );
  const totalCredits = validCourses.reduce((sum, c) => sum + c.creditHours, 0);
  const totalQualityPoints = validCourses.reduce(
    (sum, c) => sum + c.creditHours * scale[c.grade], 0
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
 * @param {Record<string, number>} [scale] - Custom grade scale (optional)
 * @returns {string} CSS variable reference (e.g., 'var(--success)')
 */
export function gradeColor(letter, scale = GRADE_SCALE) {
  const maxGPA = Math.max(...Object.values(scale));
  const pts = scale[letter] ?? 0;
  // Normalize to 0–1 range for color mapping
  const ratio = maxGPA > 0 ? pts / maxGPA : 0;
  if (ratio >= 0.925) return 'var(--success)';
  if (ratio >= 0.75) return 'var(--primary)';
  if (ratio >= 0.5) return 'var(--gradient-end)';
  if (ratio >= 0.25) return 'var(--gradient-end)';
  return 'var(--error)';
}

// ---------------------------------------------------------------------------
// Input clamping utilities
// ---------------------------------------------------------------------------

/**
 * Clamp a GPA value to [0, maxGPA]. Returns 0 for NaN.
 * @param {string|number} value
 * @param {number} maxGPA
 * @returns {number}
 */
export function clampGPA(value, maxGPA = 4.0) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, 0), maxGPA);
}

/**
 * Clamp a credit hours value to [min, max]. Returns min for NaN.
 * @param {string|number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampCredits(value, min = 0.5, max = 30) {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
}

/**
 * Clamp a score to [0, max]. Returns 0 for NaN.
 * @param {string|number} value
 * @param {number} max
 * @returns {number}
 */
export function clampScore(value, max) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, 0), max);
}

/**
 * Safe parseFloat that returns a fallback for NaN.
 * @param {string|number} value
 * @param {number} fallback
 * @returns {number}
 */
export function safeParseFloat(value, fallback = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
}
