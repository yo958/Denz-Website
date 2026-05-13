'use client';

import { Wifi, Coffee, Wind, BedDouble, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { Product } from '@/types';

const FALLBACK_ROOMS: Product[] = [
  { id: 'standard', name: 'Standard Room', price: 800, category: 'rooms', description: 'A clean, comfortable room with everything you need for a short stay. Perfect for solo travellers or couples passing through.', stock: null },
  { id: 'deluxe', name: 'Deluxe Room', price: 1200, category: 'rooms', description: 'More space, better views. A spacious room with a private balcony overlooking the mountains.', stock: null },
  { id: 'suite', name: 'Studio Suite', price: 1800, category: 'rooms', description: 'A full studio suite with a dedicated workspace, kitchenette and mountain-view terrace. Ideal for longer stays.', stock: null },
];

const ROOM_FEATURES = [
  { icon: Wifi, label: 'Gigabit WiFi in every room' },
  { icon: Coffee, label: 'Direct access to the café' },
  { icon: Wind, label: 'Air conditioning' },
  { icon: BedDouble, label: 'Premium bedding' },
];

export default function RoomsPage() {
  const { data: allProducts, loading, fromFirestore } = useFirestoreSlice<Product[]>(
    'products',
    FALLBACK_ROOMS,
  );

  const rooms = allProducts.filter((p) => p.category === 'rooms' && !p.archived);
  const displayRooms = rooms.length > 0 ? rooms : FALLBACK_ROOMS;

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <Badge variant="brand" className="mb-4">Rooms</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">
                Sleep above the café
              </h1>
              <p className="text-ink-muted text-lg leading-relaxed">
                Roll out of bed, down the stairs and straight into your coworking day.
                Clean, comfortable rooms with everything a remote worker needs.
              </p>
            </div>
            {fromFirestore && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium mt-1 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live from POS
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            {ROOM_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2">
                <Icon className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium text-ink-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading rooms…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-ink-faint/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-surface-raised overflow-hidden">
                  {room.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BedDouble className="w-12 h-12 text-ink-faint" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-ink mb-2">{room.name}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed mb-5">{room.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-ink">฿{room.price.toLocaleString()}</span>
                      <span className="text-sm text-ink-muted ml-1">/night</span>
                    </div>
                    <Link
                      href={`/order?type=room&room=${room.id}`}
                      className="flex items-center gap-1.5 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
                    >
                      Enquire
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-surface-muted rounded-2xl p-6 border border-ink-faint/20 text-sm text-ink-muted">
          <strong className="text-ink">Note:</strong> Prices shown are base rates. Contact us directly for weekly or monthly rates — we offer significant discounts for longer stays. All rooms include access to the café, fast WiFi and coworking space.
        </div>
      </div>
    </>
  );
}
