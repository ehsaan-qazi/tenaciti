import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Tenaciti | The AI Workspace for Students',
  description: 'AI-powered study planner, knowledge graph, and GPA tracker for university students.',
  openGraph: {
    title: 'Tenaciti | The AI Workspace for Students',
    description: 'AI-powered study planner, knowledge graph, and GPA tracker for university students.',
    url: 'https://www.tenaciti.app',
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
    title: 'Tenaciti | The AI Workspace for Students',
    description: 'AI-powered study planner, knowledge graph, and GPA tracker for university students.',
    images: ['/tenaciti-og.jpeg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${hankenGrotesk.variable} ${jetBrainsMono.variable}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
