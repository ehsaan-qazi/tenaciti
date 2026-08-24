import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * Whitelist of valid feature slugs with unique SEO metadata.
 * Any slug not in this map will return a 404.
 */
const FEATURES: Record<string, { title: string; description: string; h1: string }> = {
  'ai-roadmap': {
    title: 'AI Syllabus & Roadmap Extraction',
    description:
      'Upload a PDF syllabus and Tenaciti extracts every assignment, quiz, exam, and deadline into a confirmable semester roadmap in seconds.',
    h1: 'AI Syllabus & Roadmap Extraction',
  },
  'knowledge-graph': {
    title: 'Knowledge Graph for Student Notes',
    description:
      'Link notes with wikilinks and watch Tenaciti build a live, force-directed knowledge graph of your courses — Obsidian-style, built for a semester.',
    h1: 'A Knowledge Graph Built for Your Semester',
  },
  'topic-tracking': {
    title: 'Topic Tracking & Confidence Ratings',
    description:
      'Break each course into topics, rate your confidence 1–5 as you complete them, and see exactly where your weak spots are before the exam.',
    h1: 'Know What You Actually Understand',
  },
  'gpa-calculator': {
    title: 'GPA Calculator & Goal Tracking',
    description:
      'Calculate SGPA and CGPA on the HEC 4.0 scale or your own custom scale, set a target GPA, and track your progress course by course.',
    h1: 'GPA Calculator & Goal Tracking',
  },
  'self-assessment': {
    title: 'Self-Assessment & Gap Analytics',
    description:
      'Log how each assignment or exam actually went, and see the gap between how confident you felt going in and how prepared you actually were.',
    h1: 'Close the Gap Between "I Studied" and "I Was Ready"',
  },
  'ai-assistant': {
    title: 'AI Assistant — Manage Your Workspace by Prompt',
    description:
      'Ask Tenaciti\'s AI Assistant what to study next, have it update goals or complete topics, or build a study plan — all in plain language.',
    h1: 'AI Assistant — Manage Your Whole Workspace With a Prompt',
  },
};

const BASE_URL = 'https://www.tenaciti.app';

/**
 * Pre-generate only the 6 valid feature routes at build time.
 */
export function generateStaticParams() {
  return Object.keys(FEATURES).map((slug) => ({ slug }));
}

/**
 * Per-slug unique metadata — no more duplicate titles/descriptions.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = FEATURES[slug];
  if (!feature) return {};

  return {
    title: feature.title,
    description: feature.description,
    alternates: {
      canonical: `${BASE_URL}/features/${slug}`,
    },
    openGraph: {
      title: `${feature.title} | Tenaciti`,
      description: feature.description,
      url: `${BASE_URL}/features/${slug}`,
    },
    twitter: {
      title: `${feature.title} | Tenaciti`,
      description: feature.description,
    },
  };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = FEATURES[slug];

  // Return 404 for any slug not in the whitelist
  if (!feature) notFound();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/features"
          style={{ color: 'var(--primary, #007bff)', fontWeight: 'bold' }}
        >
          ← Back to Features
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>{feature.h1}</h1>
      </div>

      <p
        style={{
          fontSize: '1.25rem',
          color: 'var(--on-surface-variant, #666)',
          marginBottom: '4rem',
        }}
      >
        {feature.description}
      </p>

      {/* TODO: Replace with per-feature animated UI demo component */}
      <div style={{ marginBottom: '4rem' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            How it works
          </h2>
          <p
            style={{
              color: 'var(--on-surface-variant, #666)',
              lineHeight: 1.6,
            }}
          >
            This feature integrates seamlessly into your study workflow, allowing
            you to focus on learning rather than organization.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Use Cases
          </h2>
          <ul
            style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              color: 'var(--on-surface-variant, #666)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>Preparing for midterms and finals</li>
            <li>Staying on top of weekly assignments</li>
            <li>Tracking long-term academic progress</li>
          </ul>
        </section>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a
          href="https://my.tenaciti.app/signup"
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'var(--primary, #007bff)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.125rem',
          }}
        >
          Try {feature.title.split('—')[0].trim()} Free
        </a>
      </div>
    </div>
  );
}
