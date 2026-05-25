import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Contact — Find Us in Kathu, Phuket',
  description:
    'Find Denz in Kathu, Phuket 83120. Open Monday to Friday. Reach us on Instagram @denzphuket or swing by in person. Mountain-view coworking café.',
  keywords: [
    'denz phuket contact', 'coworking cafe kathu phuket', 'where is denz phuket',
    'denz address phuket', 'denz phuket hours',
  ],
  openGraph: {
    title: 'Contact — Find Us in Kathu, Phuket | Denz',
    description:
      'Find Denz in Kathu, Phuket 83120. Open Monday to Friday. Instagram @denzphuket.',
    url: `${BASE_URL}/contact`,
    images: [
      {
        url: '/images/hero-coworking.jpg',
        width: 1200,
        height: 630,
        alt: 'Denz Coworking Café — Kathu, Phuket',
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
