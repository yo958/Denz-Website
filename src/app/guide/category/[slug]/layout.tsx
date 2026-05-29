import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogTaxonomy } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

async function getCategoryBySlug(slug: string): Promise<BlogTaxonomy | null> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('blog-categories')
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
  const cat = await getCategoryBySlug(slug);
  const name = cat?.name ?? slug.replace(/-/g, ' ');
  const title = `${name} Articles | Denz Guide`;
  const description = cat?.description ?? `Browse all ${name} articles from Denz Coworking & Café, Kathu, Phuket.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/guide/category/${slug}`,
    },
    alternates: { canonical: `${BASE_URL}/guide/category/${slug}` },
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  const name = cat?.name ?? slug.replace(/-/g, ' ');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/guide` },
      { '@type': 'ListItem', position: 3, name: name, item: `${BASE_URL}/guide/category/${slug}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} — Denz Guide`,
    description: cat?.description ?? `All articles in the ${name} category.`,
    url: `${BASE_URL}/guide/category/${slug}`,
    isPartOf: { '@type': 'Guide', '@id': `${BASE_URL}/guide` },
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
