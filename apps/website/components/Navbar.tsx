'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'FEATURES', href: '/features' },
    { label: 'PRICING', href: '/pricing' },
    { label: 'GPA CALC', href: '/tools/gpa-calculator' },
    { label: 'FAQ', href: '/faq' },
    { label: 'ABOUT', href: '/about' },
  ];

  return (
    <header className={styles.headerWrapper}>
      <nav className={styles.nav} aria-label="Main Navigation">
        <Link href="/" className={styles.brand} aria-label="Tenaciti Home">
          <svg className={styles.logoSvg} viewBox="0 0 503 217" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g transform="translate(503 0) scale(-1 1)">
              <path fill="currentColor" d="M268.8 7.5c-31.3 6.8-53.6 28.3-61.9 59.5-.6 2.5-1.2 9-1.3 14.5l-.1 10h31l.2-4.5c.7-12.8 6.2-25.8 14.3-33.9 5.5-5.5 14.4-10.4 22.5-12.6 8.7-2.2 189.5-2.3 189.5 0 0 .8-1 4-2.2 7.2-2.9 7.8-11.1 16.1-19.3 19.4l-6 2.4-65 .5-65 .5-5.7 2.3c-7.7 3.1-16.9 10-20.8 15.7-3.6 5.3-7.4 13.4-6.6 14.2.3.3 36.4.5 80.3.5 71.5 0 80.6-.2 87.3-1.7 26.7-6.1 48-26.5 55.5-53.1 1.2-4.1 1.9-11.6 2.2-24.2l.5-18.2-111.8.1c-85.6.1-113.2.4-117.6 1.4M70.5 115c-23.9 3.5-45.8 18.9-56.2 39.5-6.6 12.9-7.6 17.6-8.1 38.2L5.8 212h112.4c109.4 0 112.7-.1 120.4-2 17.2-4.4 32.2-13.9 42.9-27.2 11.6-14.6 16.2-26.8 17.2-45.6l.6-11.3-15.9.3-15.9.3-.6 6.5c-1.4 13.3-5.2 22.2-13.1 30.6a48.5 48.5 0 0 1-20.8 13.5c-7.4 2.6-10.8 2.6-130.2 2.1L41 179v-2.3c0-3.3 5.3-13.6 9.4-18.4 2.4-2.7 6.5-5.6 11.3-8l7.7-3.8 65-.5 65.1-.5 6-2.4c11.1-4.4 20-12.4 24.5-21.8 3.8-8 11.1-7.3-76.2-7.2-43.1.1-80.6.5-83.3.9"/>
            </g>
          </svg>
          <span className={styles.brandName}>Tenaciti</span>
        </Link>

        <ul className={styles.navLinks}>
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive ? styles.active : ''}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.navActions}>
          <a
            href="https://my.tenaciti.app/login"
            className={styles.btnLogin}
          >
            Login
          </a>
          <a
            href="https://my.tenaciti.app/signup"
            className={styles.btnNavCta}
          >
            Get Started
          </a>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={mobileOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileLinks}>
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <a
              href="https://my.tenaciti.app/login"
              className={styles.btnLogin}
            >
              Login
            </a>
            <a
              href="https://my.tenaciti.app/signup"
              className={styles.btnNavCta}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
