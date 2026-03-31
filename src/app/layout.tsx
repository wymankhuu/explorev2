import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Montserrat, Montserrat_Alternates } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-montserrat-alternates',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Explore Community Apps — Playlab',
  description: 'Discover interesting apps from our community. Explore what other educators are building with Playlab.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${montserratAlternates.variable}`}>
      <body className="antialiased">
        {/* Rainbow background layers — matches Playlab dev explore page */}
        <div className="rainbow-page-background" />
        <div className="rainbow-page-filter" />
        <Navbar />
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
