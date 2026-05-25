import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Coworking Desk Space in Phuket',
  description:
    'Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, and private offices. Gigabit WiFi, free drinks, standing desks, printing — Mon to Fri.',
  keywords: [
    'coworking phuket', 'coworking space phuket', 'desk rental phuket',
    'digital nomad phuket', 'hot desk phuket', 'private office phuket',
    'coworking kathu', 'work space phuket',
  ],
  openGraph: {
    title: 'Coworking Desk Space in Phuket | Denz',
    description:
      'Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, and private offices. Gigabit WiFi included.',
    url: `${BASE_URL}/coworking`,
    images: [
      {
        url: '/images/coworking-evening.jpg',
        width: 1200,
        height: 630,
        alt: 'Denz Coworking Space — Kathu, Phuket',
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/coworking`,
  },
};

// Service schema with all desk & office pricing offers (based on standard fallback rates)
const coworkingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE_URL}/coworking#service`,
  name: 'Coworking Space — Kathu, Phuket',
  serviceType: 'Coworking Space',
  description:
    'Flexible hot desk and dedicated desk coworking in Kathu, Phuket. Hourly, daily, weekly, and monthly packages. Private offices also available.',
  provider: { '@id': `${BASE_URL}/#business` },
  areaServed: {
    '@type': 'City',
    name: 'Phuket',
    address: { '@type': 'PostalAddress', addressCountry: 'TH' },
  },
  availableAtOrFrom: { '@id': `${BASE_URL}/#business` },
  offers: [
    {
      '@type': 'Offer',
      name: 'Hot Desk — Per Hour',
      description: 'Walk-in hot desk, any available seat in the shared space.',
      price: '50',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '50',
        priceCurrency: 'THB',
        unitText: 'HOUR',
      },
      url: `${BASE_URL}/coworking`,
      eligibleRegion: { '@type': 'Country', name: 'Thailand' },
    },
    {
      '@type': 'Offer',
      name: 'Hot Desk — Per Day',
      description: 'Full-day walk-in hot desk pass.',
      price: '400',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '400',
        priceCurrency: 'THB',
        unitText: 'DAY',
      },
      url: `${BASE_URL}/coworking`,
    },
    {
      '@type': 'Offer',
      name: 'Dedicated Desk — Per Week',
      description: 'Dedicated desk reserved for you for 5 working days (Mon–Fri).',
      price: '1600',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1600',
        priceCurrency: 'THB',
        unitText: 'WEEK',
      },
      url: `${BASE_URL}/coworking`,
    },
    {
      '@type': 'Offer',
      name: 'Dedicated Desk — Monthly',
      description: 'Dedicated desk reserved for you for all working days in the month.',
      price: '4800',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '4800',
        priceCurrency: 'THB',
        unitText: 'MON',
      },
      url: `${BASE_URL}/coworking`,
    },
    {
      '@type': 'Offer',
      name: 'Private Office — Monthly',
      description: 'Fully private, lockable office for up to 4 people.',
      price: '12000',
      priceCurrency: 'THB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '12000',
        priceCurrency: 'THB',
        unitText: 'MON',
      },
      url: `${BASE_URL}/coworking`,
    },
  ],
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: '1 Gbps Fibre WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free coffee & tea', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Printing', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Lockers', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Standing desks', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
  ],
};

export default function CoworkingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coworkingSchema) }}
      />
      {children}
    </>
  );
}
