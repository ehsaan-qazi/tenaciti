'use client';

import { useState, FormEvent } from 'react';
import styles from './Footer.module.css';

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const email = new FormData(e.currentTarget).get('email') as string;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Signup',
          email,
          message: 'Please add me to the Tenaciti product updates list.',
        }),
      });

      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className={styles.newsletterSuccess} role="status">
        You&apos;re on the list — talk soon. ✓
      </p>
    );
  }

  return (
    <form className={styles.newsletterForm} onSubmit={handleSubmit}>
      <label className={styles.visuallyHidden} htmlFor="newsletter-email">
        Email address
      </label>
      <span className={styles.newsletterIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      </span>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        autoComplete="email"
        className={styles.newsletterInput}
      />
      <button
        type="submit"
        className={styles.newsletterSubmit}
        disabled={status === 'loading'}
        aria-label="Subscribe to product updates"
      >
        {status === 'loading' ? (
          '…'
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </form>
  );
}
