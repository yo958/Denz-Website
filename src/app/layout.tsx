import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/layout/Providers';
import { getAdminDb } from '@/lib/firebase-admin';
import { getPageSeo } from '@/lib/page-seo';
import type { DayHours, DayOfWeek } from '@/types';

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SCHEMA_DAY: Record<DayOfWeek, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

/** Read settings slice from Firestore and convert openingHours → Schema.org OpeningHoursSpecification. */
async function getOpeningHoursSpec(): Promise<object[]> {
  const FALLBACK = [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '10:00', closes: '23:30' },
  ];
  try {
    const db = getAdminDb();
    if (!db) return FALLBACK;
    const snap = await db.doc('stores/default/slices/settings').get();
    if (!snap.exists) return FALLBACK;
    const raw = snap.data() as { serialized?: string } | undefined;
    if (!raw?.serialized) return FALLBACK;
    const settings = JSON.parse(raw.serialized) as { venue?: { openingHours?: Record<DayOfWeek, DayHours> } };
    const hours = settings?.venue?.openingHours;
    if (!hours) return FALLBACK;

    // Group consecutive days with identical open/close into one spec entry.
    // Closed days get opens/closes = '00:00' per Schema.org convention.
    const specs: object[] = [];
    let i = 0;
    while (i < DAYS_OF_WEEK.length) {
      const day = DAYS_OF_WEEK[i];
      const h = hours[day];
      const opens = h?.closed ? '00:00' : (h?.open ?? '10:00');
      const closes = h?.closed ? '00:00' : (h?.close ?? '23:30');
      const dayList: string[] = [SCHEMA_DAY[day]];
      let j = i + 1;
      while (j < DAYS_OF_WEEK.length) {
        const next = hours[DAYS_OF_WEEK[j]];
        const nOpens = next?.closed ? '00:00' : (next?.open ?? '10:00');
        const nCloses = next?.closed ? '00:00' : (next?.close ?? '23:30');
        if (nOpens === opens && nCloses === closes) { dayList.push(SCHEMA_DAY[DAYS_OF_WEEK[j]]); j++; }
        else break;
      }
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayList, opens, closes });
      i = j;
    }
    return specs;
  } catch {
    return FALLBACK;
  }
}

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
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
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

// JSON-LD structured data — LocalBusiness + Organization (built dynamically)
function buildJsonLd(openingHoursSpecification: object[]) {
  return {
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
        openingHoursSpecification,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5.0',
          reviewCount: '150',
          bestRating: '5',
          worstRating: '1',
        },
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
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const openingHoursSpec = await getOpeningHoursSpec();
  const jsonLd = buildJsonLd(openingHoursSpec);
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
