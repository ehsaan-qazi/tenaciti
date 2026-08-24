import type { Metadata } from 'next';
import { ContactForm } from '../../components/ContactForm';

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
  },
  twitter: {
    title: 'Contact Us | Tenaciti',
    description: 'Get in touch with the Tenaciti team — support, feedback, and feature requests.',
  },
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Contact Us
      </h1>
      <p
        style={{
          fontSize: '1.25rem',
          color: 'var(--on-surface-variant, #666)',
          textAlign: 'center',
          marginBottom: '4rem',
        }}
      >
        Have a question, feedback, or need support? We&apos;d love to hear from you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Get in touch
          </h2>
          <p
            style={{
              color: 'var(--on-surface-variant, #666)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            For support inquiries, feature requests, or any other questions, please email us
            directly. We aim to respond to all inquiries within 24-48 hours.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Email Support
            </h3>
            <a
              href="mailto:ehsaanbusinesshandle@gmail.com"
              style={{ color: 'var(--primary, #007bff)', fontSize: '1.125rem' }}
            >
              ehsaanbusinesshandle@gmail.com
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
