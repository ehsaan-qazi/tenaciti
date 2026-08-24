'use client';

import { useState, FormEvent } from 'react';
import styles from './ContactForm.module.css';

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
      <div className={styles.successCard} role="status">
        <span className={styles.successCheck} aria-hidden="true">✓</span>
        <h3 className={styles.successTitle}>Message sent!</h3>
        <p className={styles.successText}>We&apos;ll get back to you within 24–48 hours.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input type="text" id="name" name="name" required placeholder="Your name" className={styles.input} />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input type="email" id="email" name="email" required placeholder="your@email.com" autoComplete="email" className={styles.input} />
        </div>
        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea id="message" name="message" rows={5} required placeholder="How can we help you?" className={`${styles.input} ${styles.textarea}`} />
        </div>

        {status === 'error' && (
          <p className={styles.error} role="alert">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`${styles.submit} ${status === 'loading' ? styles.submitLoading : ''}`}
        >
          {status === 'loading' ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
