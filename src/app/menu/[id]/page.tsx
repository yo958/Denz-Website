'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { ChevronLeft, Loader2, ShoppingBag, Check, Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import { useCart } from '@/store/cart';
import type { Product } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toSlug } from '@/lib/slug';

const FALLBACK_MENU: Product[] = [
  { id: 'f1', name: 'Thai Green Curry', price: 120, category: 'food', description: 'Authentic Thai green curry with jasmine rice, chicken or tofu, fresh herbs', stock: null },
  { id: 'f2', name: 'Pad Thai', price: 100, category: 'food', description: 'Classic stir-fried rice noodles, egg, bean sprouts, crushed peanuts, lime', stock: null },
  { id: 'f3', name: 'Eggs Benedict', price: 140, category: 'food', description: 'Poached eggs on toasted English muffin, Canadian bacon, hollandaise sauce', stock: null },
  { id: 'f4', name: 'Avocado Toast', price: 120, category: 'food', description: 'Smashed avocado, sourdough, chilli flakes, microgreens, poached egg', stock: null },
  { id: 'f5', name: 'Denz Club Sandwich', price: 130, category: 'food', description: 'Triple-decker with chicken, bacon, egg, lettuce, tomato, fries', stock: null },
  { id: 'f6', name: 'Tom Yum Soup', price: 90, category: 'food', description: 'Spicy & sour Thai soup, galangal, lemongrass, kaffir lime, mushrooms', stock: null },
  { id: 'f7', name: 'Açaí Bowl', price: 150, category: 'food', description: 'Organic açaí, banana, granola, fresh seasonal fruits, honey drizzle', stock: null },
  { id: 'f8', name: 'Massaman Curry', price: 130, category: 'food', description: 'Rich, mild Thai-Muslim curry, potato, peanuts, coconut milk, jasmine rice', stock: null },
  { id: 'd1', name: 'Flat White', price: 70, category: 'drinks', description: 'Double ristretto, silky micro-foam milk, our house blend', stock: null },
  { id: 'd2', name: 'Iced Matcha Latte', price: 80, category: 'drinks', description: 'Ceremonial grade matcha, oat milk, light sweetness', stock: null },
  { id: 'd3', name: 'Fresh Mango Smoothie', price: 90, category: 'drinks', description: 'Fresh Phuket mango, banana, coconut milk, no sugar added', stock: null },
  { id: 'd4', name: 'Cold Brew', price: 85, category: 'drinks', description: '18-hour slow-steeped cold brew, served over ice', stock: null },
  { id: 'd5', name: 'Thai Milk Tea', price: 65, category: 'drinks', description: 'Classic Thai iced tea, condensed milk, strong black tea', stock: null },
  { id: 'd6', name: 'Watermelon Juice', price: 70, category: 'drinks', description: 'Fresh-pressed watermelon, mint, pinch of salt', stock: null },
  { id: 'd7', name: 'Americano', price: 60, category: 'drinks', description: 'Double shot espresso, hot or iced', stock: null },
  { id: 'd8', name: 'Cappuccino', price: 70, category: 'drinks', description: 'Espresso, equal parts steamed milk and foam', stock: null },
];

const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food',
  drinks: 'Drinks',
  dessert: 'Dessert',
};

export default function MenuItemPage() {
  const { id } = useParams<{ id: string }>();
  const [justAdded, setJustAdded] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);

  const { data: allProducts, loading } = useFirestoreSlice<Product[]>('products', FALLBACK_MENU);
  const { addItem, count } = useCart();
  const cartTotal = useCart((s) => s.total());

  const menuItems = allProducts.filter(
    (p) => (p.category === 'food' || p.category === 'drinks' || p.category === 'dessert') && !p.archived,
  );
  const item = menuItems.find((p) => toSlug(p.name) === id);

  useEffect(() => {
    if (!item) return;
    getDoc(doc(db, 'product-images', item.id)).then(snap => {
      if (snap.exists()) setProductImage(snap.data().image ?? null);
    }).catch(() => {});
  }, [item]);

  const handleAdd = () => {
    if (!item) return;
    addItem({ id: item.id, name: item.name, price: item.price, category: item.category });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-ink-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-12 h-12 text-ink-faint" />
        <h1 className="text-2xl font-bold text-ink">Item not found</h1>
        <p className="text-ink-muted text-sm">This item may have been removed from the menu.</p>
        <Link href="/menu" className="text-brand text-sm font-medium hover:underline">
          ← Back to menu
        </Link>
      </div>
    );
  }

  const heroImage = productImage ?? item.image ?? null;

  return (
    <>
      {/* Hero image — full-width, same pattern as rooms page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2">
        <nav className="flex items-center gap-1.5 text-sm mb-4" aria-label="Breadcrumb">
          <Link href="/" className="text-ink-muted hover:text-brand transition-colors">Home</Link>
          <ChevronLeft className="w-3.5 h-3.5 text-ink-faint rotate-180" />
          <Link href="/menu" className="text-ink-muted hover:text-brand transition-colors">Menu</Link>
          <ChevronLeft className="w-3.5 h-3.5 text-ink-faint rotate-180" />
          <span className="text-ink font-medium truncate">{item.name}</span>
        </nav>

        {heroImage ? (
          <div className="rounded-xl overflow-hidden aspect-[16/7] bg-surface-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          /* No image — show a subtle placeholder strip so the back link doesn't feel orphaned */
          item.glyph && (
            <div className="rounded-xl aspect-[16/7] bg-surface-muted flex items-center justify-center">
              <span className="text-8xl">{item.glyph}</span>
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: description */}
          <div className="lg:col-span-2">
            <Badge variant="brand" className="mb-4">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
              {item.name}
              {item.glyph && <span className="ml-3 text-3xl">{item.glyph}</span>}
            </h1>
            {item.description && (
              <p className="text-ink-muted text-lg leading-relaxed mb-8">{item.description}</p>
            )}

            {/* Extended description if available */}
            {item.longDescription && (
              <div
                className="
                  text-sm text-ink-muted leading-relaxed
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-6 [&_h2]:mb-2
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_h3]:mt-5 [&_h3]:mb-1
                  [&_p]:my-2
                  [&_strong]:font-semibold [&_strong]:text-ink
                  [&_em]:italic
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                  [&_li]:my-0.5
                "
                dangerouslySetInnerHTML={{ __html: item.longDescription }}
              />
            )}
          </div>

          {/* Right: order card — no image here anymore, it's the hero above */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl border border-ink-faint/20 shadow-sm p-6">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">Price</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-ink">฿{item.price}</span>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  justAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-brand text-white hover:bg-brand-dark'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to cart!
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to cart
                  </>
                )}
              </button>

              <p className="text-xs text-ink-muted text-center mt-4">
                Place your order online for pickup at the café.
              </p>
            </div>
          </div>

        </div>
      </div>

      <ReviewsSection tag="food" limit={4} title="What our customers say" subtitle="Real reviews from Google." />

      {/* Sticky cart bar */}
      {count() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/order"
            className="flex items-center gap-4 bg-ink text-white pl-5 pr-3 py-3 rounded-full shadow-2xl hover:bg-ink/90 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold text-sm">{count()} item{count() !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-white/50 text-sm">·</span>
            <span className="text-sm font-semibold">฿{cartTotal}</span>
            <span className="bg-brand text-white px-4 py-1.5 rounded-full text-xs font-bold ml-1">
              View order →
            </span>
          </Link>
        </div>
      )}
    </>
  );
}
