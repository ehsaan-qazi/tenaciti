import { GPACalculator } from '../../../components/GPACalculator';

export const metadata = {
  title: 'Free College & University GPA Calculator | Tenaciti',
  description: 'Calculate your SGPA, CGPA, and internal marks easily with our free tool for university students. Supports HEC 4.0 scale and custom grade schemes.',
};

export default function GPACalculatorPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Free GPA Calculator</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', maxWidth: '800px', margin: '0 auto' }}>
          Quickly calculate your Semester GPA, Cumulative GPA, or project your final grade based on your internal marks. No sign-up required.
        </p>
      </div>

      <GPACalculator />

      <div style={{ marginTop: '6rem', padding: '3rem', background: 'var(--surface-sunken, #f8f9fa)', borderRadius: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Want to save your grades permanently?</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', marginBottom: '2rem' }}>
          Create a free Tenaciti account to save your GPA, set target grade goals, and track your progress across your entire degree.
        </p>
        <a href="https://my.tenaciti.app/signup" style={{ display: 'inline-block', padding: '1rem 2rem', background: 'var(--primary, #007bff)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem' }}>
          Create Free Account
        </a>
      </div>
    </div>
  );
}
