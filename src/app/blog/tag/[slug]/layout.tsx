import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogTaxonomy } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

async function getTagBySlug(slug: string): Promise<BlogTaxonomy | null> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('blog-tags')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogTaxonomy;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  const name = tag?.name ?? slug.replace(/-/g, ' ');
  const title = `#${name} Articles | Denz Blog`;
  const description = tag?.description ?? `Browse all articles tagged #${name} from Denz Coworking & Café, Kathu, Phuket.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/blog/tag/${slug}` },
    alternates: { canonical: `${BASE_URL}/blog/tag/${slug}` },
  };
}

export default async function TagLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  const name = tag?.name ?? slug.replace(/-/g, ' ');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: `#${name}`, item: `${BASE_URL}/blog/tag/${slug}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${name} — Denz Blog`,
    description: tag?.description ?? `All articles tagged ${name}.`,
    url: `${BASE_URL}/blog/tag/${slug}`,
    isPartOf: { '@type': 'Blog', '@id': `${BASE_URL}/blog` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}
