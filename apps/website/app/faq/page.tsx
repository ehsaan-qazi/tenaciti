import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers on pricing, syllabus extraction, supported file formats, the HEC 4.0 GPA scale, and how Tenaciti protects your data.',
  alternates: {
    canonical: 'https://www.tenaciti.app/faq',
  },
  openGraph: {
    title: 'FAQ | Tenaciti',
    description:
      'Answers on pricing, syllabus extraction, supported file formats, the HEC 4.0 GPA scale, and how Tenaciti protects your data.',
    url: 'https://www.tenaciti.app/faq',
  },
  twitter: {
    title: 'FAQ | Tenaciti',
    description:
      'Answers on pricing, syllabus extraction, supported file formats, the HEC 4.0 GPA scale, and how Tenaciti protects your data.',
  },
};

const faqs = [
  {
    question: 'What is Tenaciti?',
    answer:
      'Tenaciti is an AI-powered workspace for university students. It helps you extract deadlines from syllabi, track your topic confidence, connect your notes, and manage your GPA all in one place.',
  },
  {
    question: 'Is Tenaciti free?',
    answer:
      'Yes! Tenaciti offers a generous free tier that covers basic syllabus extraction, document uploads, and core features. We will be launching a Premium tier soon for power users who need unlimited capabilities.',
  },
  {
    question: 'How does the AI syllabus extraction work?',
    answer:
      'You simply upload your PDF syllabus, and our secure AI models analyze the text to extract a chronological roadmap of assessments, topics, and deadlines.',
  },
  {
    question: 'Can I use Tenaciti on my phone?',
    answer:
      'Tenaciti is primarily designed as a desktop web application since most intense studying and note-taking happens on a computer. However, the app is responsive and can be accessed from your mobile browser.',
  },
  {
    question: 'How is my data protected?',
    answer:
      'We take your privacy seriously. Your uploaded documents and notes are securely stored and only processed by our AI models when you explicitly request an action. We do not sell your personal data or use it to train public models.',
  },
];

// JSON-LD structured data for FAQPage — fastest path to featured snippets
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function FAQPage() {
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
        Frequently Asked Questions
      </h1>
      <p
        style={{
          fontSize: '1.25rem',
          color: 'var(--on-surface-variant, #666)',
          textAlign: 'center',
          marginBottom: '4rem',
        }}
      >
        Everything you need to know about the product and billing.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              borderBottom: '1px solid var(--surface-border, #eee)',
              paddingBottom: '2rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {faq.question}
            </h3>
            <p
              style={{
                color: 'var(--on-surface-variant, #666)',
                lineHeight: 1.6,
              }}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '2rem',
          background: 'var(--surface-sunken, #f8f9fa)',
          borderRadius: '12px',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Still have questions?
        </h3>
        <p
          style={{
            color: 'var(--on-surface-variant, #666)',
            marginBottom: '1rem',
          }}
        >
          We are here to help. Send us a message and we&apos;ll get back to you
          as soon as possible.
        </p>
        <a
          href="/contact"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--primary, #007bff)',
            color: 'var(--primary, #007bff)',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Contact Support
        </a>
      </div>

      {/* FAQPage structured data for Google featured snippets / AI Overviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
    </div>
  );
}
