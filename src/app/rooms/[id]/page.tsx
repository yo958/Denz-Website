'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi, Coffee, Wind, BedDouble, ArrowRight, Loader2, X,
  Minus, Plus, CalendarDays, Ban, ChevronLeft, LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Calendar, formatBookingDate } from '@/components/ui/Calendar';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import { toSlug } from '@/lib/slug';
import type { Product, Stay, RoomSeason } from '@/types';

const FALLBACK_ROOMS: Product[] = [
  { id: 'coworker-room-1', name: 'Coworker Room 1', price: 2000, category: 'rooms', description: 'Work-focused room with height-adjustable standing desk, ergonomic chair, 50" Smart TV with Netflix, in-room safe, fridge, kettle, and Patong Bay views. Hot desk at Denz Café included.', stock: null },
  { id: 'workstay-room-2', name: 'WorkStay Room 2', price: 2000, category: 'rooms', description: 'Private WorkStay room with full work setup, business-grade 1000/1000 Mbps WiFi, Patong Bay views, and direct access to Denz CoWorking Café upstairs.', stock: null },
  { id: 'superior-room', name: 'Superior Room', price: 2500, category: 'rooms', description: 'Our largest room with premium finishings, sweeping Patong Bay sunset views, standing desk, 50" Smart TV, and full coworking café access included.', stock: null },
];

const ROOM_FEATURES = [
  { icon: Wifi, label: '1000/1000 Mbps WiFi + backup line' },
  { icon: Coffee, label: 'Hot desk at Denz Café included' },
  { icon: Wind, label: 'Air conditioning' },
  { icon: BedDouble, label: 'Standing desk, ergonomic chair, 50" Smart TV' },
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

function getSeasonName(room: Product, dateStr: string): string | undefined {
  if (!room.seasons?.length) return undefined;
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
    if (inRange) return s.name;
  }
  return undefined;
}

/** Sum nightly rates across each individual night of the stay. */
function getTotalPrice(room: Product, checkInStr: string, nights: number): number {
  let total = 0;
  for (let i = 0; i < nights; i++) {
    total += getEffectivePrice(room, addNights(checkInStr, i));
  }
  return total;
}

