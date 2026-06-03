import type { Metadata } from 'next';
import { getPageSeo } from '@/lib/page-seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const DEFAULT_TITLE = 'Coworking Desk Space in Phuket';
const DEFAULT_DESC  = 'Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, and private offices. Gigabit WiFi, free drinks, standing desks, printing — Mon to Fri.';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('coworking');
  const title = seo.metaTitle  || DEFAULT_TITLE;
  const desc  = seo.metaDescription || DEFAULT_DESC;
  const keywords = seo.focusKeyword
    ? [seo.focusKeyword, 'coworking phuket', 'coworking space phuket', 'desk rental phuket', 'digital nomad phuket', 'hot desk phuket', 'private office phuket', 'coworking kathu', 'work space phuket']
    : ['coworking phuket', 'coworking space phuket', 'desk rental phuket', 'digital nomad phuket', 'hot desk phuket', 'private office phuket', 'coworking kathu', 'work space phuket'];
  return {
    title,
    description: desc,
    keywords,
    openGraph: {
      title: `${title} | Denz`,
      description: desc,
      url: `${BASE_URL}/coworking`,
      images: [{ url: '/images/coworking-evening.jpg', width: 1200, height: 630, alt: 'Denz Coworking Space — Kathu, Phuket' }],
    },
    alternates: { canonical: `${BASE_URL}/coworking` },
  };
}

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

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Coworking', item: `${BASE_URL}/coworking` },
  ],
};

export default function CoworkingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coworkingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Static server-rendered content for Google — keyword-rich without JS */}
      <div className="sr-only">
        <h1>Coworking Desk Space in Kathu, Phuket — Denz</h1>
        <p>
          Denz is a coworking café in Kathu, Phuket offering hot desks, dedicated desks, and private
          offices on Patong Hill. Day passes from ฿200. Weekly, monthly, and annual packages available.
          Open Monday to Friday, 10:00 AM – 11:30 PM.
        </p>
        <h2>Hot Desk Coworking in Phuket</h2>
        <p>Walk-in coworking from ฿200/day. No reservation needed. Café seating, window desks, and balcony
          spots available. Includes gigabit WiFi and complimentary coffee and tea.</p>
        <h2>Dedicated Desk Rental in Patong</h2>
        <p>Reserve the same desk every day. Weekly from ฿1,600, monthly from ฿4,800. Your belongings stay,
          your spot is guaranteed.</p>
        <h2>Private Office Rental in Phuket</h2>
        <p>Fully enclosed private office with standing desk, external monitor, and air conditioning.
          From ฿200/hour or ฿1,400/day. Ideal for calls, confidential work, and team meetings.</p>
        <h2>External Monitor Desks — Upgrade Your Workspace</h2>
        <p>Choose a workstation with a 24&ldquo;, 27&ldquo;, 34&ldquo; ultrawide, or 49&ldquo; ultrawide monitor.
          Sit-stand (height-adjustable) desks also available. All include gigabit WiFi and free drinks.</p>
        <h2>Coworking Amenities at Denz</h2>
        <ul>
          <li>1000/1000 Mbps dual-line business WiFi</li>
          <li>Free coffee, tea and drinking water</li>
          <li>Printing and scanning (฿10/page)</li>
          <li>Lockers</li>
          <li>Air conditioning</li>
          <li>External monitors — 10 available (24&ldquo; to 49&ldquo;)</li>
          <li>Mac Mini rentals</li>
          <li>Panoramic Patong Bay views</li>
        </ul>
      </div>
      {children}
    </>
  );
}
