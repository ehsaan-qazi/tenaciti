/* =========================================================================
   @tenaciti/shared — Package Index
   Re-exports all shared business logic.
   ========================================================================= */

export {
  GRADE_SCALE,
  LETTER_GRADES,
  PERCENTAGE_THRESHOLDS,
  getMaxGPA,
  validateCustomScale,
  validateCustomThresholds,
} from './grade-scales.js';

export {
  percentageToLetter,
  calculateSGPA,
  calculateCGPA,
  gradeColor,
  clampGPA,
  clampCredits,
  clampScore,
  safeParseFloat,
} from './gpa-calculator.js';
