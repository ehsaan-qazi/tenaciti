import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.tenaciti.app';

const FEATURE_SLUGS = [
  'ai-roadmap',
  'knowledge-graph',
  'topic-tracking',
  'gpa-calculator',
  'self-assessment',
  'ai-assistant',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/features',
    '/pricing',
    '/tools/gpa-calculator',
    '/faq',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  const featureRoutes = FEATURE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/features/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...featureRoutes];
}
