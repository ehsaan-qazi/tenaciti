import Link from 'next/link';
import { Eyebrow } from '../ui/Eyebrow';
import styles from './WhyTenaciti.module.css';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const CARDS = [
  {
    slot: 'a',
    icon: (
      <svg {...iconProps}>
        <path d="M9 11l3 3 8-8" />
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      </svg>
    ),
    statement: 'Nothing gets silently guessed.',
    desc: 'If your syllabus doesn’t state a deadline or grade weight, Tenaciti flags it as a placeholder for you to confirm — your roadmap is never built on AI guesswork.',
    href: '/features/ai-roadmap',
    link: 'How extraction works',
  },
  {
    slot: 'b',
    icon: (
      <svg {...iconProps}>
        <path d="M12 20a8 8 0 1 1 8-8" />
        <path d="M12 12l4-4" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
    statement: 'Finished ≠ understood.',
    desc: 'A 1–5 confidence rating on every topic shows what you actually know — not just what you’ve opened — so weak spots surface weeks before the exam.',
    href: '/features/topic-tracking',
    link: 'See confidence tracking',
  },
  {
    slot: 'c',
    icon: (
      <svg {...iconProps}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    statement: 'Notes that remember each other.',
    desc: '[[Wikilinks]] turn scattered lecture notes into a living map of your semester — hover any idea and see everything it connects to.',
    href: '/features/knowledge-graph',
    link: 'Explore the graph',
  },
  {
    slot: 'd',
    icon: (
      <svg {...iconProps}>
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    ),
    statement: 'Every semester gets sharper.',
    desc: 'Log how each assessment actually went and Tenaciti shows the gap between how ready you felt and how ready you were — so the next plan fits better.',
    href: '/features/self-assessment',
    link: 'See the self-assessment loop',
  },
];

function Card({ card }: { card: (typeof CARDS)[number] }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardIcon}>{card.icon}</span>
      <h3 className={styles.cardStatement}>{card.statement}</h3>
      <p className={styles.cardDesc}>{card.desc}</p>
      <Link href={card.href} className={styles.cardLink}>
        {card.link} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export function WhyTenaciti() {
  return (
    <section className={styles.section} aria-label="Why Tenaciti">
      <div className={styles.header}>
        <Eyebrow>Why Tenaciti</Eyebrow>
        <h2 className={styles.title}>Built for how students actually study</h2>
        <p className={styles.sub}>
          Most tools tell you what you&apos;ve opened. Tenaciti tells you what you actually know —
          and what to do about it.
        </p>
      </div>

      <div className={styles.stagger}>
        {/* Row 1: hatch — card — hatch — card */}
        <span className={`${styles.hatch} ${styles.h1}`} aria-hidden="true" />
        <Card card={CARDS[0]} />
        <span className={`${styles.hatch} ${styles.h2}`} aria-hidden="true" />
        <Card card={CARDS[1]} />

        {/* Row 2: card — hatch — card — hatch */}
        <Card card={CARDS[2]} />
        <span className={`${styles.hatch} ${styles.h3}`} aria-hidden="true" />
        <Card card={CARDS[3]} />
        <span className={`${styles.hatch} ${styles.h4}`} aria-hidden="true" />
      </div>

      <div className={styles.footerCta}>
        <Link href="/features" className={styles.exploreBtn}>
          Explore All Features <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
