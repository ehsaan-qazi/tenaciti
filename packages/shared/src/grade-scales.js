/* =========================================================================
   HEC 4.0 Grading Scale (COMSATS Standard — Fall 2021+)
   
   This is the single source of truth for grade scale constants.
   Used by both the authenticated app and the public GPA calculator tool.
   ========================================================================= */

/**
 * Maps letter grades to their GPA point values on the HEC 4.0 scale.
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
 * Percentage thresholds for converting numeric scores to letter grades.
 * Each entry is [minimumPercentage, letterGrade].
 * The percentage is rounded before lookup.
 */
export const PERCENTAGE_THRESHOLDS = [
  [85, 'A'], [80, 'A-'], [75, 'B+'], [70, 'B'], [65, 'B-'],
  [61, 'C+'], [58, 'C'], [55, 'C-'], [50, 'D'], [0, 'F'],
];
