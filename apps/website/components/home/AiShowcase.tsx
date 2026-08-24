import Link from 'next/link';
import { Eyebrow } from '../ui/Eyebrow';
import styles from './AiShowcase.module.css';

/* ---------- Orbit composition icons ---------- */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function SparkIcon() {
  return (
    <svg {...iconProps} strokeWidth={2.2}>
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" fill="currentColor" stroke="none" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RoadmapChipIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function GraphChipIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TopicsChipIcon() {
  return (
    <svg {...iconProps}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function GoalsChipIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CalendarChipIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SearchChipIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  );
}

const PROMPTS = [
  {
    icon: '🎯',
    text: '“What should I study next before my Thermodynamics midterm?”',
    tag: 'Adaptive Recommendation',
  },
  {
    icon: '📝',
    text: '“Create a note linking mitosis and meiosis, and connect it to my Bio 201 roadmap.”',
    tag: 'Knowledge Graph Action',
  },
  {
    icon: '📅',
    text: '“Mark my Chapter 4 topic as complete and build me a two-week study plan for finals.”',
    tag: 'Schedule & Goal Automation',
  },
];

export function AiShowcase() {
  return (
    <section className={styles.section} aria-label="AI Workspace Assistant">
      <div className={styles.panel}>
        <span className={styles.stat} aria-hidden="true">
          <span className={styles.statNumber}>6</span>
          <span className={styles.statLabel}>
            workspace surfaces it can
            <br />
            search, explain, and act on
          </span>
        </span>

        <div className={styles.grid}>
          {/* Orbit composition */}
          <div className={styles.orbitWrap} aria-hidden="true">
            <div className={styles.orbit}>
              <span className={`${styles.ring} ${styles.ringOuter}`} />
              <span className={`${styles.ring} ${styles.ringInner}`} />

              <span className={`${styles.orbitDot} ${styles.od1}`} />
              <span className={`${styles.orbitDot} ${styles.od2}`} />
              <span className={`${styles.orbitDot} ${styles.od3}`} />

              <div className={styles.centerNode}>
                <SparkIcon />
              </div>

              <span className={`${styles.chip} ${styles.c1}`}>
                <RoadmapChipIcon />
              </span>
              <span className={`${styles.chip} ${styles.c2}`}>
                <GraphChipIcon />
              </span>
              <span className={`${styles.chip} ${styles.c3}`}>
                <TopicsChipIcon />
              </span>
              <span className={`${styles.chip} ${styles.c4}`}>
                <GoalsChipIcon />
              </span>
              <span className={`${styles.chip} ${styles.c5}`}>
                <CalendarChipIcon />
              </span>
              <span className={`${styles.chip} ${styles.c6}`}>
                <SearchChipIcon />
              </span>
            </div>
          </div>

          {/* Copy */}
          <div className={styles.copy}>
            <Eyebrow variant="dark">AI Workspace Assistant</Eyebrow>
            <h2 className={styles.title}>Manage your entire semester with a prompt</h2>
            <p className={styles.sub}>
              The assistant understands your courses, topics, progress, goals, deadlines, notes,
              and uploaded material — and it doesn&apos;t just answer questions, it acts. Ask what
              to study next, tell it to update a goal, or have it build a finals plan, all in plain
              language.
            </p>
            <div className={styles.actions}>
              <a href="https://my.tenaciti.app/signup" className={`${styles.btn} ${styles.btnLight}`}>
                Try AI Assistant Free
              </a>
              <Link href="/features/ai-assistant" className={`${styles.btn} ${styles.btnOutlineLight}`}>
                Explore the Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Example prompts */}
        <div className={styles.promptGrid}>
          {PROMPTS.map((prompt) => (
            <div key={prompt.tag} className={styles.promptCard}>
              <span className={styles.promptIcon} aria-hidden="true">
                {prompt.icon}
              </span>
              <p className={styles.promptText}>{prompt.text}</p>
              <span className={styles.promptTag}>{prompt.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
