import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Denz Coworking Cafe Phuket | Work, Eat & Explore',
    template: '%s | Denz Phuket',
  },
  description:
    'Denz is a modern coworking café in Kathu, Phuket — fast WiFi, great food, stunning mountain views and flexible desk packages.',
  keywords: ['coworking phuket', 'cafe phuket', 'digital nomad phuket', 'kathu phuket workspace'],
  icons: {
    icon: '/denz-icon.png',
    apple: '/denz-icon.png',
  },
  openGraph: {
    siteName: 'Denz Phuket',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/denz-logo.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
