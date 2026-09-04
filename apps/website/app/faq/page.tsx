import type { Metadata } from 'next';
import { PageHeader } from '../../components/ui/PageHeader';
import { CtaPanel } from '../../components/ui/CtaPanel';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../../lib/metadata';
import styles from './page.module.css';

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
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title: 'FAQ | Tenaciti',
    description:
      'Answers on pricing, syllabus extraction, supported file formats, the HEC 4.0 GPA scale, and how Tenaciti protects your data.',
  },
};

const faqs = [
  {
    question: 'What is Tenaciti?',
    answer:
      'Tenaciti is an AI-powered workspace for university students. It helps you extract deadlines from syllabi, track your topic confidence, connect your notes in a knowledge graph, and manage your GPA all in one place.',
  },
  {
    question: 'Is Tenaciti free?',
    answer:
      'Yes! Tenaciti offers a generous free-forever tier that includes syllabus-to-roadmap extraction (3 document uploads per course/month), GPA tracking, and the core markdown knowledge graph — no credit card required.',
  },
  {
    question: 'How does the AI syllabus extraction work?',
    answer:
      'You simply upload your PDF syllabus, and our secure AI models analyze the text to extract a chronological roadmap of assessments, topics, and deadlines that you can confirm and adjust in one pass.',
  },
  {
    question: 'Does Tenaciti support DOCX syllabi, or only PDF?',
    answer:
      'Currently, syllabus roadmap extraction supports PDF only. Slide and lecture note extraction (available on Premium) supports PDF and PowerPoint (PPTX).',
  },
  {
    question: 'What grading scale does the GPA calculator use?',
    answer:
      'It defaults to the official Higher Education Commission (HEC) 4.0 scale used by Pakistani universities. You can also switch to a fully custom scale with your own grade points and percentage thresholds at any time.',
  },
  {
    question: "What's the difference between SGPA and CGPA in Tenaciti?",
    answer:
      'SGPA calculates your credit-weighted grade average for a single semester, while CGPA calculates your cumulative average across every semester of your degree. Both are available as dedicated tabs in our calculator.',
  },
  {
    question: "What happens if my syllabus doesn't clearly state a deadline or grade weight?",
    answer:
      'Tenaciti flags that item as a placeholder rather than inventing a date. You review and fill it in yourself during the confirmation step, ensuring your study plan is never based on AI guesswork.',
  },
  {
    question: 'What is a "confidence rating," and why does it matter?',
    answer:
      'When you complete a topic or submit an assessment, you rate how confident you actually are (1–5) — not just whether it is checked off. Over a semester, this highlights knowledge gaps and helps identify weak spots before exams.',
  },
  {
    question: 'How is my document data stored and protected?',
    answer:
      'Uploaded files are stored securely and deduplicated so the same file is never stored twice. Your uploaded documents and personal notes are private and are never used to train public AI models.',
  },
  {
    question: 'Can I use Tenaciti on my phone?',
    answer:
      'Tenaciti is designed as a modern responsive web application. While heavy note-taking and syllabus planning are optimal on desktop, you can easily check deadlines, review notes, and calculate GPAs on mobile browsers.',
  },
  {
    question: "What's the difference between the Free and Premium plans?",
    answer:
      'Free includes 3 uploads per course per month (10 MB max) and core syllabus-to-roadmap extraction. Premium raises those limits to 20 uploads per course per month (25 MB max) and adds slide/notes-to-topics extraction and priority support.',
  },
  {
    question: 'Is there an AI assistant that can manage my workspace for me?',
    answer:
      'Yes! Tenaciti includes an AI Assistant that understands your courses, topics, notes, goals, and deadlines. It answers questions grounded in your course materials, recommends what to study next, and can take direct actions like creating notes, updating goals, and generating multi-week study schedules.',
  },
  {
    question: 'Will the AI assistant only answer questions, or can it actually make changes for me?',
    answer:
      'Both. Simple requests (search your workspace, explain a concept, recommend what to study) get direct answers. Action requests — like completing a topic, updating a target GPA, or building a study plan — are carried out directly in your workspace.',
  },
  {
    question: 'How do I get started with Tenaciti?',
    answer:
      'You can sign up for free at my.tenaciti.app/signup. Simply create an account, create your courses for the current semester, and upload your first syllabus PDF.',
  },
];

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
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        sub="Everything you need to know about Tenaciti, grading scales, and syllabus extraction."
      />

      <div className={styles.wrap}>
        <div className={styles.list}>
          {faqs.map((faq, index) => (
            <details key={index} className={styles.item} {...(index === 0 ? { open: true } : {})}>
              <summary className={styles.trigger}>
                {faq.question}
                <span className={styles.chevron} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <p className={styles.answer}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <CtaPanel
        title="Still have questions?"
        sub="We are here to help. Send us a message and our team will get back to you within 24–48 hours."
        primary={{ label: 'Contact Support', href: '/contact' }}
      />

      {/* FAQPage structured data for Google featured snippets / AI Overviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
    </>
  );
}
