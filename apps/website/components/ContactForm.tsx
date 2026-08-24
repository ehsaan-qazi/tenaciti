'use client';

import { useState, FormEvent } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Something went wrong.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message.');
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          background: 'var(--surface-sunken, #f8f9fa)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Message sent!
        </h3>
        <p style={{ color: 'var(--on-surface-variant, #666)' }}>
          We&apos;ll get back to you within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface-sunken, #f8f9fa)',
        padding: '2rem',
        borderRadius: '12px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <div>
          <label
            htmlFor="name"
            style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border, #ccc)',
            }}
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border, #ccc)',
            }}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border, #ccc)',
              resize: 'vertical',
            }}
            placeholder="How can we help you?"
          />
        </div>

        {status === 'error' && (
          <p style={{ color: '#dc3545', fontSize: '0.875rem' }}>{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '1rem',
            background: status === 'loading' ? 'var(--surface-border, #ccc)' : 'var(--primary, #007bff)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'loading' ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
