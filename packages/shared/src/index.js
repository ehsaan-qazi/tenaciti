/* =========================================================================
   @tenaciti/shared — Package Index
   Re-exports all shared business logic.
   ========================================================================= */

export {
  GRADE_SCALE,
  LETTER_GRADES,
  PERCENTAGE_THRESHOLDS,
} from './grade-scales.js';

export {
  percentageToLetter,
  calculateSGPA,
  calculateCGPA,
  gradeColor,
} from './gpa-calculator.js';
