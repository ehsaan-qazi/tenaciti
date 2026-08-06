export const metadata = {
  title: 'Contact Us | Tenaciti',
  description: 'Get in touch with the Tenaciti team.',
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #666)', textAlign: 'center', marginBottom: '4rem' }}>
        Have a question, feedback, or need support? We&apos;d love to hear from you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Get in touch</h2>
          <p style={{ color: 'var(--on-surface-variant, #666)', marginBottom: '2rem', lineHeight: 1.6 }}>
            For support inquiries, feature requests, or any other questions, please email us directly. We aim to respond to all inquiries within 24-48 hours.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email Support</h3>
            <a href="mailto:ehsaanbusinesshandle@gmail.com" style={{ color: 'var(--primary, #007bff)', fontSize: '1.125rem' }}>ehsaanbusinesshandle@gmail.com</a>
          </div>
        </div>

        <div style={{ background: 'var(--surface-sunken, #f8f9fa)', padding: '2rem', borderRadius: '12px' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Name</label>
              <input type="text" id="name" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border, #ccc)' }} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" id="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border, #ccc)' }} placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="message" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message</label>
              <textarea id="message" rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border, #ccc)', resize: 'vertical' }} placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" style={{ padding: '1rem', background: 'var(--primary, #007bff)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem', cursor: 'pointer' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
