import Link from 'next/link';
import type { Metadata } from 'next';
import HeroDemo from '../components/HeroDemo/HeroDemo';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Tenaciti | AI Study Workspace for University Students',
  },
  description:
    'Turn any PDF syllabus into a study roadmap, track topic confidence, connect notes in a knowledge graph, and calculate your GPA — free to start.',
  alternates: {
    canonical: 'https://www.tenaciti.app',
  },
  openGraph: {
    title: 'Tenaciti | AI Study Workspace for University Students',
    description:
      'Turn any PDF syllabus into a study roadmap, track topic confidence, connect notes in a knowledge graph, and calculate your GPA — free to start.',
    url: 'https://www.tenaciti.app',
  },
  twitter: {
    title: 'Tenaciti | AI Study Workspace for University Students',
    description:
      'Turn any PDF syllabus into a study roadmap, track topic confidence, connect notes in a knowledge graph, and calculate your GPA — free to start.',
  },
};

export default function Home() {
  return (
    <>
      {/* ---------- HERO SECTION (Matches sample.html) ---------- */}
      <div className={styles.heroShell}>
        <div className={styles.heroPanel}>
          <div className={styles.squares} aria-hidden="true">
            <div className={`${styles.sq} ${styles.sq1}`}></div>
            <div className={`${styles.sq} ${styles.sq2}`}></div>
            <div className={`${styles.sq} ${styles.sq3}`}></div>
            <div className={`${styles.sq} ${styles.sq4}`}></div>
            <div className={`${styles.sq} ${styles.sq5}`}></div>
            <div className={`${styles.sq} ${styles.sq6}`}></div>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div className={styles.eyebrow}>
                <span className={styles.dot}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" />
                  </svg>
                </span>
                <span>AI Assistant</span>
              </div>

              <h1 className={styles.heading}>
                Your Semester,
                <br />
                Managed.
                <span className={styles.chain} aria-hidden="true">
                  <span className={`${styles.node} ${styles.n1}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4.5C4 3.7 4.7 3 5.5 3H12v18H5.5c-.8 0-1.5-.7-1.5-1.5v-15z" fill="white" />
                      <path d="M20 4.5c0-.8-.7-1.5-1.5-1.5H12v18h6.5c.8 0 1.5-.7 1.5-1.5v-15z" fill="white" opacity="0.55" />
                    </svg>
                  </span>
                  <span className={styles.link}></span>
                  <span className={`${styles.node} ${styles.n2}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20V12M12 20V4M20 20v-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className={styles.link}></span>
                  <span className={`${styles.node} ${styles.n3}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" />
                      <circle cx="12" cy="12" r="1" fill="white" />
                    </svg>
                  </span>
                </span>
              </h1>

              <p className={styles.sub}>
                AI personal assistant that understands your academic workspace, connects your courses, syllabus, notes, goals, assessments, and study material, and manages what needs to get done.
              </p>

              <div className={styles.ctaRow}>
                <Link href="/features" className={`${styles.btn} ${styles.btnOutline}`}>
                  See Features
                </Link>
                <a href="https://my.tenaciti.app/signup" className={`${styles.btn} ${styles.btnFilled}`}>
                  Get Started
                </a>
              </div>

              <div className={styles.rating}>
                <span className={styles.star}>★</span>
                <div className={styles.ratingText}>
                  <span className={styles.score}>4.8</span>
                </div>
                <span className={styles.ratingSub}>from 500+ reviews</span>
              </div>
            </div>

            <div className={styles.heroRight}>
              <HeroDemo />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- SOCIAL PROOF / STATS ---------- */}
      <section className={styles.statsSection} aria-label="Key Statistics">
        <div className={styles.statItem}>
          <span className={styles.statValue}>10,000+</span>
          <span className={styles.statLabel}>Deadlines automatically tracked & scheduled</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>4.8 / 5.0</span>
          <span className={styles.statLabel}>Average rating from university students</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>94%</span>
          <span className={styles.statLabel}>Students reporting reduced exam stress</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>3.8+</span>
          <span className={styles.statLabel}>Average target GPA achieved with Tenaciti</span>
        </div>
      </section>

      {/* ---------- FEATURES HIGHLIGHT ---------- */}
      <section className={styles.featuresSection} aria-label="Core Features">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Core Capabilities</span>
          <h2 className={styles.sectionTitle}>Everything you need to excel in university</h2>
          <p className={styles.sectionSub}>
            One unified workspace that organizes your courses, connects your study materials, and drives you toward academic success.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>AI Syllabus Extraction</h3>
              <p className={styles.featureDesc}>
                Upload any PDF or DOCX syllabus. Tenaciti parses dates, grading weights, reading assignments, and delivers an instant chronological study plan.
              </p>
            </div>
            <Link href="/features/ai-roadmap" className={styles.featureLink}>
              Learn more <span>→</span>
            </Link>
          </div>

          <div className={styles.featureCard}>
            <div>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Knowledge Graph</h3>
              <p className={styles.featureDesc}>
                Visualize relationships between lectures, notes, and exam topics. Connect interrelated concepts across disciplines with bi-directional references.
              </p>
            </div>
            <Link href="/features/knowledge-graph" className={styles.featureLink}>
              Learn more <span>→</span>
            </Link>
          </div>

          <div className={styles.featureCard}>
            <div>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>GPA Calculator & Forecasting</h3>
              <p className={styles.featureDesc}>
                Set semester grade targets, calculate your current GPA standing with custom grading scales, and simulate what-if scenarios before finals.
              </p>
            </div>
            <Link href="/tools/gpa-calculator" className={styles.featureLink}>
              Try Free Calculator <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className={styles.bannerSection} aria-label="Call to Action">
        <div className={styles.bannerCard}>
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>Master your semester from day one.</h2>
            <p className={styles.bannerSub}>
              Stop juggling disjointed syllabi, spreadsheets, and calendar reminders. Experience a unified AI study workspace designed for ambitious students.
            </p>
          </div>
          <div className={styles.bannerActions}>
            <a href="https://my.tenaciti.app/signup" className={styles.bannerBtnLight}>
              Start for Free
            </a>
            <Link href="/features" className={styles.bannerBtnOutline}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
