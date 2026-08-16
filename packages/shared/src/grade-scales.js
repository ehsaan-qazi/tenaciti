/* =========================================================================
   HEC 4.0 Grading Scale (COMSATS Standard — Fall 2021+)
   
   This is the single source of truth for grade scale constants.
   Used by both the authenticated app and the public GPA calculator tool.
   ========================================================================= */

/**
 * Default grade scale — maps letter grades to their GPA point values on HEC 4.0.
 */
export const GRADE_SCALE = {
  'A':  4.00, 'A-': 3.70,
  'B+': 3.30, 'B':  3.00, 'B-': 2.70,
  'C+': 2.30, 'C':  2.00, 'C-': 1.70,
  'D':  1.00, 'F':  0.00,
};

/**
 * Ordered array of all letter grades from highest to lowest.
 */
export const LETTER_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

/**
 * Default percentage thresholds for converting numeric scores to letter grades.
 * Each entry is [minimumPercentage, letterGrade].
 * The percentage is rounded before lookup.
 */
export const PERCENTAGE_THRESHOLDS = [
  [85, 'A'], [80, 'A-'], [75, 'B+'], [70, 'B'], [65, 'B-'],
  [61, 'C+'], [58, 'C'], [55, 'C-'], [50, 'D'], [0, 'F'],
];

// ---------------------------------------------------------------------------
// Custom Scale Utilities
// ---------------------------------------------------------------------------

/**
 * Returns the maximum GPA point value in a scale.
 * @param {Record<string, number>} scale
 * @returns {number}
 */
export function getMaxGPA(scale = GRADE_SCALE) {
  return Math.max(...Object.values(scale));
}

/**
 * Validates a custom grade scale.
 * Rules:
 *   - All LETTER_GRADES must be present
 *   - Values must be numbers in [0, 10]
 *   - Values must be monotonically non-increasing (A >= A- >= B+ >= ... >= F)
 *   - F must be 0
 *
 * @param {Record<string, number>} scale
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCustomScale(scale) {
  const errors = [];

  for (const grade of LETTER_GRADES) {
    if (scale[grade] === undefined || scale[grade] === null) {
      errors.push(`Missing grade: ${grade}`);
      continue;
    }
    const val = Number(scale[grade]);
    if (isNaN(val)) {
      errors.push(`${grade} must be a number`);
    } else if (val < 0 || val > 10) {
      errors.push(`${grade} must be between 0 and 10`);
    }
  }

  // Check monotonicity
  if (errors.length === 0) {
    for (let i = 0; i < LETTER_GRADES.length - 1; i++) {
      const higher = LETTER_GRADES[i];
      const lower = LETTER_GRADES[i + 1];
      if (Number(scale[higher]) < Number(scale[lower])) {
        errors.push(`${higher} (${scale[higher]}) must be ≥ ${lower} (${scale[lower]})`);
      }
    }
  }

  // F must be 0
  if (scale['F'] !== undefined && Number(scale['F']) !== 0) {
    errors.push('F must be 0.00');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates custom percentage thresholds.
 * Rules:
 *   - Must have same length as LETTER_GRADES
 *   - Each threshold must be [number, string]
 *   - Thresholds must be monotonically decreasing
 *   - Values must be in [0, 100]
 *
 * @param {Array<[number, string]>} thresholds
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCustomThresholds(thresholds) {
  const errors = [];

  if (!Array.isArray(thresholds) || thresholds.length !== LETTER_GRADES.length) {
    errors.push(`Must have exactly ${LETTER_GRADES.length} thresholds`);
    return { valid: false, errors };
  }

  for (let i = 0; i < thresholds.length; i++) {
    const [min] = thresholds[i];
    if (typeof min !== 'number' || isNaN(min) || min < 0 || min > 100) {
      errors.push(`Threshold ${i + 1}: percentage must be between 0 and 100`);
    }
  }

  // Check monotonicity
  if (errors.length === 0) {
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (thresholds[i][0] <= thresholds[i + 1][0]) {
        errors.push(`${thresholds[i][1]} threshold (${thresholds[i][0]}%) must be > ${thresholds[i + 1][1]} threshold (${thresholds[i + 1][0]}%)`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
