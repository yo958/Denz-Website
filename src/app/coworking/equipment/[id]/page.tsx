'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi, Coffee, Printer, Monitor, ArrowRight, Loader2, ChevronLeft, X, Minus, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Calendar, formatBookingDate } from '@/components/ui/Calendar';
import { TimePicker } from '@/components/ui/TimePicker';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import { useVenueSettings } from '@/hooks/useVenueSettings';
import type { Equipment, EquipmentTier, DayOfWeek } from '@/types';

const FALLBACK_EQUIPMENT: Equipment[] = [
  { id: 'mac-mini-1', name: 'Mac Mini 1', description: 'Apple Mac Mini available for hourly rental.', tiers: [{ price: 100 }] },
  { id: 'mac-mini-2', name: 'Mac Mini 2', description: 'Apple Mac Mini available for hourly rental.', tiers: [{ price: 100 }] },
];

const EQUIPMENT_FEATURES = [
  { icon: Wifi, label: '1 Gbps Fibre' },
  { icon: Coffee, label: 'Free drinks' },
  { icon: Printer, label: 'Printing' },
  { icon: Monitor, label: 'External display ready' },
];

function calcEquipTotal(tiers: EquipmentTier[], qty: number): number {
  if (!tiers.length) return 0;
  const last = tiers[tiers.length - 1];
  let total = 0;
  for (let i = 0; i < qty; i++) total += (tiers[i] ?? last).price;
  return total;
}

