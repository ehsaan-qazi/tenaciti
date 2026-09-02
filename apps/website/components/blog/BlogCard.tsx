import Link from 'next/link';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  publishedAt: string;
  featured?: boolean;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  category,
  readingTime,
  publishedAt,
  featured = false,
}: BlogCardProps) {
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className={`${styles.card} ${featured ? styles.featured : ''}`}
    >
      <div className={styles.meta}>
        <span className={styles.category}>{category}</span>
        <span className={styles.dot}>·</span>
        <span className={styles.readTime}>{readingTime} min read</span>
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.excerpt}>{excerpt}</p>

      <div className={styles.footer}>
        <time className={styles.date} dateTime={publishedAt}>{date}</time>
        <span className={styles.arrow} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
