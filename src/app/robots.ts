import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/order', '/dashboard'],
      },
      // Block scrapers that offer no traffic benefit
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Diffbot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
      // Allow AI assistants that drive referral traffic — ClaudeBot, PerplexityBot, Google-Extended
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
