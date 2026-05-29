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
