import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Equipment Rental',
    description:
      'Hourly equipment rental at Denz Coworking Café, Kathu, Phuket. Mac Minis and more — includes gigabit WiFi, café access, and printing.',
    openGraph: {
      url: `${BASE_URL}/coworking/equipment/${id}`,
      images: [
        {
          url: '/images/coworking-evening.jpg',
          width: 1200,
          height: 630,
          alt: 'Denz Equipment Rental — Kathu, Phuket',
        },
      ],
    },
    alternates: {
      canonical: `${BASE_URL}/coworking/equipment/${id}`,
    },
  };
}

export default async function EquipmentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Coworking', item: `${BASE_URL}/coworking` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Equipment Rental',
        item: `${BASE_URL}/coworking/equipment/${id}`,
      },
    ],
  };

  // Product schema for rentable equipment
  // Pricing uses the standard Mac Mini fallback rate; the real rate loads client-side from Firestore
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Equipment Rental',
    description:
      'Hourly equipment rental at Denz Coworking Café — Mac Minis and workstation gear. Includes gigabit WiFi, café access, and printing.',
    url: `${BASE_URL}/coworking/equipment/${id}`,
    brand: { '@type': 'Brand', name: 'Denz' },
    offers: {
      '@type': 'Offer',
      price: '100',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '100',
        priceCurrency: 'THB',
        unitText: 'HOUR',
      },
      seller: { '@id': `${BASE_URL}/#business` },
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
