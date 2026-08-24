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

const UNIVERSITIES = [
  'NUST',
  'LUMS',
  'FAST-NUCES',
  'COMSATS',
  'GIKI',
  'UET',
  'AIR University',
  'Bahria University',
  'IIUI',
  'IBA',
  'ITU',
  'NED University',
  'Aga Khan University',
  'QAU',
  'Habib University',
];

export default function Home() {
  return (
    <>
      {/* ---------- HERO SECTION ---------- */}
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
                Upload your syllabus and Tenaciti builds your semester roadmap automatically — every deadline, weight, and exam pulled straight from the PDF. Track what you actually understand, not just what you&apos;ve opened, and connect it all in a knowledge graph built for how you actually study.
              </p>

              <div className={styles.ctaRow}>
                <Link href="/features" className={`${styles.btn} ${styles.btnOutline}`}>
                  See Features
                </Link>
                <a href="https://my.tenaciti.app/signup" className={`${styles.btn} ${styles.btnFilled}`}>
                  Get Started Free
                </a>
              </div>
            </div>

            <div className={styles.heroRight}>
              <HeroDemo />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- UNIVERSITY MARQUEE ---------- */}
      <section className={styles.marqueeSection} aria-label="Universities supported">
        <div className={styles.marqueeHeader}>
          <span className={styles.marqueeEyebrow}>Trusted by students at</span>
        </div>
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {/* First sequence */}
            {UNIVERSITIES.map((uni, idx) => (
              <span key={`uni-1-${idx}`} className={styles.marqueeItem}>
                {uni}
                <span className={styles.marqueeDot} aria-hidden="true" />
              </span>
            ))}
            {/* Duplicate sequence for infinite continuous loop */}
            {UNIVERSITIES.map((uni, idx) => (
              <span key={`uni-2-${idx}`} className={styles.marqueeItem}>
                {uni}
                <span className={styles.marqueeDot} aria-hidden="true" />
              </span>
            ))}
          </div>
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
              <h3 className={styles.featureTitle}>Syllabus → Roadmap, Automatically</h3>
              <p className={styles.featureDesc}>
                Upload your PDF syllabus and Tenaciti extracts every assignment, quiz, exam, and project — with deadlines and grade weights — into a chronological roadmap you can confirm and edit in one pass. Missing a date or weight? It&apos;s flagged as a placeholder so nothing gets buried by an AI guess.
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
              <h3 className={styles.featureTitle}>Notes That Actually Connect</h3>
              <p className={styles.featureDesc}>
                Write in Markdown, link ideas with [[wikilinks]], and watch Tenaciti build a live, force-directed graph of how your courses relate — Obsidian-style, but built for a semester, not a vault. Hover a note to see everything it connects to; every course gets its own color.
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
              <h3 className={styles.featureTitle}>GPA Calculator Built for the HEC 4.0 Scale</h3>
              <p className={styles.featureDesc}>
                Calculate your SGPA and CGPA with the official HEC 4.0 grading scale used by Pakistani universities — or define your own custom scale and grade thresholds. Set a target GPA and see exactly what you need on remaining courses to hit it.
              </p>
            </div>
            <Link href="/tools/gpa-calculator" className={styles.featureLink}>
              Try Free Calculator <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- AI ASSISTANT SHOWCASE ---------- */}
      <section className={styles.aiSection} aria-label="AI Assistant Showcase">
        <div className={styles.aiCard}>
          <div className={styles.aiHeader}>
            <div className={styles.aiEyebrow}>
              <span className={styles.aiEyebrowDot} aria-hidden="true" />
              <span>AI Workspace Assistant</span>
            </div>
            <h2 className={styles.aiTitle}>Manage Your Entire Semester With a Prompt</h2>
            <p className={styles.aiSub}>
              The Tenaciti AI Assistant understands your courses, topics, progress, goals, deadlines, notes, and uploaded material — and it doesn&apos;t just answer questions, it acts. Ask it what to study next, tell it to update a goal, or have it build a study plan for finals, all in plain language.
            </p>
          </div>

          <div className={styles.promptGrid}>
            <div className={styles.promptCard}>
              <div className={styles.promptIcon}>🎯</div>
              <p className={styles.promptText}>
                &ldquo;What should I study next before my Thermodynamics midterm?&rdquo;
              </p>
              <span className={styles.promptTag}>Adaptive Recommendation</span>
            </div>

            <div className={styles.promptCard}>
              <div className={styles.promptIcon}>📝</div>
              <p className={styles.promptText}>
                &ldquo;Create a note linking mitosis and meiosis, and connect it to my Bio 201 roadmap.&rdquo;
              </p>
              <span className={styles.promptTag}>Knowledge Graph Action</span>
            </div>

            <div className={styles.promptCard}>
              <div className={styles.promptIcon}>📅</div>
              <p className={styles.promptText}>
                &ldquo;Mark my Chapter 4 topic as complete and build me a two-week study plan for finals.&rdquo;
              </p>
              <span className={styles.promptTag}>Schedule & Goal Automation</span>
            </div>
          </div>

          <div className={styles.aiActions}>
            <Link href="/features/ai-assistant" className={`${styles.btn} ${styles.btnOutline}`}>
              Explore AI Assistant Details →
            </Link>
            <a href="https://my.tenaciti.app/signup" className={`${styles.btn} ${styles.btnFilled}`}>
              Try AI Assistant Free
            </a>
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
