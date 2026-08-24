import { Eyebrow } from './Eyebrow';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  sub?: string;
}

/** Consistent page intro used across all inner pages. */
export function PageHeader({ eyebrow, title, sub }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className={styles.title}>{title}</h1>
      {sub && <p className={styles.sub}>{sub}</p>}
    </header>
  );
}
