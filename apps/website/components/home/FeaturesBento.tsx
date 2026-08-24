import Link from 'next/link';
import { Eyebrow } from '../ui/Eyebrow';
import styles from './FeaturesBento.module.css';

/* ---------- Inline icons (stroke style matches the Hero) ---------- */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function LoopIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

/* ---------- CSS-built product visuals ---------- */

/** Extracted roadmap list: confirmed rows + one flagged placeholder row. */
function RoadmapVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.mockup}>
        <div className={styles.mockupBar}>
          <span className={styles.mockupFileIcon}>
            <svg {...iconProps} strokeWidth={2.2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </span>
          <span className={styles.mockupFileName}>CS-301-Syllabus.pdf</span>
          <span className={styles.mockupBadge}>Extracted</span>
        </div>
        <div className={styles.roadmapRow}>
          <span className={styles.rowDot} />
          <span className={styles.rowName}>Quiz 1 — Linear Systems</span>
          <span className={styles.rowDate}>Sep 12</span>
          <span className={styles.rowWeight}>5%</span>
        </div>
        <div className={styles.roadmapRow}>
          <span className={styles.rowDot} />
          <span className={styles.rowName}>Assignment 2</span>
          <span className={styles.rowDate}>Sep 26</span>
          <span className={styles.rowWeight}>10%</span>
        </div>
        <div className={`${styles.roadmapRow} ${styles.rowPlaceholder}`}>
          <span className={`${styles.rowDot} ${styles.rowDotHollow}`} />
          <span className={styles.rowName}>Midterm — date not stated</span>
          <span className={styles.rowFlag}>Confirm</span>
        </div>
      </div>
    </div>
  );
}

/** Mini force-graph: connected nodes with one highlighted hub. */
function GraphVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <svg className={styles.graphSvg} viewBox="0 0 260 190">
        <g className={styles.graphEdge}>
          <line x1="130" y1="95" x2="60" y2="45" />
          <line x1="130" y1="95" x2="205" y2="40" />
          <line x1="130" y1="95" x2="45" y2="140" />
          <line x1="130" y1="95" x2="200" y2="150" />
          <line x1="60" y1="45" x2="205" y2="40" />
          <line x1="45" y1="140" x2="130" y2="95" />
          <line x1="200" y1="150" x2="205" y2="40" />
        </g>
        <circle cx="60" cy="45" r="14" className={styles.graphNode} />
        <circle cx="205" cy="40" r="10" className={styles.graphNode} />
        <circle cx="45" cy="140" r="9" className={styles.graphNode} />
        <circle cx="200" cy="150" r="13" className={styles.graphNode} />
        <circle cx="130" cy="95" r="21" className={`${styles.graphNode} ${styles.graphHub}`}>
          <title>Bayes Theorem</title>
        </circle>
        <circle cx="238" cy="95" r="6" className={styles.graphNodeMuted} />
        <circle cx="95" cy="165" r="6" className={styles.graphNodeMuted} />
      </svg>
    </div>
  );
}

/** Confidence ratings: 1–5 segment meters per topic. */
function ConfidenceVisual() {
  const rows = [
    { name: 'Fourier Series', filled: 4 },
    { name: 'Convolution', filled: 5 },
    { name: 'Z-Transforms', filled: 2, weak: true },
  ];
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.confidenceList}>
        {rows.map((row) => (
          <div key={row.name} className={styles.confidenceRow}>
            <span className={styles.confidenceName}>
              {row.weak && <span className={styles.weakDot} />}
              {row.name}
            </span>
            <span className={styles.segments}>
              {[1, 2, 3, 4, 5].map((seg) => (
                <span
                  key={seg}
                  className={`${styles.segment} ${seg <= row.filled ? styles.segmentFilled : ''}`}
                />
              ))}
            </span>
          </div>
        ))}
        <div className={styles.confidenceCaption}>2/5 — flagged for review before the midterm</div>
      </div>
    </div>
  );
}

