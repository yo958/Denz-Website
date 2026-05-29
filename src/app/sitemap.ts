import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogPost, BlogTaxonomy } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

async function getBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const [postsSnap, catsSnap, tagsSnap] = await Promise.all([
      db.collection('blog-posts').where('status', '==', 'published').get(),
      db.collection('blog-categories').get(),
      db.collection('blog-tags').get(),
    ]);

    const posts = postsSnap.docs.map(d => d.data() as BlogPost);
    const cats = catsSnap.docs.map(d => d.data() as BlogTaxonomy);
    const tags = tagsSnap.docs.map(d => d.data() as BlogTaxonomy);

    return [
      ...posts.map(p => ({
        url: `${BASE_URL}/guide/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...cats.map(c => ({
        url: `${BASE_URL}/guide/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...tags.map(t => ({
        url: `${BASE_URL}/guide/tag/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogEntries = await getBlogSitemapEntries();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/coworking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rooms`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Blog posts, categories, and tags (fetched live from Firestore)
    ...blogEntries,
    // Menu item detail pages (static fallback IDs)
    ...['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'].map((id) => ({
      url: `${BASE_URL}/menu/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
