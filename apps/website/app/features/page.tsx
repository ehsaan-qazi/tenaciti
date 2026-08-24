import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '../../components/ui/PageHeader';
import { CtaPanel } from '../../components/ui/CtaPanel';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
  },
  description:
    'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
  alternates: {
    canonical: 'https://www.tenaciti.app/features',
  },
  openGraph: {
    title: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
    description:
      'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
    url: 'https://www.tenaciti.app/features',
  },
  twitter: {
    title: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
    description:
      'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
  },
};

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const FEATURES = [
  {
    href: '/features/ai-roadmap',
    title: 'AI Roadmap Extraction',
    desc: 'Upload a PDF syllabus. Get a full semester roadmap — assignments, quizzes, exams, projects — with deadlines and grade weights pulled out automatically.',
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/features/knowledge-graph',
    title: 'Knowledge Graph',
    desc: 'Link your notes with [[wikilinks]] and watch Tenaciti map how every idea, lecture, and course connects — visually, in real time.',
    icon: (
      <svg {...iconProps}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    href: '/features/topic-tracking',
    title: 'Topic Tracking & Confidence',
    desc: 'Break each course into topics, rate your confidence 1–5 as you complete them, and see exactly where your weak spots are before the exam does.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 20a8 8 0 1 1 8-8" />
        <path d="M12 12l4-4" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/features/gpa-calculator',
    title: 'GPA Calculator & Goals',
    desc: 'Calculate SGPA and CGPA on the HEC 4.0 scale (or your own custom scale), set a target GPA, and track progress course by course.',
    icon: (
      <svg {...iconProps}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/features/self-assessment',
    title: 'Self-Assessment & Calibration',
    desc: 'After every assignment, quiz, or exam, log how it actually went — quality, effort, hours spent — and see the gap between how confident you felt and how it went.',
    icon: (
      <svg {...iconProps}>
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    ),
  },
  {
    href: '/features/ai-assistant',
    title: 'AI Workspace Assistant',
    desc: 'Ask it what to study next, tell it to update a goal or mark a topic done, or have it build a study plan — an assistant that knows your courses and can act on them.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
        <path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="One workspace for your whole semester"
        sub="Everything you need to manage your courses and achieve your academic goals — from the first syllabus PDF to the last final exam."
      />

      <section className={styles.section} aria-label="Core Workspace Capabilities">
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <Link key={feature.href} href={feature.href} className={styles.card}>
              <span className={styles.cardIcon}>{feature.icon}</span>
              <h2 className={styles.cardTitle}>{feature.title}</h2>
              <p className={styles.cardDesc}>{feature.desc}</p>
              <span className={styles.cardLink}>
                Learn more <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaPanel
        title="Master your semester from day one."
        sub="Start free — upload your first syllabus and watch it become a plan in seconds."
        primary={{ label: 'Get Started Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Try the GPA Calculator', href: '/tools/gpa-calculator' }}
      />
    </>
  );
}
