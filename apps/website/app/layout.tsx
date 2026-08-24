import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tenaciti.app'),
  title: {
    default: 'Tenaciti | AI Study Workspace for University Students',
    template: '%s | Tenaciti',
  },
  description:
    'AI-powered syllabus extraction, knowledge graph notes, and a free HEC 4.0 GPA calculator — the study workspace built for university students.',
  openGraph: {
    siteName: 'Tenaciti',
    images: [
      {
        url: '/tenaciti-og.jpeg',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/tenaciti-og.jpeg'],
  },
};

// Sitewide JSON-LD structured data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tenaciti',
  url: 'https://www.tenaciti.app',
  logo: 'https://www.tenaciti.app/logo.svg',
  description:
    'AI-powered study workspace for university students: syllabus extraction, knowledge graph notes, GPA tracking, and an AI assistant that manages your workspace by prompt.',
  sameAs: [
    // TODO: Replace with real profile URLs once created
    'https://www.linkedin.com/company/tenaciti',
    'https://github.com/tenaciti',
    'https://www.producthunt.com/products/tenaciti',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tenaciti',
  url: 'https://www.tenaciti.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </body>
    </html>
  );
}
