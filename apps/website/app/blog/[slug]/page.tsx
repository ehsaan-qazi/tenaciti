import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  extractToc,
} from '../../../lib/blog-data';
import type { ContentBlock } from '../../../lib/blog-data';
import { TableOfContents } from '../../../components/blog/TableOfContents';
import { ArticleCallout } from '../../../components/blog/ArticleCallout';
import { BlogCard } from '../../../components/blog/BlogCard';
import { CtaPanel } from '../../../components/ui/CtaPanel';
import styles from './page.module.css';

/* ---------- Static Params ---------- */

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ---------- Dynamic Metadata ---------- */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `https://www.tenaciti.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://www.tenaciti.app/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

/* ---------- Content Renderer ---------- */

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className={styles.paragraph}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 key={index} id={block.id} className={styles.h2}>
            {block.text}
          </h2>
        );
      }
      return (
        <h3 key={index} id={block.id} className={styles.h3}>
          {block.text}
        </h3>
      );

    case 'table':
      return (
        <div key={index} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'formula':
      return (
        <pre key={index} className={styles.formula}>
          <code>{block.text}</code>
        </pre>
      );

    case 'callout':
      return (
        <ArticleCallout
          key={index}
          variant={block.variant}
          title={block.title}
          text={block.text}
          href={block.href}
          linkLabel={block.linkLabel}
        />
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol key={index} className={styles.list}>
            {block.items.map((item, i) => (
              <li
                key={i}
                className={styles.listItem}
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ol>
        );
      }
      return (
        <ul key={index} className={styles.list}>
          {block.items.map((item, i) => (
            <li
              key={i}
              className={styles.listItem}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </ul>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className={styles.blockquote}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    case 'sources':
      return (
        <aside key={index} className={styles.sources}>
          <span className={styles.sourcesLabel}>Sources referenced</span>
          <p>{block.text}</p>
        </aside>
      );

    default:
      return null;
  }
}

/* ---------- Page Component ---------- */

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const related = getRelatedPosts(post.slug, 2);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // JSON-LD Structured Data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Tenaciti',
      url: 'https://www.tenaciti.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tenaciti',
      url: 'https://www.tenaciti.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.tenaciti.app/logo.svg',
      },
    },
    mainEntityOfPage: `https://www.tenaciti.app/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.tenaciti.app' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.tenaciti.app/blog' },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <>
      <article className={styles.article}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent}>{post.title}</span>
        </nav>

        <div className={styles.layout}>
          {/* Main content column */}
          <div className={styles.main}>
            {/* Article header */}
            <header className={styles.header}>
              <div className={styles.headerMeta}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaDetail}>{post.readingTime} min read</span>
                <span className={styles.metaSep}>·</span>
                <time className={styles.metaDetail} dateTime={post.publishedAt}>
                  {formattedDate}
                </time>
              </div>
              <h1 className={styles.title}>{post.title}</h1>
            </header>

            {/* Article body */}
            <div className={styles.body}>
              {post.content.map((block, i) => renderBlock(block, i))}
            </div>

            {/* Related guides */}
            {related.length > 0 && (
              <section className={styles.relatedSection}>
                <h2 className={styles.relatedHeading}>Related Guides</h2>
                <div className={styles.relatedGrid}>
                  {related.map((rp) => (
                    <BlogCard
                      key={rp.slug}
                      slug={rp.slug}
                      title={rp.title}
                      excerpt={rp.excerpt}
                      category={rp.category}
                      readingTime={rp.readingTime}
                      publishedAt={rp.publishedAt}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <TableOfContents items={toc} />

            <div className={styles.sidebarCta}>
              <span className={styles.sidebarCtaTitle}>Get started with Tenaciti</span>
              <p className={styles.sidebarCtaText}>
                AI syllabus extraction, knowledge graph notes, and a free GPA calculator.
              </p>
              <a
                href="https://my.tenaciti.app/signup"
                className={styles.sidebarCtaBtn}
              >
                Start Free
              </a>
            </div>
          </aside>
        </div>
      </article>

      <CtaPanel
        title="Study smarter, not harder"
        sub="Join students using Tenaciti to turn syllabi into roadmaps, link notes into a knowledge graph, and track their GPA."
        primary={{ label: 'Get Started Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Try the GPA Calculator', href: '/tools/gpa-calculator' }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
