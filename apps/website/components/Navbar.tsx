import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem', alignItems: 'center', borderBottom: '1px solid var(--surface-border, #eee)' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo.svg" alt="Tenaciti Logo" width={32} height={32} />
          <span>Tenaciti</span>
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/">Home</Link>
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/tools/gpa-calculator">GPA Calc</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="https://my.tenaciti.app/login" style={{ padding: '0.5rem 1rem' }}>Log In</a>
        <a href="https://my.tenaciti.app/signup" style={{ padding: '0.5rem 1rem', background: 'var(--primary, #007bff)', color: 'white', borderRadius: '4px' }}>Sign Up</a>
      </div>
    </nav>
  );
}
