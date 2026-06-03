import type { Metadata } from 'next';
import { getPageSeo } from '@/lib/page-seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const DEFAULT_TITLE = 'Guides — Denz Phuket | Coworking Café Kathu';
const DEFAULT_DESC  = 'Tips, guides, and stories from Denz Coworking & Café in Kathu, Phuket. Discover the best coworking tips, local guides, and digital nomad advice.';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('guide');
  const title = seo.metaTitle || DEFAULT_TITLE;
  const desc  = seo.metaDescription || DEFAULT_DESC;
  const keywords = seo.focusKeyword
    ? [seo.focusKeyword, 'phuket guide', 'coworking phuket tips', 'digital nomad phuket', 'kathu phuket']
    : ['phuket guide', 'coworking phuket tips', 'digital nomad phuket', 'kathu phuket'];
  return {
    title: { absolute: title },
    description: desc,
    keywords,
    robots: { index: true, follow: true },
    openGraph: {
      title: `Guides | Denz Phuket`,
      description: desc,
      url: `${BASE_URL}/guide`,
      images: [{ url: '/images/hero-coworking.jpg', width: 1200, height: 630, alt: 'Denz Guide — Coworking Café Phuket' }],
    },
    alternates: { canonical: `${BASE_URL}/guide` },
  };
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/guide` },
  ],
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
