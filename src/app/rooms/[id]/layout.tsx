import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

const ROOM_META: Record<string, { title: string; description: string; image: string }> = {
  standard: {
    title: 'Standard Room',
    description:
      'A clean, comfortable Standard Room at Denz, Kathu, Phuket. Gigabit WiFi, air conditioning, and direct access to the café. From ฿800/night.',
    image: '/images/room-standard.png',
  },
  deluxe: {
    title: 'Deluxe Room',
    description:
      'A spacious Deluxe Room with a private balcony and mountain views at Denz, Kathu, Phuket. Gigabit WiFi, air conditioning, café access. From ฿1,200/night.',
    image: '/images/room-honeymoon.png',
  },
  suite: {
    title: 'Studio Suite',
    description:
      'A full Studio Suite with dedicated workspace, kitchenette, and mountain-view terrace at Denz, Kathu, Phuket. Ideal for longer stays. From ฿1,800/night.',
    image: '/images/room-standard.png',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const room = ROOM_META[id];

  return {
    title: room?.title ?? 'Room Details',
    description:
      room?.description ??
      'Comfortable accommodation at Denz Coworking Café, Kathu, Phuket. Gigabit WiFi, mountain views, café on site.',
    openGraph: {
      title: room ? `${room.title} | Denz Phuket` : 'Room Details | Denz Phuket',
      description: room?.description,
      url: `${BASE_URL}/rooms/${id}`,
      images: room
        ? [{ url: room.image, width: 1200, height: 630, alt: `${room.title} — Denz Phuket` }]
        : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/rooms/${id}`,
    },
  };
}

export default async function RoomDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = ROOM_META[id];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Rooms', item: `${BASE_URL}/rooms` },
      {
        '@type': 'ListItem',
        position: 3,
        name: room?.title ?? 'Room Details',
        item: `${BASE_URL}/rooms/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
