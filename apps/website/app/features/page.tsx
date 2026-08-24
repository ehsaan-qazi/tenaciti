import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
  },
  description:
    'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
  alternates: {
    canonical: 'https://www.tenaciti.app/features',
  },
  openGraph: {
    title: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
    description:
      'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
    url: 'https://www.tenaciti.app/features',
  },
  twitter: {
    title: 'Features | Syllabus AI, Knowledge Graph & GPA Tools',
    description:
      'See how Tenaciti extracts your syllabus into a study roadmap, tracks topic confidence, links notes in a knowledge graph, and calculates your GPA.',
  },
};

export default function FeaturesPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Features
      </h1>
      <p
        style={{
          fontSize: '1.25rem',
          color: 'var(--on-surface-variant, #666)',
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        Everything you need to manage your semester and achieve your academic goals.
      </p>

      <h2
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--on-surface-variant, #666)',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Core Workspace Capabilities
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        <Link
          href="/features/ai-roadmap"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-default, #fff)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              AI Roadmap Extraction
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              Upload a PDF syllabus. Get a full semester roadmap — assignments, quizzes, exams, projects — with deadlines and grade weights pulled out automatically.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>

        <Link
          href="/features/knowledge-graph"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-default, #fff)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Knowledge Graph
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              Link your notes with [[wikilinks]] and watch Tenaciti map how every idea, lecture, and course connects — visually, in real time.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>

        <Link
          href="/features/topic-tracking"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-default, #fff)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Topic Tracking & Confidence
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              Break each course into topics, rate your confidence 1–5 as you complete them, and see exactly where your weak spots are before the exam does.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>

        <Link
          href="/features/gpa-calculator"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-default, #fff)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              GPA Calculator & Goals
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              Calculate SGPA and CGPA on the HEC 4.0 scale (or your own custom scale), set a target GPA, and track progress course by course.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>

        <Link
          href="/features/self-assessment"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-default, #fff)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Self-Assessment & Calibration
            </h3>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              After every assignment, quiz, or exam, log how it actually went — quality, effort, hours spent — and see the gap between how confident you felt and how it went.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>

        <Link
          href="/features/ai-assistant"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem 2rem',
            border: '1px solid var(--surface-border, #eee)',
            borderRadius: '16px',
            background: 'var(--surface-sunken, #f8f9fa)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold' }}>
                AI Workspace Assistant
              </h3>
            </div>
            <p style={{ color: 'var(--on-surface-variant, #666)', lineHeight: 1.6 }}>
              Ask it what to study next, tell it to update a goal or mark a topic done, or have it build a study plan — a conversational agent that knows your courses, notes, and deadlines and can act on them.
            </p>
          </div>
          <span style={{ color: 'var(--primary, #007bff)', fontWeight: 600, marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Learn more →
          </span>
        </Link>
      </div>
    </div>
  );
}
