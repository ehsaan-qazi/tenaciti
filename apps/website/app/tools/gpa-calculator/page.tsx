import type { Metadata } from 'next';
import { GPACalculator } from '../../../components/GPACalculator';
import { PageHeader } from '../../../components/ui/PageHeader';
import { CtaPanel } from '../../../components/ui/CtaPanel';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../../../lib/metadata';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Free College & University GPA Calculator',
  description:
    'Calculate your SGPA, CGPA, and internal marks easily with our free tool for university students. Supports HEC 4.0 scale and custom grading schemes.',
  alternates: {
    canonical: 'https://www.tenaciti.app/tools/gpa-calculator',
  },
  openGraph: {
    title: 'Free College & University GPA Calculator | Tenaciti',
    description:
      'Calculate your SGPA, CGPA, and internal marks easily with our free tool for university students. Supports HEC 4.0 scale and custom grading schemes.',
    url: 'https://www.tenaciti.app/tools/gpa-calculator',
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title: 'Free College & University GPA Calculator | Tenaciti',
    description:
      'Calculate your SGPA, CGPA, and internal marks easily with our free tool for university students. Supports HEC 4.0 scale and custom grading schemes.',
  },
};

const calculatorFaqs = [
  {
    question: 'How is CGPA calculated?',
    answer:
      'Your Cumulative GPA (CGPA) is the credit-weighted average of every grade point earned across all completed semesters. Multiply each course grade point (e.g. 4.0 for an A under HEC) by its credit hours, sum those products, and divide by your total cumulative credit hours. Tenaciti calculates this automatically for HEC and custom scales.',
  },
  {
    question: "What's the difference between SGPA and CGPA?",
    answer:
      'SGPA (Semester GPA) calculates your credit-weighted grade average for a single semester. CGPA (Cumulative GPA) is the combined average across every semester you have completed so far. A strong SGPA in a later semester will pull up your CGPA, though more gradually as total credit hours accumulate.',
  },
  {
    question: 'Does this calculator use the official HEC grading scale?',
    answer:
      'Yes — the calculator defaults to Pakistan Higher Education Commission (HEC) official 4.0 grading scale used across universities like NUST, FAST, LUMS, and COMSATS. You can also define custom grade points and percentage thresholds for non-HEC university scales.',
  },
];

export default function GPACalculatorPage() {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tenaciti GPA Calculator',
    url: 'https://www.tenaciti.app/tools/gpa-calculator',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description:
      'Free GPA calculator for university students. Calculate SGPA and CGPA on the HEC 4.0 grading scale or your own custom scale. No signup required.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: calculatorFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <PageHeader
        eyebrow="Free Tool"
        title="Free GPA Calculator"
        sub="Quickly calculate your Semester GPA, Cumulative GPA, or project your final grade based on internal marks. Built for the HEC 4.0 scale with custom scheme support. No signup required."
      />

      <div className={styles.wrap}>
        {/* Interactive Tool */}
        <GPACalculator />

        {/* SEO & AEO Informational Q&A Content */}
        <section className={styles.qa} aria-label="Understanding GPA calculations">
          <h2 className={styles.qaTitle}>Understanding GPA Calculations</h2>

          <div className={styles.qaList}>
            <section className={styles.qaCard}>
              <h3 className={styles.qaQuestion}>How is CGPA calculated?</h3>
              <p className={styles.qaAnswer}>
                Your Cumulative GPA (CGPA) is the credit-weighted average of every grade point
                you&apos;ve earned across all completed semesters. Multiply each course&apos;s grade
                point (on your scale — 4.0 under HEC) by its credit hours, sum those, and divide by
                your total credit hours.
              </p>
              <div className={styles.formula}>
                CGPA = Total Quality Points (Σ Grade Point × Credit Hours) ÷ Total Credit Hours
              </div>
            </section>

            <section className={styles.qaCard}>
              <h3 className={styles.qaQuestion}>What&apos;s the difference between SGPA and CGPA?</h3>
              <p className={styles.qaAnswer}>
                <strong>SGPA (Semester GPA)</strong> is your credit-weighted average for a single
                semester term. <strong>CGPA (Cumulative GPA)</strong> is the same calculation across
                every semester you&apos;ve completed so far. A strong SGPA this semester will pull up
                your CGPA, though the impact depends on how many credit hours you have already
                completed. Tenaciti&apos;s calculator has dedicated tabs for both calculations.
              </p>
            </section>

            <section className={styles.qaCard}>
              <h3 className={styles.qaQuestion}>
                Does this calculator support the official HEC grading scale?
              </h3>
              <p className={styles.qaAnswer}>
                Yes — the calculator defaults to Pakistan&apos;s Higher Education Commission (HEC)
                4.0 grading scale. If your university uses a different scale (4.3, 4.33, or custom
                thresholds), you can switch to the <em>Custom Scale</em> tab and define your own
                percentage thresholds.
              </p>
            </section>
          </div>
        </section>
      </div>

      <CtaPanel
        title="Want to save your GPA and track semester goals?"
        sub="Create a free Tenaciti account to save your course records permanently, simulate target grades, and link courses directly to your syllabus roadmap."
        primary={{ label: 'Create Free Account', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'See GPA Goal Tracking', href: '/features/gpa-calculator' }}
      />

      {/* WebApplication and FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
    </>
  );
}
