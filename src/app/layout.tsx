import type { Metadata } from 'next';
import React from 'react';
import { Fraunces, Jost } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import Footer from '@/components/Footer/Footer';
import IntroLoader from '@/components/IntroLoader/IntroLoader';
import ScrollProgressBar from '@/components/ScrollProgressBar/ScrollProgressBar';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://meadowmist.in'),
  title: {
    default: 'Meadow Mist — Handcrafted Candles & Ceramic Décor',
    template: '%s | Meadow Mist',
  },
  description:
    'Hand-poured soy candles and handmade ceramic home décor, crafted in small batches. Discover lotus bowls, ribbed pillar candles, trinket boxes, and more.',
  keywords: ['handmade candles', 'ceramic decor', 'soy candles', 'lotus bowl', 'artisan candles', 'home decor'],
  openGraph: {
    title: 'Meadow Mist — Handcrafted Candles & Ceramic Décor',
    description: 'Hand-poured soy candles and handmade ceramics, crafted with intention.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable}`}>
      <body>
        <IntroLoader />
        <ScrollProgressBar />
        <SiteHeader />
        <main id="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
