import Link from 'next/link';
import styles from './CtaPanel.module.css';

interface CtaAction {
  label: string;
  href: string;
  /** External links render as plain <a>, internal ones as <Link>. */
  external?: boolean;
}

interface CtaPanelProps {
  title: string;
  sub?: string;
  primary: CtaAction;
  secondary?: CtaAction;
  /** Render inside the standard 1280px inset wrapper (default true). */
  inset?: boolean;
}

/** Dark closing call-to-action panel with the Tenaciti squares motif. */
export function CtaPanel({ title, sub, primary, secondary, inset = true }: CtaPanelProps) {
  const panel = (
    <div className={styles.panel}>
      <div className={styles.squares} aria-hidden="true">
        <span className={`${styles.sq} ${styles.sq1}`} />
        <span className={`${styles.sq} ${styles.sq2}`} />
        <span className={`${styles.sq} ${styles.sq3}`} />
        <span className={`${styles.sq} ${styles.sq4}`} />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>

      <div className={styles.actions}>
        {primary.external ? (
          <a href={primary.href} className={`${styles.btn} ${styles.btnLight}`}>
            {primary.label}
          </a>
        ) : (
          <Link href={primary.href} className={`${styles.btn} ${styles.btnLight}`}>
            {primary.label}
          </Link>
        )}
        {secondary &&
          (secondary.external ? (
            <a href={secondary.href} className={`${styles.btn} ${styles.btnOutlineLight}`}>
              {secondary.label}
            </a>
          ) : (
            <Link href={secondary.href} className={`${styles.btn} ${styles.btnOutlineLight}`}>
              {secondary.label}
            </Link>
          ))}
      </div>
    </div>
  );

  return inset ? <section className={styles.section}>{panel}</section> : panel;
}
