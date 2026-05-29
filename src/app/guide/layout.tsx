import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Guide — Denz Phuket',
  description: 'Tips, guides, and stories from Denz Coworking & Café in Kathu, Phuket. Discover the best coworking tips, local guides, and digital nomad advice.',
  openGraph: {
    title: 'Guide | Denz Phuket',
    description: 'Tips, guides, and stories from Denz Coworking & Café in Kathu, Phuket.',
    url: `${BASE_URL}/guide`,
    images: [{ url: '/images/hero-coworking.jpg', width: 1200, height: 630, alt: 'Denz Guide — Coworking Café Phuket' }],
  },
  alternates: { canonical: `${BASE_URL}/guide` },
};

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
