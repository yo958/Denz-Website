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

export default function CoworkingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
