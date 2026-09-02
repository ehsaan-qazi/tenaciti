import Link from 'next/link';
import styles from './ArticleCallout.module.css';

interface ArticleCalloutProps {
  variant?: 'tip' | 'product' | 'warning';
  title?: string;
  text: string;
  href?: string;
  linkLabel?: string;
}

export function ArticleCallout({
  variant = 'product',
  title,
  text,
  href,
  linkLabel,
}: ArticleCalloutProps) {
  return (
    <aside className={`${styles.callout} ${styles[variant]}`}>
      {title && <span className={styles.title}>{title}</span>}
      <p className={styles.text}>{text}</p>
      {href && linkLabel && (
        <Link href={href} className={styles.link}>
          {linkLabel}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      )}
    </aside>
  );
}
