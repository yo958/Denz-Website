import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Privacy Policy — Denz Phuket',
  description: 'Privacy Policy for Denz — coworking café, rooms, and restaurant in Kathu, Phuket. Learn how we collect and use your information.',
  alternates: { canonical: `${BASE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | Denz',
    description: 'Privacy Policy for Denz Phuket.',
    url: `${BASE_URL}/privacy`,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
