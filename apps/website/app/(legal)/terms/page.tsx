export const metadata = {
  title: 'Terms of Service | Tenaciti',
  description: 'Terms of Service for Tenaciti users.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem' }}>Terms of Service</h1>
      <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem' }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.6 }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Tenaciti website and application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>2. Description of Service</h2>
          <p>
            Tenaciti is an academic productivity tool designed to help students manage courses, track GPA, and organize study materials. We provide a platform for organizing information, but we are not responsible for your academic outcomes.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>3. User Conduct</h2>
          <p>
            You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are responsible for all content that you upload or create using Tenaciti.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>4. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are and will remain the exclusive property of Tenaciti and its licensors.
          </p>
        </section>
        
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>5. Limitation of Liability</h2>
          <p>
            In no event shall Tenaciti, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>
      </div>
    </div>
  );
}
