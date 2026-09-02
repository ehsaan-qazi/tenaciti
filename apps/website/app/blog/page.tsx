import type { Metadata } from 'next';
import { PageHeader } from '../../components/ui/PageHeader';
import { CtaPanel } from '../../components/ui/CtaPanel';
import { BlogCard } from '../../components/blog/BlogCard';
import { getAllPosts } from '../../lib/blog-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog — Guides & Insights for University Students',
  description:
    'Evidence-based study workflows, GPA guides, note-taking methods, and AI productivity tips — written for university students, backed by research.',
  alternates: {
    canonical: 'https://www.tenaciti.app/blog',
  },
  openGraph: {
    title: 'Blog — Guides & Insights for University Students | Tenaciti',
    description:
      'Evidence-based study workflows, GPA guides, note-taking methods, and AI productivity tips — written for university students, backed by research.',
    url: 'https://www.tenaciti.app/blog',
  },
  twitter: {
    title: 'Blog — Guides & Insights for University Students | Tenaciti',
    description:
      'Evidence-based study workflows, GPA guides, note-taking methods, and AI productivity tips.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Guides & Insights"
        sub="Evidence-based study workflows, GPA breakdowns, and productivity methods — written for university students, backed by real research."
      />

      <section className={styles.content}>
        <div className={styles.inset}>
          {/* Featured spotlight */}
          {featured && (
            <div className={styles.featuredSection}>
              <BlogCard
                slug={featured.slug}
                title={featured.title}
                excerpt={featured.excerpt}
                category={featured.category}
                readingTime={featured.readingTime}
                publishedAt={featured.publishedAt}
                featured
              />
            </div>
          )}

          {/* Post grid */}
          <div className={styles.grid}>
            {rest.map((post) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                category={post.category}
                readingTime={post.readingTime}
                publishedAt={post.publishedAt}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaPanel
        title="Master your semester from day one"
        sub="AI-powered syllabus extraction, knowledge graph notes, and a free GPA calculator — start for free."
        primary={{ label: 'Get Started Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Explore Features', href: '/features' }}
      />
    </>
  );
}
