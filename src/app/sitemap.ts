import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import { toSlug } from '@/lib/slug';
import type { BlogPost, BlogTaxonomy, CoworkSpace, Product } from '@/types';

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

async function getSliceData<T>(sliceName: string): Promise<T | null> {
  try {
    const db = getAdminDb();
    const snap = await db.doc(`stores/default/slices/${sliceName}`).get();
    if (!snap.exists) return null;
    const raw = snap.data() as { serialized?: string };
    return raw.serialized ? JSON.parse(raw.serialized) as T : null;
  } catch {
    return null;
  }
}

async function getCoworkingSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const spaces = await getSliceData<CoworkSpace[]>('spaces');
    if (!spaces) return [];
    return spaces
      .filter(s => !s.archived)
      .map(s => ({
        url: `${BASE_URL}/coworking/${toSlug(s.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

async function getRoomsSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await getSliceData<Product[]>('products');
    if (!products) return [];
    return products
      .filter(p => p.category === 'rooms' && !p.archived)
      .map(r => ({
        url: `${BASE_URL}/rooms/${toSlug(r.name)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogEntries, coworkingEntries, roomsEntries] = await Promise.all([
    getBlogSitemapEntries(),
    getCoworkingSitemapEntries(),
    getRoomsSitemapEntries(),
  ]);

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
    // Coworking space detail pages
    ...coworkingEntries,
    // Room detail pages
    ...roomsEntries,
    // Blog posts, categories, and tags (fetched live from Firestore)
    ...blogEntries,
  ];
}
