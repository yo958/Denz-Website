import type { Metadata } from 'next';
import { getPageSeo } from '@/lib/page-seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const DEFAULT_TITLE = 'Rooms & Accommodation in Phuket';
const DEFAULT_DESC  = 'Comfortable rooms in Kathu, Phuket. Standard, Deluxe, and Studio Suite — all with gigabit WiFi, air conditioning, mountain views, and direct access to the café.';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('rooms');
  const title = seo.metaTitle  || DEFAULT_TITLE;
  const desc  = seo.metaDescription || DEFAULT_DESC;
  const keywords = seo.focusKeyword
    ? [seo.focusKeyword, 'rooms phuket', 'accommodation phuket', 'hotel kathu phuket', 'guesthouse phuket', 'stay phuket', 'room kathu', 'coworking accommodation phuket']
    : ['rooms phuket', 'accommodation phuket', 'hotel kathu phuket', 'guesthouse phuket', 'stay phuket', 'room kathu', 'coworking accommodation phuket'];
  return {
    title,
    description: desc,
    keywords,
    openGraph: {
      title: `${title} | Denz`,
      description: desc,
      url: `${BASE_URL}/rooms`,
      images: [{ url: '/images/room-standard.png', width: 1200, height: 630, alt: 'Denz Rooms — Kathu, Phuket' }],
    },
    alternates: { canonical: `${BASE_URL}/rooms` },
  };
}

// LodgingBusiness schema with individual HotelRoom types and pricing
const roomsSchema = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': `${BASE_URL}/rooms#lodging`,
  name: 'Denz — Rooms & Accommodation',
  description:
    'Hotel-style accommodation rooms in Kathu, Phuket. Standard, Deluxe, and Studio Suite — gigabit WiFi, mountain views, and direct café access.',
  url: `${BASE_URL}/rooms`,
  image: `${BASE_URL}/images/room-standard.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Soi 4, Soi Khuanyang',
    addressLocality: 'Pa Tong',
    addressRegion: 'Phuket',
    postalCode: '83120',
    addressCountry: 'TH',
  },
  telephone: '+66639177720',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 7.9044,
    longitude: 98.3181,
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Gigabit WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Café access', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Premium bedding', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Mountain views', value: true },
  ],
  containsPlace: [
    {
      '@type': 'HotelRoom',
      '@id': `${BASE_URL}/rooms/standard#room`,
      name: 'Standard Room',
      description:
        'A clean, comfortable room with everything you need for a short stay. Perfect for solo travellers or couples passing through.',
      url: `${BASE_URL}/rooms/standard`,
      image: `${BASE_URL}/images/room-standard.png`,
      occupancy: { '@type': 'QuantitativeValue', maxValue: 2 },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Gigabit WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Café access', value: true },
      ],
      offers: {
        '@type': 'Offer',
        price: '800',
        priceCurrency: 'THB',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '800',
          priceCurrency: 'THB',
          unitText: 'NIGHT',
        },
        url: `${BASE_URL}/rooms/standard`,
      },
    },
    {
      '@type': 'HotelRoom',
      '@id': `${BASE_URL}/rooms/deluxe#room`,
      name: 'Deluxe Room',
      description:
        'More space, better views. A spacious room with a private balcony overlooking the mountains.',
      url: `${BASE_URL}/rooms/deluxe`,
      image: `${BASE_URL}/images/room-honeymoon.png`,
      occupancy: { '@type': 'QuantitativeValue', maxValue: 2 },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Gigabit WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Mountain view balcony', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Café access', value: true },
      ],
      offers: {
        '@type': 'Offer',
        price: '1200',
        priceCurrency: 'THB',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '1200',
          priceCurrency: 'THB',
          unitText: 'NIGHT',
        },
        url: `${BASE_URL}/rooms/deluxe`,
      },
    },
    {
      '@type': 'Suite',
      '@id': `${BASE_URL}/rooms/suite#room`,
      name: 'Studio Suite',
      description:
        'A full studio suite with a dedicated workspace, kitchenette and mountain-view terrace. Ideal for longer stays.',
      url: `${BASE_URL}/rooms/suite`,
      occupancy: { '@type': 'QuantitativeValue', maxValue: 2 },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Gigabit WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Kitchenette', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Mountain-view terrace', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Dedicated workspace', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
      ],
      offers: {
        '@type': 'Offer',
        price: '1800',
        priceCurrency: 'THB',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '1800',
          priceCurrency: 'THB',
          unitText: 'NIGHT',
        },
        url: `${BASE_URL}/rooms/suite`,
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Rooms', item: `${BASE_URL}/rooms` },
  ],
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(roomsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Static server-rendered intro — ensures Google sees keyword-rich content without JS */}
      <div className="sr-only">
        <h1>WorkStay Rooms & Accommodation in Kathu, Phuket</h1>
        <p>
          Denz offers three hotel-style accommodation rooms in Kathu, Phuket, located directly above the
          coworking café on Patong Hill. Each room features 1000/1000 Mbps gigabit WiFi, air conditioning,
          panoramic Patong Bay views, and a complimentary daily hot desk pass at Denz Café.
        </p>
        <h2>Room 1 — King Deluxe</h2>
        <p>
          Work-focused king room with height-adjustable standing desk, ergonomic chair, 50&ldquo; Smart TV
          with Netflix, in-room safe, fridge, and kettle. Sweeping Patong Bay sunset views. Includes hot
          desk access at the coworking café below.
        </p>
        <h2>Room 2 — Queen Standard</h2>
        <p>
          Comfortable queen room with dedicated work setup, 1 Gbps business WiFi, Patong Bay views, and
          direct staircase access to Denz CoWorking Café. Ideal for short stays and digital nomads.
        </p>
        <h2>Room 3 — Queen Deluxe</h2>
        <p>
          Our largest room with premium finishings, sweeping 180° Patong Bay views, standing desk,
          50&ldquo; Smart TV, and full café access. The best option for longer stays in Phuket.
        </p>
        <h2>What&apos;s Included with Every Room Stay</h2>
        <ul>
          <li>1000/1000 Mbps gigabit business WiFi with backup line</li>
          <li>Complimentary daily hot desk pass at Denz Café (฿200/day value per person)</li>
          <li>Air conditioning</li>
          <li>Panoramic Patong Bay or mountain views</li>
        </ul>
        <h2>Location</h2>
        <p>
          Soi 4, Soi Khuanyang, Kathu, Pa Tong, Phuket 83120, Thailand. On Patong Hill between
          Patong Beach and Kathu — minutes from the beach with free on-site parking.
        </p>
      </div>
      {children}
    </>
  );
}
