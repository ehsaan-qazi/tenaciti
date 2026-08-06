import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer style={{ padding: '4rem 2rem', background: 'var(--surface-sunken, #f8f9fa)', marginTop: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Image src="/logo.svg" alt="Tenaciti Logo" width={32} height={32} />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Tenaciti</h3>
          </div>
          <p>© {new Date().getFullYear()} Tenaciti. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Product</strong>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Resources</strong>
            <Link href="/blog">Blog</Link>
            <Link href="/tools/gpa-calculator">GPA Calculator</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Company</strong>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Legal</strong>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
