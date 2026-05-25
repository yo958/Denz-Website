import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Rooms & Accommodation in Phuket',
  description:
    'Comfortable rooms in Kathu, Phuket. Standard, Deluxe, and Studio Suite — all with gigabit WiFi, air conditioning, mountain views, and direct access to the café.',
  keywords: [
    'rooms phuket', 'accommodation phuket', 'hotel kathu phuket',
    'guesthouse phuket', 'stay phuket', 'room kathu', 'coworking accommodation phuket',
  ],
  openGraph: {
    title: 'Rooms & Accommodation in Phuket | Denz',
    description:
      'Comfortable rooms in Kathu, Phuket. Standard, Deluxe, and Studio Suite — gigabit WiFi, mountain views, café on site.',
    url: `${BASE_URL}/rooms`,
    images: [
      {
        url: '/images/room-standard.png',
        width: 1200,
        height: 630,
        alt: 'Denz Rooms — Kathu, Phuket',
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/rooms`,
  },
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
