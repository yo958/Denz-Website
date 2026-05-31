import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

async function getSiteNoindex(): Promise<boolean> {
  try {
    const db = getAdminDb();
    if (!db) return false;
    const snap = await db.doc('venue-settings/website').get();
    return snap.exists ? (snap.data()?.noindex ?? false) : false;
  } catch {
    return false;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const noindex = await getSiteNoindex();

  if (noindex) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${BASE_URL}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/order', '/dashboard'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
