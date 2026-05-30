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

// Menu schema with MenuSection and MenuItem entries (based on standard fallback items)
const menuSchema = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  '@id': `${BASE_URL}/menu#menu`,
  name: 'Denz Café Menu',
  description: 'Thai and international café menu — food and drinks served at Denz, Kathu, Phuket.',
  url: `${BASE_URL}/menu`,
  inLanguage: 'en',
  hasMenuSection: [
    {
      '@type': 'MenuSection',
      name: 'Food',
      hasMenuItem: [
        {
          '@type': 'MenuItem',
          name: 'Thai Green Curry',
          description: 'Authentic Thai green curry with jasmine rice, chicken or tofu, fresh herbs.',
          offers: { '@type': 'Offer', price: '120', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VegetarianDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Pad Thai',
          description: 'Classic stir-fried rice noodles, egg, bean sprouts, crushed peanuts, lime.',
          offers: { '@type': 'Offer', price: '100', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Eggs Benedict',
          description: 'Poached eggs on toasted English muffin, Canadian bacon, hollandaise sauce.',
          offers: { '@type': 'Offer', price: '140', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Avocado Toast',
          description: 'Smashed avocado, sourdough, chilli flakes, microgreens, poached egg.',
          offers: { '@type': 'Offer', price: '120', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VegetarianDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Denz Club Sandwich',
          description: 'Triple-decker with chicken, bacon, egg, lettuce, tomato, fries.',
          offers: { '@type': 'Offer', price: '130', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Tom Yum Soup',
          description: 'Spicy & sour Thai soup, galangal, lemongrass, kaffir lime, mushrooms.',
          offers: { '@type': 'Offer', price: '90', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Açaí Bowl',
          description: 'Organic açaí, banana, granola, fresh seasonal fruits, honey drizzle.',
          offers: { '@type': 'Offer', price: '150', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Massaman Curry',
          description: 'Rich, mild Thai-Muslim curry, potato, peanuts, coconut milk, jasmine rice.',
          offers: { '@type': 'Offer', price: '130', priceCurrency: 'THB' },
        },
      ],
    },
    {
      '@type': 'MenuSection',
      name: 'Drinks',
      hasMenuItem: [
        {
          '@type': 'MenuItem',
          name: 'Flat White',
          description: 'Double ristretto, silky micro-foam milk, our house blend.',
          offers: { '@type': 'Offer', price: '70', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Iced Matcha Latte',
          description: 'Ceremonial grade matcha, oat milk, light sweetness.',
          offers: { '@type': 'Offer', price: '80', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Fresh Mango Smoothie',
          description: 'Fresh Phuket mango, banana, coconut milk, no sugar added.',
          offers: { '@type': 'Offer', price: '90', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Cold Brew',
          description: '18-hour slow-steeped cold brew, served over ice.',
          offers: { '@type': 'Offer', price: '85', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Thai Milk Tea',
          description: 'Classic Thai iced tea, condensed milk, strong black tea.',
          offers: { '@type': 'Offer', price: '65', priceCurrency: 'THB' },
        },
        {
          '@type': 'MenuItem',
          name: 'Watermelon Juice',
          description: 'Fresh-pressed watermelon, mint, pinch of salt.',
          offers: { '@type': 'Offer', price: '70', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Americano',
          description: 'Double shot espresso, hot or iced.',
          offers: { '@type': 'Offer', price: '60', priceCurrency: 'THB' },
          suitableForDiet: 'https://schema.org/VeganDiet',
        },
        {
          '@type': 'MenuItem',
          name: 'Cappuccino',
          description: 'Espresso, equal parts steamed milk and foam.',
          offers: { '@type': 'Offer', price: '70', priceCurrency: 'THB' },
        },
      ],
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Menu', item: `${BASE_URL}/menu` },
  ],
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
