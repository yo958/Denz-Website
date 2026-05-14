'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Wifi, Coffee, Printer, Lock, Users, Zap, Loader2, X, Minus, Plus, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Calendar, formatBookingDate } from '@/components/ui/Calendar';
import { TimePicker } from '@/components/ui/TimePicker';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import { useVenueSettings } from '@/hooks/useVenueSettings';
import type { CoworkSpace, CoworkSpaceRate, CoworkRatePeriod, DayOfWeek, Equipment, EquipmentTier } from '@/types';

const PERIOD_LABELS: Partial<Record<CoworkRatePeriod, string>> = {
  hourly: 'Per hour',
  daily: 'Per day',
  weekly: 'Per week',
  monthly: 'Per month',
  '2-weeks': '2 weeks',
  '3-months': '3 months',
  '6-months': '6 months',
  yearly: 'Per year',
};

const PERIOD_UNIT: Partial<Record<CoworkRatePeriod, string>> = {
  hourly: 'hour', daily: 'day', weekly: 'week', '2-weeks': '2-week block',
  monthly: 'month', '3-months': '3-month block', '6-months': '6-month block', yearly: 'year',
};

const PERIOD_MAX: Partial<Record<CoworkRatePeriod, number>> = {
  hourly: 13, daily: 31, weekly: 12, '2-weeks': 6, monthly: 12, '3-months': 4, '6-months': 2, yearly: 3,
};

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

function workingDaysNote(period: CoworkRatePeriod): string | null {
  switch (period) {
    case 'weekly':    return 'We\'re open Mon – Fri only. A weekly pass covers 5 working days.';
    case '2-weeks':   return 'We\'re open Mon – Fri only. A 2-week pass covers 10 working days.';
    case 'monthly':   return 'We\'re open Mon – Fri only. A monthly pass covers all working days in that month.';
    case '3-months':  return 'We\'re open Mon – Fri only. This pass covers all working days across 3 months.';
    case '6-months':  return 'We\'re open Mon – Fri only. This pass covers all working days across 6 months.';
    case 'yearly':    return 'We\'re open Mon – Fri only. An annual pass covers all working days in the year.';
    default:          return null;
  }
}

const PERIOD_ORDER: CoworkRatePeriod[] = [
  'hourly', 'daily', 'weekly', '2-weeks', 'monthly', '3-months', '6-months', 'yearly',
];

const FALLBACK_EQUIPMENT: Equipment[] = [
  { id: 'mac-mini-1', name: 'Mac Mini 1', description: 'Apple Mac Mini available for hourly rental.', tiers: [{ price: 100 }] },
  { id: 'mac-mini-2', name: 'Mac Mini 2', description: 'Apple Mac Mini available for hourly rental.', tiers: [{ price: 100 }] },
];

// Static fallback shown while Firestore loads
const FALLBACK_SPACES: CoworkSpace[] = [
  {
    id: 'hot-desk', name: 'Hot Desk', type: 'desk',
    description: 'Any available desk in the shared space. Flexible, social, and great for short stays.',
    rates: [{ period: 'hourly', price: 50, enabled: true }],
    dedicatedRates: [
      { period: 'daily', price: 400, enabled: true },
      { period: 'weekly', price: 1600, enabled: true },
      { period: 'monthly', price: 4800, enabled: true },
      { period: '3-months', price: 14000, enabled: true },
      { period: '6-months', price: 24000, enabled: true },
      { period: 'yearly', price: 40000, enabled: true },
    ],
  },
  {
    id: 'private', name: 'Private Office', type: 'private-office',
    description: 'A fully enclosed office for your team. Lock it, brand it, make it yours.',
    rates: [
      { period: 'monthly', price: 12000, enabled: true },
      { period: '3-months', price: 32000, enabled: true },
      { period: '6-months', price: 58000, enabled: true },
    ],
  },
];

const SPACE_FEATURES: Record<string, string[]> = {
  desk: ['1 Gbps WiFi', 'Power & USB charging', 'Free coffee & tea', 'Kitchen access', 'Printing included'],
  'private-office': ['Everything in Dedicated', 'Fully private space', 'Up to 4 people', 'Custom furniture', 'Meeting room credits'],
};

const AMENITIES = [
  { icon: Wifi, label: '1 Gbps Fibre' },
  { icon: Coffee, label: 'Free drinks' },
  { icon: Printer, label: 'Printing' },
  { icon: Lock, label: 'Lockers' },
  { icon: Users, label: 'Community' },
  { icon: Zap, label: 'Standing desks' },
];

