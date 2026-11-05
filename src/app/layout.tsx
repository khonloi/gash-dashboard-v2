import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import { WebVitals } from '@/components/analytics/WebVitals';
import { DemoModeBanner } from '@/components/common';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const viewport: Viewport = {
  themeColor: '#0C1C30',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GASH Dashboard | E-Commerce Operations Dashboard',
    template: '%s | GASH Dashboard',
  },
  description:
    'Comprehensive operations, product catalog, inventory management, and order fulfillment dashboard.',
  authors: [{ name: 'GASH Operations' }],
  creator: 'GASH',
  publisher: 'GASH',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <WebVitals />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ReactQueryProvider>
          {children}
          <ToastContainer />
          <DemoModeBanner hideOnDashboard />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
