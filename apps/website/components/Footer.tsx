import Link from 'next/link';
import { NewsletterForm } from './NewsletterForm';
import styles from './Footer.module.css';

const PRODUCT_LINKS = [
  { label: 'Features Overview', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'AI Roadmap', href: '/features/ai-roadmap' },
  { label: 'Knowledge Graph', href: '/features/knowledge-graph' },
  { label: 'Topic Tracking', href: '/features/topic-tracking' },
  { label: 'Self-Assessment', href: '/features/self-assessment' },
  { label: 'AI Assistant', href: '/features/ai-assistant' },
];

const RESOURCE_LINKS = [
  { label: 'Free GPA Calculator', href: '/tools/gpa-calculator' },
  { label: 'GPA Goal Tracking', href: '/features/gpa-calculator' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Student Signup', href: 'https://my.tenaciti.app/signup' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Support', href: '/contact' },
];

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tenaciti',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/tenaciti',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: 'Product Hunt',
    href: 'https://www.producthunt.com/products/tenaciti',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm1.22 14.61h-3.05v3.05H7.72V6.34h5.5c2.47 0 4.06 1.59 4.06 4.13 0 2.55-1.59 4.14-4.06 4.14zm-.15-5.9h-2.9v3.53h2.9c1.19 0 1.94-.68 1.94-1.77 0-1.08-.75-1.76-1.94-1.76z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.panel}>
        <div className={styles.squares} aria-hidden="true">
          <span className={`${styles.sq} ${styles.sq1}`} />
          <span className={`${styles.sq} ${styles.sq2}`} />
          <span className={`${styles.sq} ${styles.sq3}`} />
          <span className={`${styles.sq} ${styles.sq4}`} />
        </div>

        <div className={styles.top}>
          <div className={styles.brandCol}>
            <div className={styles.brand}>
              <svg className={styles.logoSvg} viewBox="0 0 503 217" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g transform="translate(503 0) scale(-1 1)">
                  <path fill="currentColor" d="M268.8 7.5c-31.3 6.8-53.6 28.3-61.9 59.5-.6 2.5-1.2 9-1.3 14.5l-.1 10h31l.2-4.5c.7-12.8 6.2-25.8 14.3-33.9 5.5-5.5 14.4-10.4 22.5-12.6 8.7-2.2 189.5-2.3 189.5 0 0 .8-1 4-2.2 7.2-2.9 7.8-11.1 16.1-19.3 19.4l-6 2.4-65 .5-65 .5-5.7 2.3c-7.7 3.1-16.9 10-20.8 15.7-3.6 5.3-7.4 13.4-6.6 14.2.3.3 36.4.5 80.3.5 71.5 0 80.6-.2 87.3-1.7 26.7-6.1 48-26.5 55.5-53.1 1.2-4.1 1.9-11.6 2.2-24.2l.5-18.2-111.8.1c-85.6.1-113.2.4-117.6 1.4M70.5 115c-23.9 3.5-45.8 18.9-56.2 39.5-6.6 12.9-7.6 17.6-8.1 38.2L5.8 212h112.4c109.4 0 112.7-.1 120.4-2 17.2-4.4 32.2-13.9 42.9-27.2 11.6-14.6 16.2-26.8 17.2-45.6l.6-11.3-15.9.3-15.9.3-.6 6.5c-1.4 13.3-5.2 22.2-13.1 30.6a48.5 48.5 0 0 1-20.8 13.5c-7.4 2.6-10.8 2.6-130.2 2.1L41 179v-2.3c0-3.3 5.3-13.6 9.4-18.4 2.4-2.7 6.5-5.6 11.3-8l7.7-3.8 65-.5 65.1-.5 6-2.4c11.1-4.4 20-12.4 24.5-21.8 3.8-8 11.1-7.3-76.2-7.2-43.1.1-80.6.5-83.3.9" />
                </g>
              </svg>
              <span className={styles.brandName}>Tenaciti</span>
            </div>
            <p className={styles.tagline}>
              Study smart, not hard. The AI academic workspace for university students.
            </p>
            <a className={styles.contactLine} href="mailto:ehsaanbusinesshandle@gmail.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
              ehsaanbusinesshandle@gmail.com
            </a>

            <div className={styles.newsletter}>
              <span className={styles.newsletterHeading}>Stay in the Loop</span>
              <span className={styles.newsletterSub}>
                Product updates and study tips. No spam, ever.
              </span>
              <NewsletterForm />
            </div>
          </div>

          <nav className={styles.linksGrid} aria-label="Footer">
            <div className={styles.linkGroup}>
              <span className={styles.groupHeading}>Product</span>
              {PRODUCT_LINKS.map((link) =>
                link.href.startsWith('http') ? (
                  <a key={link.label} href={link.href}>{link.label}</a>
                ) : (
                  <Link key={link.label} href={link.href}>{link.label}</Link>
                )
              )}
            </div>
            <div className={styles.linkGroup}>
              <span className={styles.groupHeading}>Resources</span>
              {RESOURCE_LINKS.map((link) =>
                link.href.startsWith('http') ? (
                  <a key={link.label} href={link.href}>{link.label}</a>
                ) : (
                  <Link key={link.label} href={link.href}>{link.label}</Link>
                )
              )}
            </div>
            <div className={styles.linkGroup}>
              <span className={styles.groupHeading}>Company</span>
              {COMPANY_LINKS.map((link) => (
                <Link key={link.label} href={link.href}>{link.label}</Link>
              ))}
              <div className={styles.socials}>
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={styles.socialBtn}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span className={styles.copyright}>© {new Date().getFullYear()} Tenaciti. All Rights Reserved.</span>
        <div className={styles.legalLinks}>
          {/* TODO: Add real social profile URLs once profiles are published */}
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
