import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/layout/Providers';
import { getAdminDb } from '@/lib/firebase-admin';
import { getPageSeo } from '@/lib/page-seo';

async function getSiteNoindex(): Promise<boolean> {
  try {
    const db = getAdminDb();
    if (!db) return false;
    const snap = await db.doc('venue-settings/website').get();
    return snap.exists ? (snap.data()?.noindex ?? false) : false;
  } catch {
    return false;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const [noindex, homeSeo] = await Promise.all([getSiteNoindex(), getPageSeo('home')]);
  const defaultTitle = homeSeo.metaTitle  || 'Denz Coworking Cafe Phuket | Work, Eat & Explore';
  const defaultDesc  = homeSeo.metaDescription || 'Denz is a coworking café in Kathu, Phuket with gigabit WiFi, mountain views, Thai & western food, private offices, and flexible day desk packages from ฿200. Open Mon–Fri.';
  const keywords = homeSeo.focusKeyword
    ? [homeSeo.focusKeyword, 'coworking phuket', 'cafe phuket', 'digital nomad phuket', 'kathu phuket workspace', 'coworking space phuket', 'desk rental phuket']
    : ['coworking phuket', 'cafe phuket', 'digital nomad phuket', 'kathu phuket workspace', 'coworking space phuket', 'desk rental phuket'];
  return {
    metadataBase: new URL(BASE_URL),
    ...(noindex && { robots: { index: false, follow: false } }),
    title: {
      default: defaultTitle,
      template: '%s | Denz Phuket',
    },
    description: defaultDesc,
    keywords,
    authors: [{ name: 'Denz Phuket', url: BASE_URL }],
    icons: {
      icon: '/denz-icon.png',
      apple: '/denz-icon.png',
    },
    openGraph: {
      siteName: 'Denz Phuket',
      locale: 'en_US',
      type: 'website',
      url: BASE_URL,
      title: defaultTitle,
      description: defaultDesc,
      images: [{ url: '/images/hero-coworking.jpg', width: 1200, height: 630, alt: 'Denz Coworking Café — Kathu, Phuket' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDesc,
      images: ['/images/hero-coworking.jpg'],
      site: '@denzphuket',
    },
    alternates: { canonical: BASE_URL },
  };
}

// JSON-LD structured data — LocalBusiness + Organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'CafeOrCoffeeShop'],
      '@id': `${BASE_URL}/#business`,
      name: 'Denz',
      description: 'Modern coworking café in Kathu, Phuket — fast WiFi, great food, mountain views and flexible desk packages.',
      url: BASE_URL,
      logo: `${BASE_URL}/denz-logo.png`,
      image: `${BASE_URL}/images/hero-coworking.jpg`,
      telephone: '+66639177720',
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
      sameAs: [
        'https://instagram.com/denzphuket',
        'https://facebook.com/denzphuket',
      ],
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: '1 Gbps WiFi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free coffee & tea', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Printing', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Lockers', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Standing desks', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
      ],
      hasMap: 'https://maps.app.goo.gl/DvhWG46V5XLVdurTA',
      priceRange: '฿฿',
      currenciesAccepted: 'THB',
      paymentAccepted: 'Cash, Credit Card',
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Denz Phuket',
      description: 'Coworking café in Kathu, Phuket',
      publisher: { '@id': `${BASE_URL}/#business` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/guide?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
