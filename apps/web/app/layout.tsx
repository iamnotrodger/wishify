import { SITE } from '@/lib/brand';
import '@repo/ui/globals.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import Providers from './providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
};

export const viewport: Viewport = { themeColor: 'white' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
