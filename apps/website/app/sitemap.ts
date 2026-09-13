import type { MetadataRoute } from 'next';
import { getAllPosts } from '../lib/blog-data';

const BASE_URL = 'https://www.tenaciti.app';

// Static routes with realistic last-modified dates reflecting actual content updates
const STATIC_ROUTES: Record<
  string,
  { lastModified: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }
> = {
  '': { lastModified: '2026-09-13', priority: 1.0, changeFrequency: 'weekly' },
  '/features': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/pricing': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/tools/gpa-calculator': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/blog': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/faq': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/about': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/contact': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/privacy': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
  '/terms': { lastModified: '2026-09-04', priority: 0.7, changeFrequency: 'weekly' },
};

const FEATURE_SLUGS = [
  'ai-roadmap',
  'knowledge-graph',
  'topic-tracking',
  'gpa-calculator',
  'self-assessment',
  'ai-assistant',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = Object.entries(STATIC_ROUTES).map(([route, config]) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(config.lastModified),
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));

  const featureRoutes = FEATURE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/features/${slug}`,
    lastModified: new Date('2026-09-04'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const blogRoutes = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...featureRoutes, ...blogRoutes];
}