/** GPA stat card: big number + target gap. */
function GpaVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.gpaCard}>
        <div className={styles.gpaStat}>
          <span className={styles.gpaNumber}>3.67</span>
          <span className={styles.gpaLabel}>SGPA this semester</span>
        </div>
        <div className={styles.gpaRows}>
          <div className={styles.gpaRow}>
            <span>CGPA</span>
            <span className={styles.gpaRowValue}>3.42</span>
          </div>
          <div className={styles.gpaRow}>
            <span>Target</span>
            <span className={styles.gpaRowValue}>3.80</span>
          </div>
          <div className={styles.gpaTrack}>
            <span className={styles.gpaFill} />
            <span className={styles.gpaTarget} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Calibration chips: planned vs actual, felt vs got. */
function LoopVisual() {
  return (
    <div className={styles.loopVisual} aria-hidden="true">
      <span className={styles.chip}>
        Planned <strong>6h</strong>
      </span>
      <span className={styles.chipArrow}>→</span>
      <span className={styles.chip}>
        Actual <strong>9h</strong>
      </span>
      <span className={styles.chipDivider} />
      <span className={styles.chip}>
        Felt <strong>4/5</strong>
      </span>
      <span className={styles.chipArrow}>→</span>
      <span className={styles.chip}>
        Scored <strong>68%</strong>
      </span>
    </div>
  );
}

/* ---------- Section ---------- */

export function FeaturesBento() {
  return (
    <section className={styles.section} aria-label="Core Features">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Eyebrow>Core Capabilities</Eyebrow>
          <h2 className={styles.title}>Everything you need to excel in university</h2>
        </div>
        <p className={styles.headerSub}>
          One workspace that turns your syllabus into a plan, your notes into a map, and your
          confidence into a signal — so you always know what to do next.
        </p>
      </div>

      <div className={styles.bento}>
        <div className={`${styles.card} ${styles.span7}`}>
          <RoadmapVisual />
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>Syllabus → Roadmap, Automatically</h3>
            <p className={styles.cardDesc}>
              Upload a PDF syllabus and Tenaciti extracts every assignment, quiz, exam, and project
              — with deadlines and grade weights — into a roadmap you confirm in one pass.
              Anything the document doesn&apos;t clearly state is flagged, never guessed.
            </p>
            <Link href="/features/ai-roadmap" className={styles.cardLink}>
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={`${styles.card} ${styles.span5}`}>
          <GraphVisual />
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>Notes That Actually Connect</h3>
            <p className={styles.cardDesc}>
              Write in Markdown, link ideas with [[wikilinks]], and watch a live graph of how your
              courses relate build itself.
            </p>
            <Link href="/features/knowledge-graph" className={styles.cardLink}>
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={`${styles.card} ${styles.span5}`}>
          <ConfidenceVisual />
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>Confidence, Not Just Checkboxes</h3>
            <p className={styles.cardDesc}>
              Rate each topic 1–5 as you complete it, so weak spots surface weeks before the exam —
              not on it.
            </p>
            <Link href="/features/topic-tracking" className={styles.cardLink}>
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={`${styles.card} ${styles.span7}`}>
          <GpaVisual />
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>GPA Goals on the HEC 4.0 Scale</h3>
            <p className={styles.cardDesc}>
              Calculate SGPA and CGPA with the official HEC scale — or your own custom thresholds.
              Set a target and see exactly what you need on remaining courses to hit it.
            </p>
            <Link href="/tools/gpa-calculator" className={styles.cardLink}>
              Try the Free Calculator <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={`${styles.card} ${styles.span12} ${styles.loopCard}`}>
          <div className={styles.loopBody}>
            <span className={styles.loopIcon}>
              <LoopIcon />
            </span>
            <div>
              <h3 className={styles.cardTitle}>Close the Loop After Every Assessment</h3>
              <p className={styles.cardDesc}>
                Log how each exam actually went — hours spent, quality, mood — and Tenaciti shows
                the gap between how ready you felt and how ready you were, so every semester&apos;s
                plan gets sharper.
              </p>
            </div>
            <Link href="/features/self-assessment" className={styles.cardLink}>
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
          <LoopVisual />
        </div>
      </div>
    </section>
  );
}
