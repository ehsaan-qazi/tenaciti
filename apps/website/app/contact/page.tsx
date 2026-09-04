import type { Metadata } from 'next';
import { PageHeader } from '../../components/ui/PageHeader';
import { ContactForm } from '../../components/ContactForm';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../../lib/metadata';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Tenaciti team — support, feedback, and feature requests.',
  alternates: {
    canonical: 'https://www.tenaciti.app/contact',
  },
  openGraph: {
    title: 'Contact Us | Tenaciti',
    description: 'Get in touch with the Tenaciti team — support, feedback, and feature requests.',
    url: 'https://www.tenaciti.app/contact',
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title: 'Contact Us | Tenaciti',
    description: 'Get in touch with the Tenaciti team — support, feedback, and feature requests.',
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the team"
        sub="Have a question, feedback, or need support? We'd love to hear from you."
      />

      <div className={styles.wrap}>
        <div>
          <h2 className={styles.infoHeading}>Get in touch</h2>
          <p className={styles.infoText}>
            For support inquiries, feature requests, or any other questions, send us a message
            below or email us directly. We aim to respond to all inquiries within 24–48 hours.
          </p>

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
              </span>
              <span>
                <span className={styles.infoLabel}>Email Support</span>
                <a href="mailto:ehsaanbusinesshandle@gmail.com" className={styles.infoValue}>
                  ehsaanbusinesshandle@gmail.com
                </a>
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              <span>
                <span className={styles.infoLabel}>Response Time</span>
                <span className={styles.infoValue}>Within 24–48 hours</span>
              </span>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </>
  );
}
