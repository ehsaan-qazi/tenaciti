import { Eyebrow } from '../ui/Eyebrow';
import styles from './HowItWorks.module.css';

const STEPS = [
  {
    title: 'Upload your syllabus',
    desc: 'Drop in the course PDF. Files are stored securely and deduplicated, so a re-upload never creates duplicates.',
  },
  {
    title: 'AI maps your semester',
    desc: 'Every assignment, quiz, exam, and project is pulled out with its deadline and grade weight — in reading order.',
  },
  {
    title: 'Confirm in one pass',
    desc: 'Review the extracted roadmap and fix anything in a single screen. Missing dates are flagged as placeholders, never invented.',
  },
  {
    title: 'Study with signal',
    desc: 'Track topic confidence, link your notes, and let the assistant point you at the next highest-value hour of study.',
  },
];

export function HowItWorks() {
  return (
    <section className={styles.band} aria-label="How Tenaciti works">
      <div className={styles.inner}>
        <div className={styles.header}>
          <Eyebrow>How It Works</Eyebrow>
          <h2 className={styles.title}>From syllabus PDF to study plan in four steps</h2>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, idx) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {idx + 1}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