/** Group consecutive nights sharing the same rate for display. */
function getPriceBreakdown(room: Product, checkInStr: string, nights: number): Array<{ nights: number; rate: number; seasonName?: string }> {
  const segments: Array<{ nights: number; rate: number; seasonName?: string }> = [];
  for (let i = 0; i < nights; i++) {
    const nightStr = addNights(checkInStr, i);
    const rate = getEffectivePrice(room, nightStr);
    const seasonName = getSeasonName(room, nightStr);
    const last = segments[segments.length - 1];
    if (last && last.rate === rate) {
      last.nights++;
    } else {
      segments.push({ nights: 1, rate, seasonName });
    }
  }
  return segments;
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
  const room = displayRooms.find((r) => toSlug(r.name) === id);

  const todayStr = toDateValue(new Date());
  const [picker, setPicker] = useState<RoomPicker | null>(null);
  // -1 = lightbox closed; 0+ = open at that image index
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  // Build image list before early returns (room may be undefined here)
  const allImages = [
    ...(room?.image ? [room.image] : []),
    ...(room?.gallery ?? []),
  ];

  // Escape key closes the gallery; lock body scroll when open
  useEffect(() => {
    if (lightboxIdx < 0) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxIdx(-1); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightboxIdx]);

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

  const activeStay = stays.find(s => {
    if (s.status !== 'active' || s.roomId !== room.id) return false;
    const checkIn = toDateValue(new Date(s.checkInAt));
    return checkIn <= todayStr;
  });
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
    const total = getTotalPrice(room, checkIn, nights);
    router.push(
      `/order?type=room-enquiry&room=${room.id}&bookingDate=${checkIn}&nights=${nights}&checkOut=${checkOut}&estimatedTotal=${total}`
    );
    setPicker(null);
  }

  return (
    <>
      {/* Photo grid — contained with page padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-4" aria-label="Breadcrumb">
          <Link href="/" className="text-ink-muted hover:text-brand transition-colors">Home</Link>
          <ChevronLeft className="w-3.5 h-3.5 text-ink-faint rotate-180" />
          <Link href="/rooms" className="text-ink-muted hover:text-brand transition-colors">Rooms</Link>
          <ChevronLeft className="w-3.5 h-3.5 text-ink-faint rotate-180" />
          <span className="text-ink font-medium truncate">{room.name}</span>
        </nav>

        {/* Grid container — rounded corners clip all images */}
        <div className="relative rounded-xl overflow-hidden">

          {allImages.length === 0 ? (
            /* No images */
            <div className="aspect-[16/7] bg-surface-raised flex items-center justify-center">
              <BedDouble className="w-16 h-16 text-ink-faint" />
            </div>

          ) : allImages.length === 1 ? (
            /* Single image — full-width hero */
            <button
              onClick={() => setLightboxIdx(0)}
              className="block w-full aspect-[16/7] bg-surface-raised overflow-hidden cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allImages[0]} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </button>

          ) : (
            /* Airbnb-style grid: large left + 2×2 right */
            <div className="grid grid-cols-[55fr_22.5fr_22.5fr] grid-rows-2 gap-1.5 aspect-[16/7]">

              {/* Large left image */}
              <button
                onClick={() => setLightboxIdx(0)}
                className="row-span-2 relative overflow-hidden group focus:outline-none cursor-zoom-in"
                aria-label="Open photo gallery"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={allImages[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </button>

              {/* 4 right-side cells (indices 1–4) */}
              {([1, 2, 3, 4] as const).map((i) => {
                const src = allImages[i];
                const isLastSlot = i === 4;
                const extraCount = allImages.length - 5;
                const showMore = isLastSlot && extraCount > 0;

                if (!src) {
                  return <div key={i} className="bg-surface-raised" />;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className="relative overflow-hidden group focus:outline-none cursor-zoom-in"
                    aria-label={`Photo ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {showMore && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-1.5 pointer-events-none">
                        <LayoutGrid className="w-5 h-5" />
                        <span className="text-sm font-semibold">+{extraCount}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── "Show all photos" pill — bottom-right of grid ── */}
          {allImages.length > 1 && (
            <button
              onClick={() => setLightboxIdx(0)}
              className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 bg-white text-ink text-xs font-semibold px-3 py-2 rounded-lg border border-ink-faint/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Show all photos
            </button>
          )}

          {/* ── Status badges ── */}
          {isBlocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-ink text-sm font-semibold px-4 py-2 rounded-full border border-ink-faint/20 shadow">
                <Ban className="w-4 h-4 text-red-500" />
                Unavailable
              </span>
            </div>
          )}
          {!isBlocked && availableFrom && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                <Ban className="w-3 h-3" />
                Occupied until {formatBookingDate(availableFrom)}
              </span>
            </div>
          )}

        </div>
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
              const total = getTotalPrice(picker.room, picker.checkIn, picker.nights);
              const breakdown = getPriceBreakdown(picker.room, picker.checkIn, picker.nights);
              return (
                <div className="bg-surface-muted rounded-xl px-5 py-4 mb-6 text-center">
                  <p className="text-xs text-ink-muted mb-1">Estimated total</p>
                  <p className="text-3xl font-bold text-ink">฿{total.toLocaleString()}</p>
                  <div className="mt-1 space-y-0.5">
                    {breakdown.map((seg, i) => (
                      <p key={i} className="text-xs text-ink-muted">
                        ฿{seg.rate.toLocaleString()} × {seg.nights} night{seg.nights !== 1 ? 's' : ''}
                        {seg.seasonName ? <span className="ml-1 text-ink-muted/70">({seg.seasonName})</span> : null}
                      </p>
                    ))}
                  </div>
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

      {/* ── Photo tour (Airbnb-style full-page scrollable gallery) ── */}
      {lightboxIdx >= 0 && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">

          {/* Sticky header */}
          <div className="shrink-0 bg-white border-b border-ink-faint/10 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
              <button
                onClick={() => setLightboxIdx(-1)}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-ink-faint/30 hover:border-ink-faint/60 text-ink transition-colors cursor-pointer shrink-0"
                aria-label="Close gallery"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold text-ink tracking-tight">Photo tour</h2>
              <span className="text-sm text-ink-muted tabular-nums shrink-0">{allImages.length} photo{allImages.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Thumbnail navigation strip */}
            {allImages.length > 1 && (
              <div className="max-w-4xl mx-auto px-6 pb-4 flex gap-3 overflow-x-auto">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => document.getElementById(`gallery-img-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                    aria-label={`Jump to photo ${i + 1}`}
                  >
                    <div className="w-[72px] h-[52px] rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-ink-faint/50 transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-ink-muted leading-none">Photo {i + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable photo grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-3">
              {/* 2-column grid — pair photos */}
              {Array.from({ length: Math.ceil(allImages.length / 2) }).map((_, rowIdx) => {
                const a = allImages[rowIdx * 2];
                const b = allImages[rowIdx * 2 + 1];
                return (
                  <div key={rowIdx} className={`grid gap-3 ${b ? 'grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>
                    <div id={`gallery-img-${rowIdx * 2}`} className="rounded-2xl overflow-hidden aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a} alt={`${room.name} — photo ${rowIdx * 2 + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {b && (
                      <div id={`gallery-img-${rowIdx * 2 + 1}`} className="rounded-2xl overflow-hidden aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b} alt={`${room.name} — photo ${rowIdx * 2 + 2}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Bottom breathing room */}
            <div className="h-12" />
          </div>

        </div>
      )}
    </>
  );
}
