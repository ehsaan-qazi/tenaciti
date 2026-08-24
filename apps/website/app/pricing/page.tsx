import type { Metadata } from 'next';
import { PageHeader } from '../../components/ui/PageHeader';
import { CtaPanel } from '../../components/ui/CtaPanel';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Free plan covers core syllabus extraction and GPA tracking, no credit card required. See what\'s included in Premium.',
  alternates: {
    canonical: 'https://www.tenaciti.app/pricing',
  },
  openGraph: {
    title: 'Pricing | Tenaciti',
    description:
      'Free plan covers core syllabus extraction and GPA tracking, no credit card required. See what\'s included in Premium.',
    url: 'https://www.tenaciti.app/pricing',
  },
  twitter: {
    title: 'Pricing | Tenaciti',
    description:
      'Free plan covers core syllabus extraction and GPA tracking, no credit card required. See what\'s included in Premium.',
  },
};

const FREE_FEATURES = [
  { text: '3 document uploads per course / month', strong: '3 document uploads' },
  { text: '10 MB max file size', strong: '10 MB' },
  { text: 'AI Syllabus-to-roadmap extraction (PDF)' },
  { text: 'Topic tracking with 1–5 confidence ratings' },
  { text: 'Knowledge graph with Markdown & [[wikilinks]]' },
  { text: 'Free HEC 4.0 & custom GPA calculator' },
];

const PREMIUM_FEATURES = [
  { text: '20 document uploads per course / month', strong: '20 document uploads' },
  { text: '25 MB max file size', strong: '25 MB' },
  { text: 'Slide & lecture note extraction (PDF & PPTX)' },
  { text: 'Full AI workspace assistant capabilities' },
  { text: 'Priority extraction queue' },
  { text: 'Priority support' },
];

const COMPARISON_ROWS: Array<{ feature: string; free: string; premium: string; muted?: boolean }> = [
  { feature: 'Uploads per course / month', free: '3 uploads', premium: '20 uploads' },
  { feature: 'Maximum file size', free: '10 MB', premium: '25 MB' },
  { feature: 'Syllabus-to-Roadmap Extraction', free: 'PDF', premium: 'PDF' },
  { feature: 'Slide & Lecture Notes Extraction', free: '—', premium: 'PDF & PPTX', muted: true },
  { feature: 'Knowledge Graph & Markdown', free: 'Included', premium: 'Included' },
  { feature: 'GPA Calculator (HEC 4.0 & Custom)', free: 'Included', premium: 'Included' },
];

export default function PricingPage() {
  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tenaciti',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description:
      'AI-powered study workspace for university students: syllabus extraction, knowledge graph notes, GPA tracking, and an AI assistant that manages your workspace by prompt.',
    featureList: [
      'AI syllabus-to-roadmap extraction',
      'Markdown knowledge graph with wikilinks',
      'Topic confidence tracking',
      'HEC 4.0 and custom-scale GPA calculator',
      'AI assistant: natural-language search, recommendations, and workspace actions (create notes, update goals, complete topics, link content, build study plans)',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description:
          '3 document uploads per course/month, 10 MB max file size, syllabus extraction (PDF), GPA calculator, core knowledge graph.',
      },
      // TODO: Add Premium offer once price is finalized
    ],
  };

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Start free. Upgrade when you need more."
        sub="The free plan is free forever — no credit card required. Upgrade to Premium when you need higher upload capacities and slide extraction."
      />

      <div className={styles.wrap}>
        <div className={styles.plans}>
          {/* Free Plan — the actionable plan, featured in ink */}
          <div className={`${styles.plan} ${styles.planFree}`}>
            <span className={`${styles.planBadge} ${styles.badgeLight}`}>Free Forever</span>
            <h2 className={styles.planName}>Free</h2>
            <div className={styles.planPrice}>$0</div>
            <p className={styles.planDesc}>
              Everything you need to organize your courses and track your semester.
            </p>
            <ul className={styles.planList}>
              {FREE_FEATURES.map((item) => (
                <li key={item.text} className={styles.planItem}>
                  <span className={styles.planCheck} aria-hidden="true">✓</span>
                  <span>{item.strong ? <><strong>{item.strong}</strong>{item.text.replace(item.strong, '')}</> : item.text}</span>
                </li>
              ))}
            </ul>
            <a href="https://my.tenaciti.app/signup" className={`${styles.planBtn} ${styles.planBtnLight}`}>
              Get Started Free
            </a>
          </div>

          {/* Premium Plan */}
          <div className={`${styles.plan} ${styles.planPremium}`}>
            <span className={`${styles.planBadge} ${styles.badgeDark}`}>Power Users</span>
            <h2 className={styles.planName}>Premium</h2>
            <div className={styles.planPrice}>TBD</div>
            <p className={styles.planPriceNote}>Price not finalized — early users lock in founding rates.</p>
            <p className={styles.planDesc}>
              Expanded capacity for students managing heavy coursework and slide decks.
            </p>
            <ul className={styles.planList}>
              {PREMIUM_FEATURES.map((item) => (
                <li key={item.text} className={styles.planItem}>
                  <span className={styles.planCheck} aria-hidden="true">✓</span>
                  <span>{item.strong ? <><strong>{item.strong}</strong>{item.text.replace(item.strong, '')}</> : item.text}</span>
                </li>
              ))}
            </ul>
            <div className={`${styles.planBtn} ${styles.planBtnGhost}`}>Coming Soon</div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section className={styles.compare} aria-label="Detailed Plan Comparison">
          <h2 className={styles.compareTitle}>Detailed Plan Comparison</h2>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col" style={{ width: '28%' }}>Free</th>
                  <th scope="col" style={{ width: '28%' }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td className={row.muted ? styles.tableMuted : styles.tableValue}>{row.free}</td>
                    <td className={styles.tableValue}>{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <CtaPanel
        title="Try every core feature for $0."
        sub="Create a free account, upload your first syllabus, and see your semester take shape in minutes."
        primary={{ label: 'Get Started Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Read the FAQ', href: '/faq' }}
      />

      {/* SoftwareApplication structured data for Google pricing rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppJsonLd),
        }}
      />
    </>
  );
}
