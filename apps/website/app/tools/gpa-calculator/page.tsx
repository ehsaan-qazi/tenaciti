import { GPACalculator } from '../../../components/GPACalculator';
import type { Metadata } from 'next';

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
  },
  twitter: {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ink, #0d0d0d)', letterSpacing: '-0.02em' }}>
          Free GPA Calculator
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Quickly calculate your Semester GPA, Cumulative GPA, or project your final grade based on internal marks. Built for the HEC 4.0 scale with custom scheme support. No signup required.
        </p>
      </div>

      {/* Interactive Tool */}
      <GPACalculator />

      {/* SEO & AEO Informational Q&A Content */}
      <div style={{ maxWidth: '860px', margin: '6rem auto 0' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center', color: 'var(--ink, #0d0d0d)' }}>
          Understanding GPA Calculations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <section style={{ background: 'var(--surface-sunken, #f8f9fa)', padding: '2rem 2.5rem', borderRadius: '16px', border: '1px solid var(--surface-border, #eee)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ink, #0d0d0d)' }}>
              How is CGPA calculated?
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #555)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '1rem' }}>
              Your Cumulative GPA (CGPA) is the credit-weighted average of every grade point you&apos;ve earned across all completed semesters. Multiply each course&apos;s grade point (on your scale — 4.0 under HEC) by its credit hours, sum those, and divide by your total credit hours.
            </p>
            <div style={{ background: 'var(--white, #fff)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--surface-border, #e0e0e0)', fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--ink, #0d0d0d)' }}>
              CGPA = Total Quality Points (Σ Grade Point × Credit Hours) ÷ Total Credit Hours
            </div>
          </section>

          <section style={{ background: 'var(--surface-sunken, #f8f9fa)', padding: '2rem 2.5rem', borderRadius: '16px', border: '1px solid var(--surface-border, #eee)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ink, #0d0d0d)' }}>
              What&apos;s the difference between SGPA and CGPA?
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #555)', lineHeight: 1.7, fontSize: '1.05rem' }}>
              <strong>SGPA (Semester GPA)</strong> is your credit-weighted average for a single semester term. <strong>CGPA (Cumulative GPA)</strong> is the same calculation across every semester you&apos;ve completed so far. A strong SGPA this semester will pull up your CGPA, though the impact depends on how many credit hours you have already completed. Tenaciti&apos;s calculator has dedicated tabs for both calculations.
            </p>
          </section>

          <section style={{ background: 'var(--surface-sunken, #f8f9fa)', padding: '2rem 2.5rem', borderRadius: '16px', border: '1px solid var(--surface-border, #eee)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ink, #0d0d0d)' }}>
              Does this calculator support the official HEC grading scale?
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #555)', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Yes — the calculator defaults to Pakistan&apos;s Higher Education Commission (HEC) 4.0 grading scale. If your university uses a different scale (4.3, 4.33, or custom thresholds), you can switch to the <em>Custom Scale</em> tab and define your own percentage thresholds.
            </p>
          </section>
        </div>
      </div>

      {/* Save Grades Call to Action */}
      <div style={{ marginTop: '5rem', padding: '3.5rem 2rem', background: 'var(--ink, #0d0d0d)', color: 'white', borderRadius: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
          Want to save your GPA and track semester goals?
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--grey-300, #b9b9b7)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Create a free Tenaciti account to save your course records permanently, simulate target grades, and link courses directly to your syllabus roadmap.
        </p>
        <a
          href="https://my.tenaciti.app/signup"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: 'var(--white, #ffffff)',
            color: 'var(--ink, #0d0d0d)',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '1.125rem',
            textDecoration: 'none',
          }}
        >
          Create Free Account
        </a>
      </div>

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
    </div>
  );
}
