import type { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Tenaciti users.',
  alternates: {
    canonical: 'https://www.tenaciti.app/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Tenaciti',
    description: 'Privacy Policy for Tenaciti users.',
    url: 'https://www.tenaciti.app/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.updated}>Last Updated: {new Date().toLocaleDateString()}</p>

      <div className={styles.sections}>
        <section>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <p className={styles.sectionText}>
            When you use Tenaciti, we collect information you provide directly to us (such as when
            you create an account, upload a syllabus, or contact support) and information collected
            automatically (such as log data and device information).
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p className={styles.sectionText}>
            We use the information we collect to provide, maintain, and improve our services, to
            communicate with you, and to personalize your experience. We do not use your personal
            notes or uploaded documents to train public AI models.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>3. Information Sharing</h2>
          <p className={styles.sectionText}>
            We do not sell your personal information. We may share information with third-party
            service providers (such as hosting providers and payment processors) who perform
            services on our behalf and are bound by confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>4. Data Security</h2>
          <p className={styles.sectionText}>
            We take reasonable measures to help protect information about you from loss, theft,
            misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <p className={styles.sectionText}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:ehsaanbusinesshandle@gmail.com" className={styles.link}>
              ehsaanbusinesshandle@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
