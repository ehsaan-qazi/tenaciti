import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../../../lib/metadata';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Tenaciti users.',
  alternates: {
    canonical: 'https://www.tenaciti.app/terms',
  },
  openGraph: {
    title: 'Terms of Service | Tenaciti',
    description: 'Terms of Service for Tenaciti users.',
    url: 'https://www.tenaciti.app/terms',
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title: 'Terms of Service | Tenaciti',
    description: 'Terms of Service for Tenaciti users.',
  },
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.updated}>Last Updated: {new Date().toLocaleDateString()}</p>

      <div className={styles.sections}>
        <section>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.sectionText}>
            By accessing or using the Tenaciti website and application, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use our
            services.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>2. Description of Service</h2>
          <p className={styles.sectionText}>
            Tenaciti is an academic productivity tool designed to help students manage courses,
            track GPA, and organize study materials. We provide a platform for organizing
            information, but we are not responsible for your academic outcomes.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>3. User Conduct</h2>
          <p className={styles.sectionText}>
            You agree not to use the service for any unlawful purpose or in any way that interrupts,
            damages, or impairs the service. You are responsible for all content that you upload or
            create using Tenaciti.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>4. Intellectual Property</h2>
          <p className={styles.sectionText}>
            The service and its original content, features, and functionality are and will remain
            the exclusive property of Tenaciti and its licensors.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>5. Limitation of Liability</h2>
          <p className={styles.sectionText}>
            In no event shall Tenaciti, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential or
            punitive damages, including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of or inability to
            access or use the service.
          </p>
        </section>
      </div>
    </div>
  );
}
