import type { ReactNode } from 'react';
import styles from './Eyebrow.module.css';

interface EyebrowProps {
  children: ReactNode;
  /** 'light' renders a white pill for light backgrounds; 'dark' renders an elevated pill for dark sections. */
  variant?: 'light' | 'dark';
  /** Hide the leading dot for plain uppercase labels. */
  dot?: boolean;
}

export function Eyebrow({ children, variant = 'light', dot = true }: EyebrowProps) {
  return (
    <span className={`${styles.eyebrow} ${variant === 'dark' ? styles.dark : styles.light}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
