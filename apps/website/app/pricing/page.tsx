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
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pricing</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)' }}>Start for free, upgrade when you need more power.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Free Plan */}
        <div style={{ border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Free</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>$0</div>
          <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem' }}>Perfect for managing a single semester.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <li>✓ 3 Document uploads per month</li>
            <li>✓ Basic syllabus extraction</li>
            <li>✓ GPA calculator</li>
            <li>✓ Core knowledge graph</li>
          </ul>
          <a href="https://my.tenaciti.app/signup" style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--primary, #007bff)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>Get Started</a>
        </div>

        {/* Premium Plan */}
        <div style={{ border: '2px solid var(--primary, #007bff)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary, #007bff)', color: 'white', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>RECOMMENDED</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Premium</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>TBD</div>
          <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem' }}>Unlimited power for serious students.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <li>✓ Unlimited document uploads</li>
            <li>✓ Advanced AI extraction from slides</li>
            <li>✓ Unlimited AI assistant interactions</li>
            <li>✓ Priority support</li>
          </ul>
          <div style={{ display: 'block', textAlign: 'center', padding: '1rem', background: 'var(--surface-border, #e0e0e0)', color: 'var(--on-surface-variant, #666)', borderRadius: '8px', fontWeight: 'bold' }}>
            Coming Soon
          </div>
        </div>
      </div>

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
