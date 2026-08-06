import { Placeholder } from '../components/Placeholder';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1.1, maxWidth: '800px' }}>
          Master Your Semester with AI
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', maxWidth: '600px' }}>
          Tenaciti turns your syllabus into a clear roadmap, tracks your progress, and helps you achieve your dream GPA.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="https://my.tenaciti.app/signup" style={{ padding: '1rem 2rem', background: 'var(--primary, #007bff)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem' }}>Start for Free</a>
          <Link href="/features" style={{ padding: '1rem 2rem', border: '1px solid var(--surface-border, #ccc)', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem' }}>See Features</Link>
        </div>
        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '1000px' }}>
          <Placeholder type="screenshot" label="Tenaciti Dashboard Interface" />
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--surface-border, #eee)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--on-surface-variant, #666)' }}>Trusted by students</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Placeholder type="stat" label="Active Students Count" />
          <Placeholder type="stat" label="GPA Improved" />
          <Placeholder type="stat" label="Deadlines Met" />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Everything you need to excel</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant, #666)' }}>One workspace for all your courses, notes, and deadlines.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', background: 'var(--surface-sunken, #f8f9fa)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>AI Syllabus Extraction</h3>
            <p style={{ color: 'var(--on-surface-variant, #666)' }}>Upload your syllabus and let AI instantly create your study roadmap and extract all deadlines.</p>
          </div>
          <div style={{ padding: '2rem', background: 'var(--surface-sunken, #f8f9fa)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Knowledge Graph</h3>
            <p style={{ color: 'var(--on-surface-variant, #666)' }}>Connect your notes with bi-directional links and see how concepts relate to each other.</p>
          </div>
          <div style={{ padding: '2rem', background: 'var(--surface-sunken, #f8f9fa)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>GPA Tracking</h3>
            <p style={{ color: 'var(--on-surface-variant, #666)' }}>Set goals, calculate your current standing, and run what-if scenarios to stay on track.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 0', background: 'var(--surface-sunken, #f8f9fa)', margin: '0 -2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '4rem' }}>What students are saying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <Placeholder type="testimonial" label="Student Testimonial" />
            <Placeholder type="testimonial" label="Student Testimonial" />
          </div>
        </div>
      </section>
    </div>
  );
}
