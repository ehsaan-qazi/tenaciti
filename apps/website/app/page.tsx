import Link from 'next/link';
import type { Metadata } from 'next';
import HeroDemo from '../components/HeroDemo/HeroDemo';
import { FeaturesBento } from '../components/home/FeaturesBento';
import { HowItWorks } from '../components/home/HowItWorks';
import { AiShowcase } from '../components/home/AiShowcase';
import { WhyTenaciti } from '../components/home/WhyTenaciti';
import { CtaPanel } from '../components/ui/CtaPanel';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../lib/metadata';
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
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
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

      {/* ---------- FEATURES BENTO ---------- */}
      <FeaturesBento />

      {/* ---------- HOW IT WORKS ---------- */}
      <HowItWorks />

      {/* ---------- AI ASSISTANT SHOWCASE ---------- */}
      <AiShowcase />

      {/* ---------- WHY TENACITI ---------- */}
      <WhyTenaciti />

      {/* ---------- CLOSING CTA ---------- */}
      <CtaPanel
        title="Master your semester from day one."
        sub="Stop juggling disjointed syllabi, spreadsheets, and calendar reminders. One workspace turns your courses into a plan — and keeps it on track with you."
        primary={{ label: 'Start for Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Explore Features', href: '/features' }}
      />
    </>
  );
}
