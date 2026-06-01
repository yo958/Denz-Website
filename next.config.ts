import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',

  async redirects() {
    return [
      // Redirect old /blog URLs to /guide permanently (301)
      { source: '/blog', destination: '/guide', permanent: true },
      { source: '/blog/:path*', destination: '/guide/:path*', permanent: true },
      // Redirect old ID-based coworking URLs to SEO-friendly slugs (301)
      { source: '/coworking/sp-1', destination: '/coworking/hot-desk', permanent: true },
      { source: '/coworking/sp-po-b', destination: '/coworking/private-office', permanent: true },
      { source: '/coworking/sp-mozwyoaq-3qxsmw', destination: '/coworking/desk-24', permanent: true },
      { source: '/coworking/space-mozwzpya-6crsns', destination: '/coworking/desk-dual-24', permanent: true },
      { source: '/coworking/space-mozx2zfr-sixvon', destination: '/coworking/standup-desk-34', permanent: true },
      { source: '/coworking/space-mozx8ga6-34g90c', destination: '/coworking/standup-desk-dual-27', permanent: true },
      { source: '/coworking/space-mozx9bc3-t7jsvy', destination: '/coworking/desk-49-ultrawide', permanent: true },
      { source: '/coworking/space-mozxbg2z-z1eppw', destination: '/coworking/standup-desk-27', permanent: true },
      { source: '/coworking/sp-mozxw42i-sclw1x', destination: '/coworking/no-desk', permanent: true },
      // Redirect old ID-based room URLs to SEO-friendly slugs (301)
      { source: '/rooms/r1', destination: '/rooms/room-1-king-deluxe', permanent: true },
      { source: '/rooms/r2', destination: '/rooms/room-2-queen-standard', permanent: true },
      { source: '/rooms/r3', destination: '/rooms/room-3-queen-deluxe', permanent: true },
      { source: '/rooms/standard', destination: '/rooms/standard-room', permanent: true },
      { source: '/rooms/deluxe', destination: '/rooms/deluxe-room', permanent: true },
      { source: '/rooms/suite', destination: '/rooms/studio-suite', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Prevent indexing of internal/transactional pages
        source: '/(order|dashboard)(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
