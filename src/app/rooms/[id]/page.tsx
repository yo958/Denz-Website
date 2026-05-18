'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi, Coffee, Wind, BedDouble, ArrowRight, Loader2, X,
  Minus, Plus, CalendarDays, Ban, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Calendar, formatBookingDate } from '@/components/ui/Calendar';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { Product, Stay, RoomSeason } from '@/types';

const FALLBACK_ROOMS: Product[] = [
  { id: 'standard', name: 'Standard Room', price: 800, category: 'rooms', description: 'A clean, comfortable room with everything you need for a short stay. Perfect for solo travellers or couples passing through.', stock: null },
  { id: 'deluxe', name: 'Deluxe Room', price: 1200, category: 'rooms', description: 'More space, better views. A spacious room with a private balcony overlooking the mountains.', stock: null },
  { id: 'suite', name: 'Studio Suite', price: 1800, category: 'rooms', description: 'A full studio suite with a dedicated workspace, kitchenette and mountain-view terrace. Ideal for longer stays.', stock: null },
];

const ROOM_FEATURES = [
  { icon: Wifi, label: 'Gigabit WiFi' },
  { icon: Coffee, label: 'Café access' },
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

function getEffectivePrice(room: Product, dateStr: string): number {
  if (!room.seasons?.length) return room.price;
  const d = new Date(dateStr + 'T12:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const cur = m * 100 + day;
  for (const s of room.seasons as RoomSeason[]) {
    const start = s.startMonth * 100 + s.startDay;
    const end   = s.endMonth   * 100 + s.endDay;
    const inRange = start <= end
      ? cur >= start && cur <= end
      : cur >= start || cur <= end;
    if (inRange) return s.price;
  }
  return room.price;
}

interface RoomPicker {
  room: Product;
  checkIn: string;
  nights: number;
  minDate: string;
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: allProducts, loading } = useFirestoreSlice<Product[]>('products', FALLBACK_ROOMS);
  const { data: stays } = useFirestoreSlice<Stay[]>('stays', []);

  const rooms = allProducts.filter((p) => p.category === 'rooms' && !p.archived);
  const displayRooms = rooms.length > 0 ? rooms : FALLBACK_ROOMS;
  const room = displayRooms.find((r) => r.id === id);

  const todayStr = toDateValue(new Date());
  const [picker, setPicker] = useState<RoomPicker | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-ink-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <BedDouble className="w-12 h-12 text-ink-faint" />
        <h1 className="text-2xl font-bold text-ink">Room not found</h1>
        <Link href="/rooms" className="text-brand text-sm font-medium hover:underline">← Back to all rooms</Link>
      </div>
    );
  }

  // Build the ordered image list: main image first, then gallery
  const allImages = [
    ...(room.image ? [room.image] : []),
    ...(room.gallery ?? []),
  ];
  const [activeIdx, setActiveIdx] = useState(0);

  const activeStay = stays.find(s => s.status === 'active' && s.roomId === room.id);
  const availableFrom = activeStay
    ? (() => {
        if (activeStay.checkOutAt) return toDateValue(new Date(activeStay.checkOutAt));
        const d = new Date(activeStay.checkInAt);
        d.setDate(d.getDate() + activeStay.nights);
        return toDateValue(d);
      })()
    : null;

  const isBlocked = room.blocked === true;
  const cardPrice = getEffectivePrice(room, todayStr);

  function openPicker() {
    if (!room) return;
    const minCheckIn = availableFrom ?? todayStr;
    const checkIn = minCheckIn > todayStr ? minCheckIn : todayStr;
    setPicker({ room, checkIn, nights: 1, minDate: checkIn });
  }

  function confirmPicker() {
    if (!picker || !room) return;
    const { checkIn, nights } = picker;
    const checkOut = addNights(checkIn, nights);
    const total = getEffectivePrice(room, checkIn) * nights;
    router.push(
      `/order?type=room-enquiry&room=${room.id}&bookingDate=${checkIn}&nights=${nights}&checkOut=${checkOut}&estimatedTotal=${total}`
    );
    setPicker(null);
  }

  return (
    <>
      {/* Gallery */}
      <div className="relative">
        {/* Main image */}
        <div className="aspect-[16/7] sm:aspect-[16/6] bg-surface-raised overflow-hidden relative">
          {allImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeIdx}
              src={allImages[activeIdx]}
              alt={`${room.name} — photo ${activeIdx + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BedDouble className="w-16 h-16 text-ink-faint" />
            </div>
          )}

          {/* Back link */}
          <div className="absolute top-4 left-4">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-ink text-xs font-semibold px-3 py-1.5 rounded-full border border-white/40 shadow-sm hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              All rooms
            </Link>
          </div>

          {/* Prev / next arrows — only when there are multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveIdx(i => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Photo counter */}
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeIdx + 1} / {allImages.length}
                </span>
              </div>
            </>
          )}

          {/* Status badges */}
          {isBlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-ink text-sm font-semibold px-4 py-2 rounded-full border border-ink-faint/20 shadow">
                <Ban className="w-4 h-4 text-red-500" />
                Unavailable
              </span>
            </div>
          )}
          {!isBlocked && availableFrom && (
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                <Ban className="w-3 h-3" />
                Occupied until {formatBookingDate(availableFrom)}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail strip — only when there are multiple images */}
        {allImages.length > 1 && (
          <div className="flex gap-2 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-ink-faint/10 overflow-x-auto">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  i === activeIdx ? 'border-brand opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
                aria-label={`Photo ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: description */}
          <div className="lg:col-span-2">
            <Badge variant="brand" className="mb-4">Room</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">{room.name}</h1>
            <p className="text-ink-muted text-lg leading-relaxed mb-8">{room.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-10">
              {ROOM_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2">
                  <Icon className="w-4 h-4 text-brand" />
                  <span className="text-sm font-medium text-ink-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Long description */}
            {room.longDescription && (
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
                dangerouslySetInnerHTML={{ __html: room.longDescription }}
              />
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl border border-ink-faint/20 shadow-sm p-6">
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-ink-muted mr-0.5">from</span>
                  <span className="text-3xl font-bold text-ink">฿{cardPrice.toLocaleString()}</span>
                  <span className="text-sm text-ink-muted">/night</span>
                </div>
                <p className="text-xs text-ink-muted mt-1">Base rates — ask about weekly &amp; monthly discounts</p>
              </div>

              {isBlocked ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-full border border-ink-faint/20 text-sm text-ink-muted font-medium">
                  <Ban className="w-4 h-4 text-red-400" />
                  Unavailable for bookings
                </div>
              ) : (
                <button
                  onClick={openPicker}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
                >
                  Enquire now
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {!isBlocked && availableFrom && (
                <p className="text-xs text-amber-600 text-center mt-3">
                  Next available: <strong>{formatBookingDate(availableFrom)}</strong>
                </p>
              )}

              <p className="text-xs text-ink-muted text-center mt-4 leading-relaxed">
                All rooms include café access, gigabit WiFi and coworking space.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Night picker modal — same as listing page */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setPicker(null); }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[95vh]">

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

            {(() => {
              const nightRate = getEffectivePrice(picker.room, picker.checkIn);
              return (
                <div className="bg-surface-muted rounded-xl px-5 py-4 mb-6 text-center">
                  <p className="text-xs text-ink-muted mb-1">Estimated total</p>
                  <p className="text-3xl font-bold text-ink">฿{(nightRate * picker.nights).toLocaleString()}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    ฿{nightRate.toLocaleString()} × {picker.nights} night{picker.nights !== 1 ? 's' : ''}
                  </p>
                </div>
              );
            })()}

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                Check-in date
                {picker.checkIn && (
                  <span className="normal-case font-normal ml-1.5 text-ink">
                    — {formatBookingDate(picker.checkIn)}
                  </span>
                )}
              </p>
              {picker.minDate > todayStr && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                  <Ban className="w-3.5 h-3.5 shrink-0" />
                  Currently occupied — earliest check-in is <strong className="ml-1">{formatBookingDate(picker.minDate)}</strong>
                </div>
              )}
              <Calendar
                value={picker.checkIn}
                minDate={picker.minDate}
                onChange={(v) => setPicker(p => p ? { ...p, checkIn: v } : p)}
              />
            </div>

            {picker.checkIn && (
              <div className="flex items-center gap-2 text-sm text-ink-muted bg-surface-muted rounded-xl px-4 py-3 mb-6">
                <CalendarDays className="w-4 h-4 shrink-0 text-brand" />
                <span>
                  Check-out: <strong className="text-ink">{formatBookingDate(addNights(picker.checkIn, picker.nights))}</strong>
                  <span className="text-ink-muted"> ({picker.nights} night{picker.nights !== 1 ? 's' : ''})</span>
                </span>
              </div>
            )}

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
