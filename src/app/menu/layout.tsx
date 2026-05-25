import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Café Menu — Food & Drinks',
  description:
    'Thai and international café food in Kathu, Phuket. Green curry, Pad Thai, Açaí bowls, flat whites, cold brew, and fresh juices — order online for pickup.',
  keywords: [
    'cafe phuket menu', 'food phuket kathu', 'thai food phuket',
    'coffee phuket', 'cafe menu phuket', 'order food phuket', 'coworking cafe food phuket',
  ],
  openGraph: {
    title: 'Café Menu — Food & Drinks | Denz Phuket',
    description:
      'Thai and international café food in Kathu, Phuket. Green curry, Pad Thai, flat whites, cold brew, and more — order online.',
    url: `${BASE_URL}/menu`,
    images: [
      {
        url: '/images/food-green-curry.jpg',
        width: 1200,
        height: 630,
        alt: 'Denz Café Menu — Kathu, Phuket',
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/menu`,
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
