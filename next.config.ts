import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
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
      // ── /blog → /guide (old blog prefix) ─────────────────────────────────
      { source: '/blog', destination: '/guide', permanent: true },
      { source: '/blog/:path*', destination: '/guide/:path*', permanent: true },

      // ── Old WordPress page slugs ──────────────────────────────────────────
      { source: '/guides', destination: '/guide', permanent: true },
      { source: '/guides/', destination: '/guide', permanent: true },
      { source: '/coworking-prices', destination: '/coworking', permanent: true },
      { source: '/denz-cafe', destination: '/menu', permanent: true },
      { source: '/privacy-policy-2', destination: '/privacy', permanent: true },
      { source: '/sitemap', destination: '/', permanent: true },
      { source: '/social-links', destination: '/contact', permanent: true },

      // ── Old WooCommerce product pages → /menu ────────────────────────────
      { source: '/product', destination: '/menu', permanent: true },
      { source: '/product/:path*', destination: '/menu', permanent: true },

      // ── Old WordPress blog posts → /guide/:slug ──────────────────────────
      // All 40 posts from the live sitemap, mapped to identical slug under /guide
      { source: '/major-events-and-festivals-in-phuket-this-june', destination: '/guide/major-events-and-festivals-in-phuket-this-june', permanent: true },
      { source: '/best-time-to-visit-phuket', destination: '/guide/best-time-to-visit-phuket', permanent: true },
      { source: '/major-events-in-phuket-this-may', destination: '/guide/major-events-in-phuket-this-may', permanent: true },
      { source: '/how-to-work-remotely-in-phuket-thailand', destination: '/guide/how-to-work-remotely-in-phuket-thailand', permanent: true },
      { source: '/things-to-do-in-phuket', destination: '/guide/things-to-do-in-phuket', permanent: true },
      { source: '/best-night-markets-in-phuket-your-complete-guide', destination: '/guide/best-night-markets-in-phuket-your-complete-guide', permanent: true },
      { source: '/thailand-internet-disruption-2026-digital-nomads', destination: '/guide/thailand-internet-disruption-2026-digital-nomads', permanent: true },
      { source: '/best-e-wallets-for-foreigners-travelling-to-thailand', destination: '/guide/best-e-wallets-for-foreigners-travelling-to-thailand', permanent: true },
      { source: '/best-seafood-restaurant-in-patong', destination: '/guide/best-seafood-restaurant-in-patong', permanent: true },
      { source: '/major-events-in-phuket-this-april-2026', destination: '/guide/major-events-in-phuket-this-april-2026', permanent: true },
      { source: '/phuket-motocross', destination: '/guide/phuket-motocross', permanent: true },
      { source: '/enduro-in-phuket', destination: '/guide/enduro-in-phuket', permanent: true },
      { source: '/coworking-oasis-in-patong', destination: '/guide/coworking-oasis-in-patong', permanent: true },
      { source: '/phuket-skate-parks-complete-guide', destination: '/guide/phuket-skate-parks-complete-guide', permanent: true },
      { source: '/new-year-new-workspace-fresh-start-at-a-coworking-space-in-patong-phuket-for-2026', destination: '/guide/new-year-new-workspace-fresh-start-at-a-coworking-space-in-patong-phuket-for-2026', permanent: true },
      { source: '/things-to-do-in-patong-phuket', destination: '/guide/things-to-do-in-patong-phuket', permanent: true },
      { source: '/budget-accommodation-in-patong', destination: '/guide/budget-accommodation-in-patong', permanent: true },
      { source: '/affordable-coworking-in-patong', destination: '/guide/affordable-coworking-in-patong', permanent: true },
      { source: '/work-friendly-cafe-in-phuket', destination: '/guide/work-friendly-cafe-in-phuket', permanent: true },
      { source: '/best-burger-in-patong', destination: '/guide/best-burger-in-patong', permanent: true },
      { source: '/top-5-coworking-spaces-in-phuket-thailand', destination: '/guide/top-5-coworking-spaces-in-phuket-thailand', permanent: true },
      { source: '/best-coworking-space-in-patong', destination: '/guide/best-coworking-space-in-patong', permanent: true },
      { source: '/guide-to-coworking-in-patong', destination: '/guide/guide-to-coworking-in-patong', permanent: true },
      { source: '/major-events-and-festivals-in-phuket-this-march-2026', destination: '/guide/major-events-and-festivals-in-phuket-this-march-2026', permanent: true },
      { source: '/your-perfect-workspace-awaits-denz-coworking-desk-rentals-options', destination: '/guide/your-perfect-workspace-awaits-denz-coworking-desk-rentals-options', permanent: true },
      { source: '/coworking-phuket', destination: '/guide/coworking-phuket', permanent: true },
      { source: '/major-events-and-festivals-in-phuket-this-february-2026', destination: '/guide/major-events-and-festivals-in-phuket-this-february-2026', permanent: true },
      { source: '/the-destination-thailand-visa-dtv-complete-guide-for-remote-workers-in-2026', destination: '/guide/the-destination-thailand-visa-dtv-complete-guide-for-remote-workers-in-2026', permanent: true },
      { source: '/three-monkeys-phuket', destination: '/guide/three-monkeys-phuket', permanent: true },
      { source: '/water-sports-in-phuket', destination: '/guide/water-sports-in-phuket', permanent: true },
      { source: '/coworking-spaces-vs-coffee-shops-where-should-you-work-in-phuket', destination: '/guide/coworking-spaces-vs-coffee-shops-where-should-you-work-in-phuket', permanent: true },
      { source: '/top-coworking-spaces-in-phuket-according-to-google-maps-2026', destination: '/guide/top-coworking-spaces-in-phuket-according-to-google-maps-2026', permanent: true },
      { source: '/indica-vs-sativa-while-working-in-phuket-a-guide-for-remote-professionals', destination: '/guide/indica-vs-sativa-while-working-in-phuket-a-guide-for-remote-professionals', permanent: true },
      { source: '/networking-events-and-business-summits-in-phuket-2026-complete-guide', destination: '/guide/networking-events-and-business-summits-in-phuket-2026-complete-guide', permanent: true },
      { source: '/top-things-to-do-in-phuket', destination: '/guide/top-things-to-do-in-phuket', permanent: true },
      { source: '/denz-coworking-cafe-fastest-wifi-in-phuket', destination: '/guide/denz-coworking-cafe-fastest-wifi-in-phuket', permanent: true },
      { source: '/atv-phuket-experience-in-thailand', destination: '/guide/atv-phuket-experience-in-thailand', permanent: true },
      { source: '/best-events-and-festivals-in-phuket-this-january-2026', destination: '/guide/best-events-and-festivals-in-phuket-this-january-2026', permanent: true },
      { source: '/nomad-life-in-phuket', destination: '/guide/nomad-life-in-phuket', permanent: true },

      // ── Old WordPress coworking desk pages → new SEO slugs ───────────────
      { source: '/coworking/stand-up-desk-with-34-curved-monitor', destination: '/coworking/standup-desk-34', permanent: true },
      { source: '/coworking/stand-up-desk-rental-with-27-monitor', destination: '/coworking/standup-desk-27', permanent: true },
      { source: '/coworking/stand-up-desk-rental-with-27-monitor-2', destination: '/coworking/standup-desk-27', permanent: true },
      { source: '/coworking/stand-up-desk-rental-with-27-monitor-3', destination: '/coworking/standup-desk-27', permanent: true },
      { source: '/coworking/stand-up-desk-rental-with-dual-27-monitors', destination: '/coworking/standup-desk-dual-27', permanent: true },
      { source: '/coworking/desk-rental-with-24-curved-monitor', destination: '/coworking/desk-24', permanent: true },
      { source: '/coworking/desk-rental-with-dual-24-curved-monitors', destination: '/coworking/desk-dual-24', permanent: true },
      { source: '/coworking/desk-rental-49-inch-curved-screen', destination: '/coworking/desk-49-ultrawide', permanent: true },
      { source: '/coworking/desk-rental', destination: '/coworking/hot-desk', permanent: true },
      { source: '/coworking/dedicated-desk-rental-2', destination: '/coworking/hot-desk', permanent: true },
      { source: '/coworking/dedicated-desk-rental-3', destination: '/coworking/hot-desk', permanent: true },
      { source: '/coworking/mac-mini-rental', destination: '/coworking', permanent: true },
      { source: '/coworking/mac-mini-rental-2', destination: '/coworking', permanent: true },
      // private-office and no-desk slugs are identical on both sites — no redirect needed

      // ── Old ID-based coworking URLs (pre-existing) ────────────────────────
      { source: '/coworking/sp-1', destination: '/coworking/hot-desk', permanent: true },
      { source: '/coworking/sp-po-b', destination: '/coworking/private-office', permanent: true },
      { source: '/coworking/sp-mozwyoaq-3qxsmw', destination: '/coworking/desk-24', permanent: true },
      { source: '/coworking/space-mozwzpya-6crsns', destination: '/coworking/desk-dual-24', permanent: true },
      { source: '/coworking/space-mozx2zfr-sixvon', destination: '/coworking/standup-desk-34', permanent: true },
      { source: '/coworking/space-mozx8ga6-34g90c', destination: '/coworking/standup-desk-dual-27', permanent: true },
      { source: '/coworking/space-mozx9bc3-t7jsvy', destination: '/coworking/desk-49-ultrawide', permanent: true },
      { source: '/coworking/space-mozxbg2z-z1eppw', destination: '/coworking/standup-desk-27', permanent: true },
      { source: '/coworking/sp-mozxw42i-sclw1x', destination: '/coworking/no-desk', permanent: true },

      // ── Old WordPress room pages (/room/ → /rooms/) ───────────────────────
      { source: '/room', destination: '/rooms', permanent: true },
      { source: '/room/superior-room', destination: '/rooms/room-3-queen-deluxe', permanent: true },
      { source: '/room/coworker-room', destination: '/rooms/room-1-king-deluxe', permanent: true },
      { source: '/room/coworker-room-2', destination: '/rooms/room-2-queen-standard', permanent: true },
      { source: '/room/:path*', destination: '/rooms', permanent: true },

      // ── Old ID-based room URLs (pre-existing) ────────────────────────────
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
