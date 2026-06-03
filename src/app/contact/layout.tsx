import type { Metadata } from 'next';
import { getPageSeo } from '@/lib/page-seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const DEFAULT_TITLE = 'Contact — Find Us in Kathu, Phuket';
const DEFAULT_DESC  = 'Find Denz in Kathu, Phuket 83120. Open Monday to Friday. Reach us on Instagram @denzphuket or swing by in person. Mountain-view coworking café.';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('contact');
  const title = seo.metaTitle  || DEFAULT_TITLE;
  const desc  = seo.metaDescription || DEFAULT_DESC;
  const keywords = seo.focusKeyword
    ? [seo.focusKeyword, 'denz phuket contact', 'coworking cafe kathu phuket', 'where is denz phuket', 'denz address phuket', 'denz phuket hours']
    : ['denz phuket contact', 'coworking cafe kathu phuket', 'where is denz phuket', 'denz address phuket', 'denz phuket hours'];
  return {
    title,
    description: desc,
    keywords,
    openGraph: {
      title: `${title} | Denz`,
      description: desc,
      url: `${BASE_URL}/contact`,
      images: [{ url: '/images/hero-coworking.jpg', width: 1200, height: 630, alt: 'Denz Coworking Café — Kathu, Phuket' }],
    },
    alternates: { canonical: `${BASE_URL}/contact` },
  };
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
  ],
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#business`,
  name: 'Denz',
  url: BASE_URL,
  telephone: '+66639177720',
  email: 'hello@denzphuket.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Soi 4, Soi Khuanyang',
    addressLocality: 'Pa Tong',
    addressRegion: 'Phuket',
    postalCode: '83120',
    addressCountry: 'TH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 7.9044,
    longitude: 98.3181,
  },
  hasMap: 'https://maps.app.goo.gl/DvhWG46V5XLVdurTA',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '23:30',
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Thai'],
    sameAs: 'https://instagram.com/denzphuket',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      {/* Static server-rendered content for Google */}
      <div className="sr-only">
        <h1>Find Denz Coworking Café in Kathu, Phuket</h1>
        <p>
          Denz is located in Kathu, Phuket, Thailand — on Patong Hill between Patong Beach and Kathu town.
          Address: Soi 4, Soi Khuanyang, Pa Tong, Phuket 83120.
        </p>
        <h2>Opening Hours</h2>
        <p>Monday to Friday: 10:00 AM – 11:30 PM. Kitchen: 11:00 AM – 10:00 PM. Closed Saturdays and Sundays.</p>
        <h2>How to Get to Denz from Patong</h2>
        <p>
          Head towards Kathu from Patong, descend the hill past Wyndham Sea Pearl Resort. At the bottom,
          look for Patong Rescue Centre on your left. Turn right into Soi Khuanyang. Drive straight ahead
          past several side streets and speed bumps — Denz is on your left up Soi 4.
        </p>
        <h2>Contact Denz Phuket</h2>
        <p>Phone: +66 63 917 7720. Instagram: @denzphuket. Facebook: /denzphuket. Free parking available.</p>
      </div>
      {children}
    </>
  );
}
