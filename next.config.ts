import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const isProd = process.env.NODE_ENV === 'production';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

function getApiOrigin(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL;
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

const apiOrigin = getApiOrigin();
const connectSrc = isProd ? `'self' ${apiOrigin}`.trim() : "'self' http://localhost:* https://*";

const imgSrc = [
  "'self'",
  'data:',
  'blob:',
  'https://images.unsplash.com',
  'https://plus.unsplash.com',
  'https://cdn.shopify.com',
  'https://res.cloudinary.com',
  ...(isProd
    ? []
    : [
        'https://example.com',
        'http://example.com',
        'https://*.example.com',
        'https://via.placeholder.com',
        'https://placehold.co',
      ]),
].join(' ');

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' ${isProd ? '' : "'unsafe-eval'"} 'unsafe-inline'`.trim(),
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  "font-src 'self'",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'isomorphic-dompurify'],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'INP', 'TTFB'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      ...(!isProd
        ? [
            {
              protocol: 'https' as const,
              hostname: 'example.com',
            },
            {
              protocol: 'https' as const,
              hostname: '**.example.com',
            },
            {
              protocol: 'http' as const,
              hostname: 'example.com',
            },
            {
              protocol: 'https' as const,
              hostname: 'via.placeholder.com',
            },
            {
              protocol: 'https' as const,
              hostname: 'placehold.co',
            },
            {
              protocol: 'http' as const,
              hostname: 'localhost',
            },
            {
              protocol: 'http' as const,
              hostname: '127.0.0.1',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const rawBackendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000/api/v1';

    // Normalize root url without /api/v1 trailing segment
    const backendRoot = rawBackendUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendRoot}/api/v1/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
