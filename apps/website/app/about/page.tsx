import { Placeholder } from '../../components/Placeholder';

export const metadata = {
  title: 'About Us | Tenaciti',
  description: 'The story behind Tenaciti and our mission to help students excel.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>About Tenaciti</h1>
      
      <div style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--on-surface-variant, #666)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <p>
          Tenaciti was built out of a simple frustration: managing university coursework is often harder than the coursework itself. Between scattered syllabi, multiple learning management systems, and a constant fear of missing deadlines, students spend too much time organizing and too little time learning.
        </p>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--on-surface)' }}>Our Mission</h2>
          <p>
            We are on a mission to give every student an unfair advantage by providing them with an intelligent workspace that actually understands their coursework. We believe AI shouldn&apos;t just write essays for you—it should help you learn better, manage your time more effectively, and reduce academic anxiety.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--on-surface)' }}>The Team</h2>
          <div style={{ marginBottom: '2rem' }}>
            <Placeholder type="image" label="Founder Photo" />
          </div>
          <p>
            Founded by a recent computer science graduate who experienced these problems firsthand, Tenaciti is built by students, for students. We are constantly iterating based on feedback from our community to build the ultimate academic productivity tool.
          </p>
        </section>
      </div>
    </div>
  );
}
