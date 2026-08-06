import { Placeholder } from '../../../components/Placeholder';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${title} | Tenaciti Features`,
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const featureName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/features" style={{ color: 'var(--primary, #007bff)', fontWeight: 'bold' }}>← Back to Features</Link>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>{featureName}</h1>
        {slug === 'ai-assistant' && (
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', background: 'var(--surface-border, #e0e0e0)', padding: '0.5rem 1rem', borderRadius: '4px' }}>COMING SOON</span>
        )}
      </div>

      <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', marginBottom: '4rem' }}>
        Detailed exploration of the {featureName} capability in Tenaciti.
      </p>

      <div style={{ marginBottom: '4rem' }}>
        <Placeholder type="screenshot" label={`${featureName} Interface`} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>How it works</h2>
          <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
            This feature integrates seamlessly into your study workflow, allowing you to focus on learning rather than organization.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Use Cases</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--on-surface-variant, #666)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Preparing for midterms and finals</li>
            <li>Staying on top of weekly assignments</li>
            <li>Tracking long-term academic progress</li>
          </ul>
        </section>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="https://my.tenaciti.app/signup" style={{ display: 'inline-block', padding: '1rem 2rem', background: 'var(--primary, #007bff)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem' }}>Try {featureName} Free</a>
      </div>
    </div>
  );
}