// Mirrors POS CheckInDialog labels — used to infer expiry from legacy tab names
const PERIOD_LABEL_SUFFIX: Partial<Record<CoworkRatePeriod, string>> = {
  hourly: 'Per Hour', daily: 'Daily', weekly: 'Weekly', '2-weeks': '2 Weeks',
  monthly: 'Monthly', '3-months': '3 Months', '6-months': '6 Months', yearly: '1 Year',
};
const PERIOD_DURATION_MS: Partial<Record<CoworkRatePeriod, number>> = {
  hourly: 3_600_000, daily: 86_400_000, weekly: 604_800_000, '2-weeks': 1_209_600_000,
  monthly: 2_592_000_000, '3-months': 7_776_000_000, '6-months': 15_552_000_000, yearly: 31_536_000_000,
};

interface BookingTab {
  id: string;
  type: string;
  label: string;
  status: string;
  openedAt?: string | Date | null;
  items: { productId: string; product: { category: string; name: string } }[];
  bookingEndsAt?: string | Date | null;
  paidAt?: string | Date | null;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function hasDailyDeskItem(t: BookingTab): boolean {
  return t.items.some(i => i.product.category === 'desks' && i.product.name.endsWith(` — ${PERIOD_LABEL_SUFFIX['daily']}`));
}

const SHORT_TERM_PERIODS = new Set<CoworkRatePeriod>(['hourly', 'daily']);
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function countActiveForSpace(
  tabs: BookingTab[],
  spaces: CoworkSpace[],
  spaceId: string,
  spaceName: string,
  period: CoworkRatePeriod = 'hourly',
): number {
  const now = new Date();
  const nowMs = now.getTime();
  const seen = new Set<string>();
  const isMultiDay = !SHORT_TERM_PERIODS.has(period);

  for (const t of tabs) {
    const endsMs = t.bookingEndsAt ? new Date(t.bookingEndsAt as string).getTime() : null;
    if (endsMs !== null && endsMs < 1000) continue; // explicitly checked out early

    // Daily bookings: expire at end of the calendar day they were opened — not 24h after paidAt.
    const openedDate = t.openedAt ? new Date(t.openedAt as string) : null;
    const isDaily = hasDailyDeskItem(t);

    // For weekly/monthly/longer views, only count bookings that actually span multiple days.
    // Skip anything hourly/daily, anything with no end time, or anything ending within 24h.
    if (isMultiDay) {
      if (endsMs === null || endsMs <= nowMs + ONE_DAY_MS) continue;
    }

    const isOpenAndActive = t.status === 'open' && (() => {
      if (endsMs !== null && endsMs > nowMs) return true;
      if (isDaily && openedDate) return sameCalendarDay(openedDate, now);
      return !isDaily;
    })();

    const isPaidStillActive = t.status === 'paid' && (() => {
      if (isDaily && openedDate) return sameCalendarDay(openedDate, now);
      if (endsMs !== null && endsMs > nowMs) return true;
      const paidMs = t.paidAt ? new Date(t.paidAt as string).getTime() : null;
      return paidMs !== null && t.items.some(item => {
        if (item.product.category !== 'desks') return false;
        return (Object.entries(PERIOD_LABEL_SUFFIX) as [CoworkRatePeriod, string][]).some(
          ([p, label]) =>
            p !== 'hourly' && p !== 'daily' &&
            item.product.name.endsWith(` — ${label}`) &&
            paidMs + (PERIOD_DURATION_MS[p] ?? 0) > nowMs,
        );
      });
    })();

    if (!isOpenAndActive && !isPaidStillActive) continue;

    let matches = false;
    if (t.type === 'desk') {
      let key = t.label;
      if (!spaces.find(s => s.name === key)) {
        const deskItem = t.items.find(li => li.product.category === 'desks');
        if (deskItem) {
          const s = spaces.find(x => deskItem.productId.startsWith(x.id + '-') || x.id === deskItem.productId);
          if (s) key = s.name;
        }
      }
      matches = key === spaceName;
    } else {
      matches = t.items.some(item =>
        item.product.category === 'desks' &&
        (item.productId === spaceId || item.productId.startsWith(spaceId + '-')),
      );
    }
    if (matches) seen.add(t.id);
  }
  return seen.size;
}

type PickerItem =
  | { kind: 'equipment'; id: string; name: string; tiers: EquipmentTier[] }
  | { kind: 'desk'; id: string; name: string; bookingRate: number; walkInRate?: number; period: CoworkRatePeriod; spaceType: string; hotDeskOnly?: boolean };

function calcEquipTotal(tiers: EquipmentTier[], qty: number): number {
  if (!tiers.length) return 0;
  const last = tiers[tiers.length - 1];
  let total = 0;
  for (let i = 0; i < qty; i++) total += (tiers[i] ?? last).price;
  return total;
}

/**
 * For hourly: always from space.rates (walk-in rate).
 * For all other periods: desks use dedicatedRates (block-booking price),
 * private offices use rates (they are inherently dedicated).
 */
function getRateForPeriod(space: CoworkSpace, period: CoworkRatePeriod): CoworkSpaceRate | undefined {
  if (period === 'hourly') {
    return space.rates.find((r) => r.period === 'hourly' && r.enabled);
  }
  if (space.type === 'private-office') {
    return space.rates.find((r) => r.period === period && r.enabled);
  }
  // Desks: prefer dedicated rate; fall back to walk-in if no dedicated rates configured
  const dedicated = (space.dedicatedRates ?? []).find((r) => r.period === period && r.enabled);
  if (dedicated) return dedicated;
  return space.rates.find((r) => r.period === period && r.enabled);
}

export default function CoworkingPage() {
  const router = useRouter();
  const { data: spaces, loading, fromFirestore } = useFirestoreSlice<CoworkSpace[]>(
    'spaces',
    FALLBACK_SPACES,
  );
  const { data: rawEquipment } = useFirestoreSlice<Equipment[]>('equipment', FALLBACK_EQUIPMENT);
  const { data: bookingTabs } = useFirestoreSlice<BookingTab[]>('tabs', []);
  const venueSettings = useVenueSettings();
  // Use fallback Mac Minis when Firestore slice is empty (POS equipment not yet configured)
  const allEquipment = rawEquipment.length > 0 ? rawEquipment : FALLBACK_EQUIPMENT;
  const activeEquipment = allEquipment.filter((e) => !e.archived);

  const activeSpaces = spaces.filter((s) => !s.archived);

  // Collect all periods that have at least one space with a rate (using the correct source per type)
  const allPeriods = PERIOD_ORDER.filter((p) =>
    activeSpaces.some((s) => getRateForPeriod(s, p) !== undefined),
  );

  // Pick the period with the most spaces covered as the smart default
  const bestDefaultPeriod: CoworkRatePeriod = allPeriods.reduce((best, p) => {
    const count = activeSpaces.filter((s) => getRateForPeriod(s, p) !== undefined).length;
    const bestCount = activeSpaces.filter((s) => getRateForPeriod(s, best) !== undefined).length;
    return count > bestCount ? p : best;
  }, allPeriods[0] ?? 'daily');

  const [period, setPeriod] = useState<CoworkRatePeriod>(bestDefaultPeriod);
  const [picker, setPicker] = useState<PickerItem | null>(null);
  const [pickerQty, setPickerQty] = useState(1);
  const [pickerDate, setPickerDate] = useState('');
  const [pickerTime, setPickerTime] = useState('10:00');

  const dayHours = getVenueHoursForDate(venueSettings.venue.openingHours, pickerDate);
  const maxHourlyHours = Math.floor((timeToMinutes(dayHours.close) - timeToMinutes(dayHours.open)) / 60);
  // Latest start time = close time minus the selected duration (e.g. 1hr booking can start no later than 22:30 if close is 23:30)
  const maxStartTime = minutesToTime(timeToMinutes(dayHours.close) - pickerQty * 60);

  useEffect(() => {
    if (fromFirestore) setPeriod(bestDefaultPeriod);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromFirestore]);

  const validPeriod = allPeriods.includes(period) ? period : bestDefaultPeriod;

  function toDateValue(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  function openPicker(item: PickerItem, spaceId?: string, spaceName?: string, spacePeriod?: CoworkRatePeriod) {
    const today = new Date();
    const todayStr = toDateValue(today);
    let defaultDate = todayStr;
    if (spaceId && spaceName && spacePeriod) {
      const slots = activeSpaces.find(s => s.id === spaceId)?.capacity ?? 1;
      const booked = countActiveForSpace(bookingTabs, activeSpaces, spaceId, spaceName, spacePeriod);
      if (booked >= slots) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        defaultDate = toDateValue(tomorrow);
      }
    }
    const openTime = getVenueHoursForDate(venueSettings.venue.openingHours, defaultDate).open;
    setPicker(item);
    setPickerQty(1);
    setPickerDate(defaultDate);
    setPickerTime(openTime);
  }

  function confirmPicker() {
    if (!picker) return;
    // Advance past any weekend (safety net — Calendar already blocks weekends)
    let dateParam = pickerDate || toDateValue(new Date());
    // Safety clamp: ensure start time doesn't push booking past closing time
    const hours = getVenueHoursForDate(venueSettings.venue.openingHours, dateParam);
    const latestStart = minutesToTime(timeToMinutes(hours.close) - pickerQty * 60);
    if (pickerTime > latestStart) setPickerTime(latestStart);
    const chosen = new Date(dateParam + 'T12:00:00');
    const dow = chosen.getDay();
    if (dow === 0 || dow === 6) {
      // Skip to next Monday
      const next = new Date(chosen);
      next.setDate(next.getDate() + (dow === 6 ? 2 : 1));
      dateParam = toDateValue(next);
    }
    if (picker.kind === 'equipment') {
      const total = calcEquipTotal(picker.tiers, pickerQty);
      router.push(`/order?type=coworking&space=${picker.id}&period=hourly&hours=${pickerQty}&estimatedTotal=${total}&bookingDate=${dateParam}&bookingTime=${pickerTime}`);
    } else {
      const isHourly = picker.period === 'hourly';
      const timeSegment = isHourly ? `&bookingTime=${pickerTime}` : '';
      router.push(`/order?type=coworking&space=${picker.id}&period=${picker.period}&spaceType=${picker.spaceType}&estimatedTotal=${picker.bookingRate}&bookingDate=${dateParam}${timeSegment}`);
    }
    setPicker(null);
  }

  const pickerTotal = picker?.kind === 'equipment'
    ? calcEquipTotal(picker.tiers, pickerQty)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge variant="brand">Coworking</Badge>
            {fromFirestore && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live pricing
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink mb-4 tracking-tight">
            Flexible workspace<br />in Phuket
          </h1>
          <p className="text-ink-muted text-lg max-w-xl mx-auto">
            From hourly hot desks to dedicated private offices. Fast internet, great food, and a community of people getting things done.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 bg-surface-muted border border-ink-faint/30 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-muted">
                <Icon className="w-3.5 h-3.5 text-brand" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading pricing…</span>
          </div>
        ) : (
          <>
            {/* Period toggle */}
            {allPeriods.length > 0 && (
              <div className="flex items-center justify-center gap-1 bg-surface-muted rounded-full p-1 mb-12 w-fit mx-auto flex-wrap">
                {allPeriods.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                      validPeriod === p ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            )}

            {/* Space cards */}
            {(() => {
              const visibleSpaces = activeSpaces
                .filter((s) => getRateForPeriod(s, validPeriod) !== undefined)
                .sort((a, b) => (getRateForPeriod(a, validPeriod)?.price ?? 0) - (getRateForPeriod(b, validPeriod)?.price ?? 0));
              return (
            <div className={`grid gap-6 ${visibleSpaces.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : visibleSpaces.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
              {visibleSpaces.map((space, i) => {
                const rate = getRateForPeriod(space, validPeriod);
                const hasDedicated = (space.dedicatedRates ?? []).some((r) => r.period === validPeriod && r.enabled);
                const isDesk = space.type !== 'private-office' && validPeriod !== 'hourly' && hasDedicated;
                const displayRate = isDesk
                  ? (space.rates.find((r) => r.period === validPeriod && r.enabled) ?? rate)
                  : rate;
                const isPrivateOffice = space.type === 'private-office';
                const popularIdx = visibleSpaces.findIndex((s) =>
                  s.name.toLowerCase().includes('standup + 27'),
                );
                const highlightIdx = popularIdx !== -1 ? popularIdx : visibleSpaces.length === 1 ? 0 : 1;
                // Private office always gets VIP treatment; never the "most popular" highlight
                const isHighlighted = !isPrivateOffice && i === highlightIdx;
                const features = SPACE_FEATURES[space.type] ?? SPACE_FEATURES['desk'];
                const isHotDesk = validPeriod === 'hourly' && space.name.toLowerCase().includes('hot');
                const isBookable = !isHotDesk;

                return (
                  <div
                    key={space.id}
                    className={`rounded-2xl p-8 border transition-all ${
                      isPrivateOffice
                        ? 'bg-gradient-to-br from-brand to-brand-dark border-brand-dark/30 shadow-xl shadow-brand/20 scale-[1.02]'
                        : isHighlighted
                        ? 'bg-ink text-white border-ink shadow-xl scale-[1.02]'
                        : 'bg-white border-ink-faint/30 shadow-sm'
                    }`}
                  >
                    {isPrivateOffice ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 mb-4">
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </span>
                    ) : isHighlighted && visibleSpaces.length >= 2 ? (
                      <span className="inline-block bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        Most popular
                      </span>
                    ) : null}
                    {(() => {
                      const slots = space.capacity ?? 1;
                      const booked = countActiveForSpace(bookingTabs, activeSpaces, space.id, space.name, validPeriod);
                      const available = Math.max(0, slots - booked);
                      const isFull = available === 0;
                      return (
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                          isFull
                            ? 'bg-red-100 text-red-600'
                            : isPrivateOffice
                            ? 'bg-white/15 text-white/80'
                            : isHighlighted
                            ? 'bg-white/10 text-white/70'
                            : 'bg-surface-raised text-ink-muted'
                        }`}>
                          {isFull ? 'Full' : `${available} of ${slots} ${slots === 1 ? 'spot' : 'spots'} available`}
                        </span>
                      );
                    })()}
                    <h3 className={`text-xl font-bold mb-1 ${isPrivateOffice || isHighlighted ? 'text-white' : 'text-ink'}`}>
                      {space.name}
                    </h3>
                    {space.description && (
                      <p className={`text-sm mb-6 ${isPrivateOffice ? 'text-white/70' : isHighlighted ? 'text-white/60' : 'text-ink-muted'}`}>
                        {space.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-8">
                      {displayRate ? (
                        <>
                          <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDesk ? (isPrivateOffice || isHighlighted ? 'text-white/50' : 'text-ink-muted') : 'invisible'}`}>
                            from
                          </p>
                          <div>
                            <span className={`text-4xl font-bold ${isPrivateOffice || isHighlighted ? 'text-white' : 'text-ink'}`}>
                              ฿{displayRate.price.toLocaleString()}
                            </span>
                            <span className={`text-sm ml-1 ${isPrivateOffice ? 'text-white/60' : isHighlighted ? 'text-white/50' : 'text-ink-muted'}`}>
                              / {PERIOD_LABELS[validPeriod]?.toLowerCase()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className={`text-sm italic ${isPrivateOffice || isHighlighted ? 'text-white/50' : 'text-ink-muted'}`}>
                          Not available for this period
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPrivateOffice ? 'text-white/70' : 'text-brand'}`} />
                          <span className={isPrivateOffice ? 'text-white/85' : isHighlighted ? 'text-white/80' : 'text-ink-muted'}>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {isBookable ? (
                    <button
                      onClick={() => {
                        if (!rate) return;
                        if (space.type === 'private-office' && validPeriod === 'hourly') {
                          openPicker({ kind: 'equipment', id: space.id, name: space.name, tiers: rate.tiers?.length ? rate.tiers : [{ price: rate.price }] }, space.id, space.name, validPeriod);
                        } else {
                          const hasDedicated = !isPrivateOffice && (space.dedicatedRates ?? []).some((r) => r.period === validPeriod && r.enabled);
                          const walkInRate = isPrivateOffice ? undefined : space.rates.find((r) => r.period === validPeriod && r.enabled)?.price;
                          openPicker({ kind: 'desk', id: space.id, name: space.name, bookingRate: rate.price, walkInRate, period: validPeriod, spaceType: space.type, hotDeskOnly: !isPrivateOffice && !hasDedicated }, space.id, space.name, validPeriod);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                        isPrivateOffice
                          ? 'bg-white text-brand hover:bg-red-50'
                          : isHighlighted
                          ? 'bg-brand text-white hover:bg-brand-dark'
                          : 'bg-ink text-white hover:bg-ink/80'
                      }`}
                    >
                      Book this space
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    ) : (
                      <div className={`w-full py-3 rounded-full text-sm font-medium text-center ${
                        isPrivateOffice
                          ? 'bg-white/20 text-white/70'
                          : isHighlighted
                          ? 'bg-white/10 text-white/60'
                          : 'bg-surface-muted text-ink-muted border border-ink-faint/30'
                      }`}>
                        Walk-in only — no booking needed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              );
            })()}

            {/* Equipment rentals — hourly only */}
            {validPeriod === 'hourly' && activeEquipment.length > 0 && (
              <div className="mt-12">
                <h2 className="text-center text-xl font-bold text-ink mb-6">Equipment rentals</h2>
                <div className={`grid gap-6 ${activeEquipment.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'}`}>
                  {activeEquipment.map((equip) => {
                    const hourlyPrice = equip.tiers[0]?.price ?? 0;
                    return (
                      <div key={equip.id} className="rounded-2xl p-8 bg-white border border-ink-faint/30 shadow-sm">
                        <h3 className="text-xl font-bold text-ink mb-1">{equip.name}</h3>
                        {equip.description && (
                          <p className="text-sm text-ink-muted mb-6">{equip.description}</p>
                        )}
                        <div className="mb-8">
                          <span className="text-4xl font-bold text-ink">฿{hourlyPrice.toLocaleString()}</span>
                          <span className="text-sm ml-1 text-ink-muted">/ per hour</span>
                        </div>
                        <button
                          onClick={() => openPicker({ kind: 'equipment', id: equip.id, name: equip.name, tiers: equip.tiers }, equip.id, equip.name, 'hourly')}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink/80 transition-colors cursor-pointer"
                        >
                          Rent this
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* House rules */}
      <div className="bg-surface-muted py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink mb-6">House rules</h2>
          <div className="bg-white rounded-2xl border border-ink-faint/20 divide-y divide-ink-faint/20">
            {[
              'Keep noise levels considerate of other members.',
              'Phone calls: please use the designated phone booths or step outside.',
              'Clean up your workspace at the end of each session.',
              'No food at standing desks.',
              'Lockers must be vacated at end of booking unless on a dedicated package.',
              'Guests must sign in at reception.',
            ].map((rule, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-3 text-sm text-ink-muted">
                <span className="w-5 h-5 rounded-full bg-surface-raised text-xs font-semibold flex items-center justify-center text-ink-muted shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rule}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setPicker(null); }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[95vh]">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink">{picker.name}</h3>
                <p className="text-sm text-ink-muted mt-0.5">
                  {picker.kind === 'equipment'
                    ? 'How many hours do you need?'
                    : picker.hotDeskOnly
                    ? 'Walk-in hot desk pricing'
                    : picker.spaceType === 'private-office'
                    ? 'Book your private office'
                    : 'Choose how you want to use this desk'}
                </p>
              </div>
              <button onClick={() => setPicker(null)} className="text-ink-muted hover:text-ink transition-colors -mt-1 -mr-1 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {picker.kind === 'desk' ? (
              <>
                {picker.hotDeskOnly ? (
                  /* Hot-desk-only: simplified single panel */
                  <>
                    <div className="rounded-xl border border-ink-faint/30 bg-surface-muted p-5 mb-6">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-3">Walk-in Hot Desk</p>
                      <p className="text-3xl font-bold text-ink">฿{picker.bookingRate.toLocaleString()}</p>
                      <p className="text-xs text-ink-muted mt-0.5">/ {PERIOD_LABELS[picker.period]?.toLowerCase()}</p>
                      <p className="text-sm text-ink-muted mt-4 leading-relaxed">
                        First come, first served — no desk is reserved. When you leave the premises you must take your belongings with you, and your desk may change when you return. Perfect for flexible short-stay working.
                      </p>
                    </div>
                    {workingDaysNote(picker.period) && (
                      <p className="text-xs text-ink-muted bg-surface-muted rounded-xl px-4 py-3 mb-6">
                        📅 {workingDaysNote(picker.period)}
                      </p>
                    )}
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                        Start date{pickerDate && <span className="normal-case font-normal ml-1.5 text-ink">— {formatBookingDate(pickerDate)}</span>}
                      </p>
                      <Calendar value={pickerDate} minDate={toDateValue(new Date())} onChange={setPickerDate} disableWeekends />
                      <p className="text-xs text-ink-muted mt-2">Select today to arrive now, or a future date to reserve your spot.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setPicker(null)} className="flex-1 py-3 rounded-full text-sm font-medium border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-ink-faint/60 transition-colors">
                        Cancel
                      </button>
                      <button onClick={confirmPicker} className="flex-1 py-3 rounded-full text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
                        Continue to book
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Walk-in vs dedicated comparison */
                  <>
                    <div className={`grid gap-3 mb-6 ${picker.walkInRate ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {picker.walkInRate && (
                        <div className="rounded-xl border border-ink-faint/30 bg-surface-muted p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-3">Walk-in Hot Desk</p>
                          <p className="text-2xl font-bold text-ink">฿{picker.walkInRate.toLocaleString()}</p>
                          <p className="text-xs text-ink-muted mt-0.5">/ {PERIOD_LABELS[picker.period]?.toLowerCase()}</p>
                          <p className="text-xs text-ink-muted mt-3 leading-relaxed">First come, first served. Please note — you cannot leave your belongings at the desk when you leave the premises, and your desk may change when you return.</p>
                        </div>
                      )}
                      <div className="rounded-xl border border-ink bg-ink p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-3">
                          {picker.spaceType === 'private-office' ? 'Dedicated Office' : 'Dedicated Desk'}
                        </p>
                        <p className="text-2xl font-bold text-white">฿{picker.bookingRate.toLocaleString()}</p>
                        <p className="text-xs text-white/50 mt-0.5">/ {PERIOD_LABELS[picker.period]?.toLowerCase()}</p>
                        <p className="text-xs text-white/50 mt-3 leading-relaxed">
                          {picker.spaceType === 'private-office'
                            ? 'Your own private office for the full period — locked, yours alone. Leave your belongings, set up your space, come and go as you please.'
                            : 'This desk is yours for the full opening hours — reserved just for you. Leave your belongings, rearrange things, make yourself at home. No one else will sit here.'}
                        </p>
                      </div>
                    </div>
                    {workingDaysNote(picker.period) && (
                      <p className="text-xs text-ink-muted bg-surface-muted rounded-xl px-4 py-3 mb-6">
                        📅 {workingDaysNote(picker.period)}
                      </p>
                    )}
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                        Start date{pickerDate && <span className="normal-case font-normal ml-1.5 text-ink">— {formatBookingDate(pickerDate)}</span>}
                      </p>
                      <Calendar value={pickerDate} minDate={toDateValue(new Date())} onChange={setPickerDate} disableWeekends />
                      <p className="text-xs text-ink-muted mt-2">Select today to arrive now, or a future date to reserve your spot.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setPicker(null)} className="flex-1 py-3 rounded-full text-sm font-medium border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-ink-faint/60 transition-colors">
                        Cancel
                      </button>
                      <button onClick={confirmPicker} className="flex-1 py-3 rounded-full text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
                        Continue to book
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Equipment quantity picker */}
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
                <div className="bg-surface-muted rounded-xl px-5 py-4 mb-6 text-center">
                  <p className="text-xs text-ink-muted mb-1">Estimated total</p>
                  <p className="text-3xl font-bold text-ink">฿{pickerTotal.toLocaleString()}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    {equip_breakdown(picker.tiers, pickerQty)}
                  </p>
                </div>
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                    Start date{pickerDate && <span className="normal-case font-normal ml-1.5 text-ink">— {formatBookingDate(pickerDate)}</span>}
                  </p>
                  <Calendar value={pickerDate} minDate={toDateValue(new Date())} onChange={setPickerDate} disableWeekends />
                  <div className="mt-3">
                    <TimePicker
                      value={pickerTime}
                      min={dayHours.open}
                      max={maxStartTime}
                      onChange={setPickerTime}
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-2">Select today to arrive now, or a future date to reserve your spot.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPicker(null)} className="flex-1 py-3 rounded-full text-sm font-medium border border-ink-faint/30 text-ink-muted hover:text-ink hover:border-ink-faint/60 transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmPicker} className="flex-1 py-3 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink/80 transition-colors flex items-center justify-center gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function equip_breakdown(tiers: EquipmentTier[], qty: number): string {
  const last = tiers[tiers.length - 1];
  const allSame = tiers.every((t) => t.price === tiers[0].price);
  if (allSame) return `฿${(tiers[0]?.price ?? 0).toLocaleString()} × ${qty} hour${qty !== 1 ? 's' : ''}`;
  const lines = Array.from({ length: qty }, (_, i) => `hr ${i + 1}: ฿${((tiers[i] ?? last).price).toLocaleString()}`);
  return lines.join(' · ');
}
