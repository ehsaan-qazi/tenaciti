import type { Metadata } from 'next';

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ink, #0d0d0d)', letterSpacing: '-0.02em' }}>
          Pricing
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Start for free forever. Upgrade to Premium when you need higher upload capacities and slide extraction.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        {/* Free Plan */}
        <div style={{ border: '1px solid var(--surface-border, #e0e0e0)', borderRadius: '16px', padding: '2.5rem', display: 'flex', flexDirection: 'column', background: 'var(--surface-default, #fff)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink, #0d0d0d)' }}>Free Forever</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink, #0d0d0d)' }}>$0</div>
          <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Everything you need to organize your courses and track your semester.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, color: 'var(--ink, #0d0d0d)', fontSize: '0.95rem' }}>
            <li>✓ <strong>3 Document uploads</strong> per course / month</li>
            <li>✓ <strong>10 MB</strong> max file size</li>
            <li>✓ AI Syllabus-to-roadmap extraction (PDF)</li>
            <li>✓ Topic tracking with 1–5 confidence ratings</li>
            <li>✓ Knowledge graph with Markdown & [[wikilinks]]</li>
            <li>✓ Free HEC 4.0 & custom GPA calculator</li>
          </ul>
          <a href="https://my.tenaciti.app/signup" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--ink, #0d0d0d)', color: 'white', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>
            Get Started Free
          </a>
        </div>

        {/* Premium Plan */}
        <div style={{ border: '2px solid var(--primary, #007bff)', borderRadius: '16px', padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--surface-default, #fff)', boxShadow: '0 8px 24px rgba(0,123,255,0.08)' }}>
          <div style={{ position: 'absolute', top: '-0.85rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary, #007bff)', color: 'white', padding: '0.25rem 1.25rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            POWER USERS
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink, #0d0d0d)' }}>Premium</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--ink, #0d0d0d)' }}>TBD</div>
          <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Expanded capacity for students managing heavy coursework and slide decks.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, color: 'var(--ink, #0d0d0d)', fontSize: '0.95rem' }}>
            <li>✓ <strong>20 Document uploads</strong> per course / month</li>
            <li>✓ <strong>25 MB</strong> max file size</li>
            <li>✓ Slide & lecture note extraction (PDF & PPTX)</li>
            <li>✓ Full AI workspace assistant capabilities</li>
            <li>✓ Priority extraction queue</li>
            <li>✓ Priority support</li>
          </ul>
          <div style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--surface-sunken, #f0f0ed)', color: 'var(--on-surface-variant, #666)', borderRadius: '999px', fontWeight: 700 }}>
            Coming Soon
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <section style={{ maxWidth: '840px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--ink, #0d0d0d)' }}>
          Detailed Plan Comparison
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border, #eee)' }}>
                <th style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'var(--ink, #0d0d0d)' }}>Feature</th>
                <th style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'var(--ink, #0d0d0d)', width: '30%' }}>Free</th>
                <th style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'var(--ink, #0d0d0d)', width: '30%' }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>Uploads per course / month</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>3 uploads</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--primary, #007bff)' }}>20 uploads</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>Maximum file size</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>10 MB</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--primary, #007bff)' }}>25 MB</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>Syllabus-to-Roadmap Extraction</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>PDF</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>PDF</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>Slide & Lecture Notes Extraction</td>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--grey-500, #888)' }}>—</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--primary, #007bff)' }}>PDF & PPTX</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>Knowledge Graph & Markdown</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>Included</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>Included</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--surface-border, #eee)' }}>
                <td style={{ padding: '0.85rem 0.75rem', color: 'var(--on-surface-variant, #555)' }}>GPA Calculator (HEC 4.0 & Custom)</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>Included</td>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SoftwareApplication structured data for Google pricing rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppJsonLd),
        }}
      />
    </div>
  );
}
