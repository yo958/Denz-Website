'use client';

import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import type { Product } from '@/types';

// Static fallback shown while Firestore loads or if offline
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

const CATEGORIES: { key: 'all' | 'food' | 'drinks' | 'dessert'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'dessert', label: 'Dessert' },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'drinks' | 'dessert'>('all');
  const [justAdded, setJustAdded] = useState<string[]>([]);

  const { data: allProducts, loading, fromFirestore } = useFirestoreSlice<Product[]>(
    'products',
    FALLBACK_MENU,
  );

  const { addItem, items, count } = useCart();

  // Only show café food, drinks & desserts (not desks/rooms), filter archived
  const menuItems = allProducts.filter(
    (p) => (p.category === 'food' || p.category === 'drinks' || p.category === 'dessert') && !p.archived,
  );

  const filtered = activeCategory === 'all'
    ? menuItems
    : menuItems.filter((p) => p.category === activeCategory);

  const handleAdd = (item: Product) => {
    addItem({ id: item.id, name: item.name, price: item.price, category: item.category });
    setJustAdded((prev) => [...prev, item.id]);
    setTimeout(() => setJustAdded((prev) => prev.filter((x) => x !== item.id)), 1000);
  };

  const getQtyInCart = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const cartTotal = useCart((s) => s.total());

  return (
    <>
      {/* Food photo banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <div className="grid grid-cols-3 h-full gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/food-green-curry.jpg" alt="Thai green curry" className="w-full h-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/food-cashew-chicken.jpg" alt="Cashew chicken" className="w-full h-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/food-wrap.jpg" alt="Western food at Denz" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      </div>

      {/* Header */}
      <div className="pb-12 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="brand" className="mb-4">Café Menu</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">What&apos;s cooking?</h1>
              <p className="text-ink-muted max-w-md">
                Thai & western food, freshly prepared. Add items to your basket and place your order below.
              </p>
            </div>
            {fromFirestore && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live from POS
              </span>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-ink text-white'
                    : 'bg-surface-muted text-ink-muted hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading menu…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => {
              const inCart = getQtyInCart(item.id);
              const added = justAdded.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-ink-faint/20 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {item.image && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-surface-raised -mx-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{item.name}</p>
                      {item.glyph && <span className="text-lg leading-none">{item.glyph}</span>}
                    </div>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-ink-faint/20">
                    <p className="font-bold text-ink">฿{item.price}</p>
                    <div className="flex items-center gap-1">
                      {inCart > 0 && (
                        <span className="text-xs text-ink-muted bg-surface-muted px-2 py-1 rounded-full">
                          {inCart} in cart
                        </span>
                      )}
                      <button
                        onClick={() => handleAdd(item)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          added
                            ? 'bg-green-500 text-white'
                            : 'bg-brand text-white hover:bg-brand-dark'
                        }`}
                      >
                        {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {added ? 'Added!' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

        {/* Order CTA (when cart empty) */}
        {count() === 0 && !loading && (
          <div className="mt-16 bg-surface-muted rounded-2xl p-8 text-center border border-ink-faint/20">
            <ShoppingBag className="w-8 h-8 text-brand mx-auto mb-3" />
            <h3 className="text-xl font-bold text-ink mb-2">Add items to your order</h3>
            <p className="text-ink-muted text-sm">
              Tap <strong>Add</strong> on any item above to build your order.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