function equipBreakdown(tiers: EquipmentTier[], qty: number): string {
  const last = tiers[tiers.length - 1];
  const allSame = tiers.every((t) => t.price === tiers[0].price);
  if (allSame) return `฿${(tiers[0]?.price ?? 0).toLocaleString()} × ${qty} hour${qty !== 1 ? 's' : ''}`;
  const lines = Array.from({ length: qty }, (_, i) => `hr ${i + 1}: ฿${((tiers[i] ?? last).price).toLocaleString()}`);
  return lines.join(' · ');
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getVenueHoursForDate(
  openingHours: Partial<Record<DayOfWeek, { open: string; close: string; closed: boolean }>> | undefined,
  dateStr: string,
): { open: string; close: string } {
  if (!openingHours || !dateStr) return { open: '10:00', close: '23:30' };
  const day = new Date(dateStr + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;
  const h = openingHours[day];
  if (!h || h.closed) return { open: '10:00', close: '23:30' };
  return { open: h.open, close: h.close };
}

function toDateValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const venueSettings = useVenueSettings();

  const { data: rawEquipment, loading } = useFirestoreSlice<Equipment[]>('equipment', FALLBACK_EQUIPMENT);
  const allEquipment = rawEquipment.length > 0 ? rawEquipment : FALLBACK_EQUIPMENT;
  const equipment = allEquipment.find((e) => e.id === id && !e.archived);

  const todayStr = toDateValue(new Date());

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQty, setPickerQty] = useState(1);
  const [pickerDate, setPickerDate] = useState(todayStr);
  const [pickerTime, setPickerTime] = useState('10:00');

  const dayHours = getVenueHoursForDate(venueSettings.venue.openingHours, pickerDate);
  const maxHourlyHours = Math.floor((timeToMinutes(dayHours.close) - timeToMinutes(dayHours.open)) / 60);
  const maxStartTime = minutesToTime(timeToMinutes(dayHours.close) - pickerQty * 60);
  const pickerTotal = equipment ? calcEquipTotal(equipment.tiers, pickerQty) : 0;

  function openPicker() {
    const openTime = getVenueHoursForDate(venueSettings.venue.openingHours, todayStr).open;
    setPickerQty(1);
    setPickerDate(todayStr);
    setPickerTime(openTime);
    setPickerOpen(true);
  }

  function confirmPicker() {
    if (!equipment) return;
    let dateParam = pickerDate || todayStr;
    const chosen = new Date(dateParam + 'T12:00:00');
    const dow = chosen.getDay();
    if (dow === 0 || dow === 6) {
      const next = new Date(chosen);
      next.setDate(next.getDate() + (dow === 6 ? 2 : 1));
      dateParam = toDateValue(next);
    }
    const total = calcEquipTotal(equipment.tiers, pickerQty);
    router.push(`/order?type=coworking&space=${equipment.id}&period=hourly&hours=${pickerQty}&estimatedTotal=${total}&bookingDate=${dateParam}&bookingTime=${pickerTime}`);
    setPickerOpen(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-ink-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Monitor className="w-12 h-12 text-ink-faint" />
        <h1 className="text-2xl font-bold text-ink">Equipment not found</h1>
        <Link href="/coworking" className="text-brand text-sm font-medium hover:underline">← Back to coworking</Link>
      </div>
    );
  }

  const hourlyPrice = equipment.tiers[0]?.price ?? 0;

  return (
    <>
      {/* Header strip */}
      <div className="pt-24 pb-0 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <Link
            href="/coworking"
            className="inline-flex items-center gap-1.5 text-ink text-sm font-medium hover:text-brand transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            All spaces
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: description */}
          <div className="lg:col-span-2">
            <Badge variant="brand" className="mb-4">Equipment Rental</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">{equipment.name}</h1>
            {equipment.description && (
              <p className="text-ink-muted text-lg leading-relaxed mb-8">{equipment.description}</p>
            )}

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {EQUIPMENT_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2">
                  <Icon className="w-4 h-4 text-brand" />
                  <span className="text-sm font-medium text-ink-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Pricing tiers */}
            {equipment.tiers.length > 1 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-ink mb-4">Hourly pricing</h2>
                <div className="rounded-2xl border border-ink-faint/20 overflow-hidden">
                  {equipment.tiers.map((tier, i) => (
                    <div key={i} className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-ink-faint/20' : ''}`}>
                      <span className="text-ink-muted">
                        {i === equipment.tiers.length - 1 && equipment.tiers.length > 1
                          ? `Hour ${i + 1}+`
                          : `Hour ${i + 1}`}
                      </span>
                      <span className="font-bold text-ink tabular-nums">฿{tier.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long description */}
            {equipment.longDescription && (
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
                dangerouslySetInnerHTML={{ __html: equipment.longDescription }}
              />
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl border border-ink-faint/20 shadow-sm p-6">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">From</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-ink">฿{hourlyPrice.toLocaleString()}</span>
                <span className="text-sm text-ink-muted ml-1">/ per hour</span>
              </div>

              <button
                onClick={openPicker}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
              >
                Rent this
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-ink-muted text-center mt-4 leading-relaxed">
                Includes café access, gigabit WiFi and printing.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Booking modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false); }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[95vh]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink">{equipment.name}</h3>
                <p className="text-sm text-ink-muted mt-0.5">How many hours do you need?</p>
              </div>
              <button onClick={() => setPickerOpen(false)} className="text-ink-muted hover:text-ink transition-colors -mt-1 -mr-1 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center justify-center gap-6 my-8">
              <button
                onClick={() => setPickerQty((q) => Math.max(1, q - 1))}
                disabled={pickerQty <= 1}
                className="w-10 h-10 rounded-full border border-ink-faint/40 flex items-center justify-center text-ink hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-5xl font-bold text-ink">{pickerQty}</span>
                <p className="text-sm text-ink-muted mt-1">hour{pickerQty !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => {
                  const newQty = Math.min(maxHourlyHours, pickerQty + 1);
                  setPickerQty(newQty);
                  const newMax = minutesToTime(timeToMinutes(dayHours.close) - newQty * 60);
                  if (pickerTime > newMax) setPickerTime(newMax);
                }}
                disabled={pickerQty >= maxHourlyHours}
                className="w-10 h-10 rounded-full border border-ink-faint/40 flex items-center justify-center text-ink hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Estimated total */}
            <div className="bg-surface-muted rounded-xl px-5 py-4 mb-6 text-center">
              <p className="text-xs text-ink-muted mb-1">Estimated total</p>
              <p className="text-3xl font-bold text-ink">฿{pickerTotal.toLocaleString()}</p>
              <p className="text-xs text-ink-muted mt-1">{equipBreakdown(equipment.tiers, pickerQty)}</p>
            </div>

            {/* Date + time */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                Start date{pickerDate && <span className="normal-case font-normal ml-1.5 text-ink">— {formatBookingDate(pickerDate)}</span>}
              </p>
              <Calendar value={pickerDate} minDate={todayStr} onChange={setPickerDate} disableWeekends />
              <div className="mt-3">
                <TimePicker value={pickerTime} min={dayHours.open} max={maxStartTime} onChange={setPickerTime} />
              </div>
              <p className="text-xs text-ink-muted mt-2">Select today to arrive now, or a future date to reserve your spot.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPickerOpen(false)} className="flex-1 py-3 rounded-full text-sm font-medium border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-ink-faint/60 transition-colors">
                Cancel
              </button>
              <button onClick={confirmPicker} className="flex-1 py-3 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink/80 transition-colors flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
