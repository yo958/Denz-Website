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
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '00:00',
      closes: '00:00',
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
      {children}
    </>
  );
}
