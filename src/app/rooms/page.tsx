'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, Coffee, Wind, BedDouble, ArrowRight, Loader2, X, Minus, Plus, CalendarDays, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Calendar, formatBookingDate } from '@/components/ui/Calendar';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { Product, Stay } from '@/types';

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

const MAX_NIGHTS = 90;

function toDateValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addNights(dateStr: string, nights: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + nights);
  return toDateValue(d);
}

interface RoomPicker {
  room: Product;
  checkIn: string;
  nights: number;
}

export default function RoomsPage() {
  const router = useRouter();
  const { data: allProducts, loading, fromFirestore } = useFirestoreSlice<Product[]>(
    'products',
    FALLBACK_ROOMS,
  );
  const { data: stays } = useFirestoreSlice<Stay[]>('stays', []);

  const rooms = allProducts.filter((p) => p.category === 'rooms' && !p.archived);
  const displayRooms = rooms.length > 0 ? rooms : FALLBACK_ROOMS;

  function isOccupied(roomId: string): boolean {
    return stays.some(s => s.status === 'active' && s.roomId === roomId);
  }

  const todayStr = toDateValue(new Date());
  const [picker, setPicker] = useState<RoomPicker | null>(null);

  function openPicker(room: Product) {
    setPicker({ room, checkIn: todayStr, nights: 1 });
  }

  function confirmPicker() {
    if (!picker) return;
    const { room, checkIn, nights } = picker;
    const checkOut = addNights(checkIn, nights);
    const total = room.price * nights;
    router.push(
      `/order?type=room-enquiry&room=${room.id}&bookingDate=${checkIn}&nights=${nights}&checkOut=${checkOut}&estimatedTotal=${total}`
    );
    setPicker(null);
  }

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
            {displayRooms.map((room) => {
              const unavailable = isOccupied(room.id);
              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-shadow group ${unavailable ? 'border-ink-faint/10 opacity-70' : 'border-ink-faint/20 hover:shadow-md'}`}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-surface-raised overflow-hidden relative">
                    {room.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={room.image}
                        alt={room.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${unavailable ? 'grayscale' : 'group-hover:scale-105'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BedDouble className={`w-12 h-12 ${unavailable ? 'text-ink-faint/40' : 'text-ink-faint'}`} />
                      </div>
                    )}
                    {unavailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-ink text-xs font-semibold px-3 py-1.5 rounded-full border border-ink-faint/20 shadow-sm">
                          <Ban className="w-3.5 h-3.5 text-amber-500" />
                          Occupied
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-ink mb-2">{room.name}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed mb-5">{room.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-2xl font-bold ${unavailable ? 'text-ink-muted' : 'text-ink'}`}>฿{room.price.toLocaleString()}</span>
                        <span className="text-sm text-ink-muted ml-1">/night</span>
                      </div>
                      {unavailable ? (
                        <span className="text-sm text-ink-muted font-medium px-5 py-2.5">
                          Occupied
                        </span>
                      ) : (
                        <button
                          onClick={() => openPicker(room)}
                          className="flex items-center gap-1.5 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
                        >
                          Enquire
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-surface-muted rounded-2xl p-6 border border-ink-faint/20 text-sm text-ink-muted">
          <strong className="text-ink">Note:</strong> Prices shown are base rates. Contact us directly for weekly or monthly rates — we offer significant discounts for longer stays. All rooms include access to the café, fast WiFi and coworking space.
        </div>
      </div>

      {/* Night picker modal */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setPicker(null); }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[95vh]">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink">{picker.room.name}</h3>
                <p className="text-sm text-ink-muted mt-0.5">How many nights?</p>
              </div>
              <button
                onClick={() => setPicker(null)}
                className="text-ink-muted hover:text-ink transition-colors -mt-1 -mr-1 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Night counter */}
            <div className="flex items-center justify-center gap-6 my-8">
              <button
                type="button"
                onClick={() => setPicker(p => p ? { ...p, nights: Math.max(1, p.nights - 1) } : p)}
                disabled={picker.nights <= 1}
                className="w-10 h-10 rounded-full border border-ink-faint/40 flex items-center justify-center text-ink hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-5xl font-bold text-ink">{picker.nights}</span>
                <p className="text-sm text-ink-muted mt-1">night{picker.nights !== 1 ? 's' : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => setPicker(p => p ? { ...p, nights: Math.min(MAX_NIGHTS, p.nights + 1) } : p)}
                disabled={picker.nights >= MAX_NIGHTS}
                className="w-10 h-10 rounded-full border border-ink-faint/40 flex items-center justify-center text-ink hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Estimated total */}
            <div className="bg-surface-muted rounded-xl px-5 py-4 mb-6 text-center">
              <p className="text-xs text-ink-muted mb-1">Estimated total</p>
              <p className="text-3xl font-bold text-ink">฿{(picker.room.price * picker.nights).toLocaleString()}</p>
              <p className="text-xs text-ink-muted mt-1">
                ฿{picker.room.price.toLocaleString()} × {picker.nights} night{picker.nights !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Check-in calendar */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                Check-in date
                {picker.checkIn && (
                  <span className="normal-case font-normal ml-1.5 text-ink">
                    — {formatBookingDate(picker.checkIn)}
                  </span>
                )}
              </p>
              <Calendar
                value={picker.checkIn}
                minDate={todayStr}
                onChange={(v) => setPicker(p => p ? { ...p, checkIn: v } : p)}
              />
            </div>

            {/* Check-out info */}
            {picker.checkIn && (
              <div className="flex items-center gap-2 text-sm text-ink-muted bg-surface-muted rounded-xl px-4 py-3 mb-6">
                <CalendarDays className="w-4 h-4 shrink-0 text-brand" />
                <span>
                  Check-out: <strong className="text-ink">{formatBookingDate(addNights(picker.checkIn, picker.nights))}</strong>
                  <span className="text-ink-muted"> ({picker.nights} night{picker.nights !== 1 ? 's' : ''})</span>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="flex-1 py-3 rounded-full text-sm font-medium border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-ink-faint/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPicker}
                disabled={!picker.checkIn}
                className="flex-1 py-3 rounded-full text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue to enquire
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
