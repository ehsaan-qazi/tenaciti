import type { Metadata } from 'next';

export const DEFAULT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Tenaciti | AI Study Workspace for University Students',
  type: 'image/png',
};

export const DEFAULT_OG_IMAGES = [DEFAULT_OG_IMAGE];

export const DEFAULT_TWITTER_CARD = 'summary_large_image' as const;

export const DEFAULT_TWITTER: Metadata['twitter'] = {
  card: DEFAULT_TWITTER_CARD,
  images: ['/og-image.png'],
};
