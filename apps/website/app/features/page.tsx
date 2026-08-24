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
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Features</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', textAlign: 'center', marginBottom: '4rem' }}>
        Everything you need to manage your semester and achieve your goals.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Link href="/features/ai-roadmap" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', transition: 'box-shadow 0.2s' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>AI Roadmap Extraction</h3>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Turn any syllabus into a structured, trackable study plan instantly.</p>
        </Link>
        <Link href="/features/knowledge-graph" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', transition: 'box-shadow 0.2s' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Knowledge Graph</h3>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Visualize connections between concepts across all your courses.</p>
        </Link>
        <Link href="/features/topic-tracking" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', transition: 'box-shadow 0.2s' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Topic Tracking</h3>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Track your confidence level on every topic and identify weak spots.</p>
        </Link>
        <Link href="/features/gpa-calculator" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', transition: 'box-shadow 0.2s' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>GPA Calculator & Goals</h3>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Track your current GPA and set target grades to reach your goals.</p>
        </Link>
        <Link href="/features/self-assessment" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', transition: 'box-shadow 0.2s' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Self-Assessment</h3>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Test yourself and measure your readiness for upcoming exams.</p>
        </Link>
        <Link href="/features/ai-assistant" style={{ display: 'block', padding: '2rem', border: '1px solid var(--surface-border, #eee)', borderRadius: '12px', background: 'var(--surface-sunken, #f8f9fa)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>AI Workspace Assistant</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--surface-border, #e0e0e0)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>COMING SOON</span>
          </div>
          <p style={{ color: 'var(--on-surface-variant, #666)' }}>Your personal AI tutor and workspace orchestrator.</p>
        </Link>
      </div>
    </div>
  );
}
