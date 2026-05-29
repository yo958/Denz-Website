import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://denzphuket.com';

interface ItemMeta {
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drinks' | 'dessert';
}

// Matches FALLBACK_MENU in src/app/menu/page.tsx — used for server-side metadata generation
const ITEM_META: Record<string, ItemMeta> = {
  f1: { name: 'Thai Green Curry', description: 'Authentic Thai green curry with jasmine rice, chicken or tofu, fresh herbs.', price: 120, category: 'food' },
  f2: { name: 'Pad Thai', description: 'Classic stir-fried rice noodles, egg, bean sprouts, crushed peanuts, lime.', price: 100, category: 'food' },
  f3: { name: 'Eggs Benedict', description: 'Poached eggs on toasted English muffin, Canadian bacon, hollandaise sauce.', price: 140, category: 'food' },
  f4: { name: 'Avocado Toast', description: 'Smashed avocado, sourdough, chilli flakes, microgreens, poached egg.', price: 120, category: 'food' },
  f5: { name: 'Denz Club Sandwich', description: 'Triple-decker with chicken, bacon, egg, lettuce, tomato, fries.', price: 130, category: 'food' },
  f6: { name: 'Tom Yum Soup', description: 'Spicy & sour Thai soup, galangal, lemongrass, kaffir lime, mushrooms.', price: 90, category: 'food' },
  f7: { name: 'Açaí Bowl', description: 'Organic açaí, banana, granola, fresh seasonal fruits, honey drizzle.', price: 150, category: 'food' },
  f8: { name: 'Massaman Curry', description: 'Rich, mild Thai-Muslim curry, potato, peanuts, coconut milk, jasmine rice.', price: 130, category: 'food' },
  d1: { name: 'Flat White', description: 'Double ristretto, silky micro-foam milk, our house blend.', price: 70, category: 'drinks' },
  d2: { name: 'Iced Matcha Latte', description: 'Ceremonial grade matcha, oat milk, light sweetness.', price: 80, category: 'drinks' },
  d3: { name: 'Fresh Mango Smoothie', description: 'Fresh Phuket mango, banana, coconut milk, no sugar added.', price: 90, category: 'drinks' },
  d4: { name: 'Cold Brew', description: '18-hour slow-steeped cold brew, served over ice.', price: 85, category: 'drinks' },
  d5: { name: 'Thai Milk Tea', description: 'Classic Thai iced tea, condensed milk, strong black tea.', price: 65, category: 'drinks' },
  d6: { name: 'Watermelon Juice', description: 'Fresh-pressed watermelon, mint, pinch of salt.', price: 70, category: 'drinks' },
  d7: { name: 'Americano', description: 'Double shot espresso, hot or iced.', price: 60, category: 'drinks' },
  d8: { name: 'Cappuccino', description: 'Espresso, equal parts steamed milk and foam.', price: 70, category: 'drinks' },
};

const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food',
  drinks: 'Drinks',
  dessert: 'Dessert',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = ITEM_META[id];
  const title = item ? item.name : 'Menu Item';
  const catLabel = item ? CATEGORY_LABEL[item.category] : 'Café';
  const description = item
    ? `${item.name} at Denz Café, Kathu, Phuket — ${item.description} ฿${item.price}.`
    : 'Fresh café food and drinks at Denz Coworking Café, Kathu, Phuket. Order online.';

  return {
    title: `${title} — ${catLabel} | Denz Phuket`,
    description,
    openGraph: {
      title: `${title} | Denz Phuket`,
      description,
      url: `${BASE_URL}/menu/${id}`,
      images: [
        {
          url: '/images/food-green-curry.jpg',
          width: 1200,
          height: 630,
          alt: `${title} — Denz Café, Kathu, Phuket`,
        },
      ],
    },
    alternates: {
      canonical: `${BASE_URL}/menu/${id}`,
    },
  };
}

export default async function MenuItemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = ITEM_META[id];
  const itemName = item?.name ?? 'Menu Item';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: `${BASE_URL}/menu` },
      { '@type': 'ListItem', position: 3, name: itemName, item: `${BASE_URL}/menu/${id}` },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    description: item?.description ?? 'Fresh café food and drinks at Denz Coworking Café, Kathu, Phuket.',
    url: `${BASE_URL}/menu/${id}`,
    brand: { '@type': 'Brand', name: 'Denz' },
    offers: {
      '@type': 'Offer',
      price: String(item?.price ?? 0),
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${BASE_URL}/#business` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
