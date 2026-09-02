import type { ReactNode } from 'react';
import styles from './Eyebrow.module.css';

const ICONS: Record<string, ReactNode> = {
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  features: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  pricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
      <line x1="16" y1="18" x2="16" y2="18.01" />
    </svg>
  ),
  faq: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  ),
  steps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

function getIconForLabel(label: string): ReactNode {
  const norm = label.toLowerCase();
  if (norm.includes('blog') || norm.includes('guide') || norm.includes('article') || norm.includes('read')) return ICONS.blog;
  if (norm.includes('feature') || norm.includes('capabilit')) return ICONS.features;
  if (norm.includes('price') || norm.includes('pricing') || norm.includes('plan')) return ICONS.pricing;
  if (norm.includes('tool') || norm.includes('calc') || norm.includes('gpa')) return ICONS.calculator;
  if (norm.includes('faq') || norm.includes('question') || norm.includes('help')) return ICONS.faq;
  if (norm.includes('contact') || norm.includes('support') || norm.includes('mail')) return ICONS.contact;
  if (norm.includes('about') || norm.includes('mission') || norm.includes('team') || norm.includes('student') || norm.includes('trust')) return ICONS.about;
  if (norm.includes('ai') || norm.includes('assistant') || norm.includes('roadmap') || norm.includes('smart') || norm.includes('workspace')) return ICONS.ai;
  if (norm.includes('how') || norm.includes('work') || norm.includes('step')) return ICONS.steps;
  if (norm.includes('why') || norm.includes('star') || norm.includes('award') || norm.includes('proof')) return ICONS.star;
  if (norm.includes('privacy') || norm.includes('terms') || norm.includes('legal') || norm.includes('security')) return ICONS.shield;
  return ICONS.ai;
}

interface EyebrowProps {
  children: ReactNode;
  /** 'light' renders a white pill for light backgrounds; 'dark' renders an elevated pill for dark sections. */
  variant?: 'light' | 'dark';
  /** Custom icon override. If undefined and showIcon is true, an automated icon is selected based on label text. */
  icon?: ReactNode;
  /** Whether to display the icon (default: true). */
  showIcon?: boolean;
}

export function Eyebrow({ children, variant = 'light', icon, showIcon = true }: EyebrowProps) {
  let resolvedIcon: ReactNode = null;
  if (showIcon) {
    if (icon) {
      resolvedIcon = icon;
    } else if (typeof children === 'string') {
      resolvedIcon = getIconForLabel(children);
    } else {
      resolvedIcon = ICONS.ai;
    }
  }

  return (
    <span className={`${styles.eyebrow} ${variant === 'dark' ? styles.dark : styles.light}`}>
      {resolvedIcon && <span className={styles.iconWrap}>{resolvedIcon}</span>}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
