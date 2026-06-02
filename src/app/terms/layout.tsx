import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

export const metadata: Metadata = {
  title: 'Terms of Service — Denz Phuket',
  description: 'Terms of Service for Denz — coworking café, rooms, and restaurant in Kathu, Phuket.',
  alternates: { canonical: `${BASE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service | Denz',
    description: 'Terms of Service for Denz Phuket.',
    url: `${BASE_URL}/terms`,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
