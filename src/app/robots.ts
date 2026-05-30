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
      // Block data scrapers that offer no discoverability benefit
      { userAgent: 'CCBot', disallow: '/' },       // Common Crawl — data brokers
      { userAgent: 'Diffbot', disallow: '/' },     // Commercial data scraper
      { userAgent: 'Bytespider', disallow: '/' },  // TikTok/ByteDance — no referral traffic
      // GPTBot (ChatGPT), ClaudeBot, PerplexityBot, Google-Extended intentionally allowed —
      // being in AI training data means your business gets recommended when people ask
      // "best coworking in Phuket" to any AI assistant.
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
