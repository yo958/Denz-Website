import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('blog-posts')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
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
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article | Denz Phuket',
      description: 'Read the latest articles from Denz Coworking & Café, Kathu, Phuket.',
      alternates: { canonical: `${BASE_URL}/guide/${slug}` },
    };
  }

  const title = post.metaTitle ?? `${post.title} | Denz Phuket`;
  const description = post.metaDescription ?? post.excerpt ?? `${post.title} — Denz Coworking & Café, Kathu, Phuket.`;

  return {
    title,
    description,
    keywords: post.focusKeyword ? [post.focusKeyword, ...post.categories, ...post.tags] : [...post.categories, ...post.tags],
    authors: post.author ? [{ name: post.author }] : [{ name: 'Denz Phuket', url: BASE_URL }],
    openGraph: {
      title: post.metaTitle ?? post.title,
      description,
      url: `${BASE_URL}/guide/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : ['Denz Phuket'],
      tags: [...post.categories, ...post.tags],
      images: post.featureImage
        ? [{ url: post.featureImage, width: 1200, height: 630, alt: post.title }]
        : [{ url: '/images/hero-coworking.jpg', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle ?? post.title,
      description,
      images: [post.featureImage ?? '/images/hero-coworking.jpg'],
    },
    alternates: { canonical: `${BASE_URL}/guide/${slug}` },
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Use first category for breadcrumb if present
  const firstCatSlug = post?.categories?.[0];
  const firstCatName = firstCatSlug
    ? firstCatSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/guide` },
    ...(firstCatSlug && firstCatName
      ? [{ '@type': 'ListItem', position: 3, name: firstCatName, item: `${BASE_URL}/guide/category/${firstCatSlug}` }]
      : []),
    { '@type': 'ListItem', position: firstCatSlug ? 4 : 3, name: post?.title ?? 'Article', item: `${BASE_URL}/guide/${slug}` },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const articleSchema = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.metaDescription ?? post.excerpt ?? '',
        image: post.featureImage ?? `${BASE_URL}/images/hero-coworking.jpg`,
        author: post.author
          ? { '@type': 'Person', name: post.author }
          : { '@type': 'Organization', name: 'Denz Phuket', url: BASE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'Denz Phuket',
          '@id': `${BASE_URL}/#business`,
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/denz-icon.png`,
          },
        },
        datePublished: post.publishedAt ?? post.createdAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${BASE_URL}/guide/${slug}`,
        },
        url: `${BASE_URL}/guide/${slug}`,
        keywords: post.focusKeyword ?? post.categories.join(', '),
        articleSection: post.categories.join(', ') || 'Guide',
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {children}
    </>
  );
}
