'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi, Coffee, Printer, Lock, Users, Zap, ArrowRight, Loader2, ChevronLeft, Monitor,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { CoworkSpace, CoworkRatePeriod, CoworkSpaceRate } from '@/types';

interface DeskTab {
  id: string;
  type: string;
  label?: string;
  status: string;
  openedAt?: Date | string;
  bookingEndsAt?: Date | string;
  items?: Array<{ productId?: string; product: { category: string; id: string; name?: string } }>;
}

function sameCalDay(a: Date | string | undefined, b: Date): boolean {
  if (!a) return false;
  const d = a instanceof Date ? a : new Date(a as string);
  return d.getFullYear() === b.getFullYear() && d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
}

function tabEndsAt(t: DeskTab): Date | null {
  if (!t.bookingEndsAt) return null;
  return t.bookingEndsAt instanceof Date ? t.bookingEndsAt : new Date(t.bookingEndsAt as string);
}

function isTabActiveForSpace(t: DeskTab, spaceName: string, spaceId: string, now: Date): boolean {
  // Tabs explicitly checked-out early have bookingEndsAt at epoch
  const endsAt = tabEndsAt(t);
  if (endsAt && endsAt.getTime() < 1000) return false;

  // Does any item have a daily desk product?
  const hasDaily = t.items?.some(
    (i) => i.product?.category === 'desks' && i.product?.name?.endsWith(' — Per Day'),
  ) ?? false;

  const isActive = (() => {
    if (t.status === 'open') {
      if (endsAt && endsAt > now) return true;
      if (hasDaily) return sameCalDay(t.openedAt, now);
      return true;
    }
    if (t.status === 'paid') {
      if (hasDaily) return sameCalDay(t.openedAt, now);
      return !!endsAt && endsAt > now;
    }
    return false;
  })();
  if (!isActive) return false;

  // Match by tab label (dedicated desk check-in)
  if (t.type === 'desk' && t.label === spaceName) return true;
  // Match by desk line item productId
  if (t.items?.some((item) => {
    const pid = item.productId ?? item.product.id;
    return item.product.category === 'desks' && pid && (pid === spaceId || pid.startsWith(spaceId + '-'));
  })) return true;
  return false;
}

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

const PERIOD_ORDER: CoworkRatePeriod[] = [
  'hourly', 'daily', 'weekly', '2-weeks', 'monthly', '3-months', '6-months', 'yearly',
];

const FALLBACK_SPACES: CoworkSpace[] = [
  {
    id: 'hot-desk', name: 'Hot Desk', type: 'desk',
    description: 'Any available desk in the shared space. Flexible, social, and great for short stays.',
    rates: [{ period: 'hourly', price: 50, enabled: true }],
    dedicatedRates: [
      { period: 'daily', price: 400, enabled: true },
      { period: 'weekly', price: 1600, enabled: true },
      { period: 'monthly', price: 4800, enabled: true },
    ],
  },
  {
    id: 'private', name: 'Private Office', type: 'private-office',
    description: 'A fully enclosed office for your team. Lock it, brand it, make it yours.',
    rates: [
      { period: 'monthly', price: 12000, enabled: true },
      { period: '3-months', price: 32000, enabled: true },
    ],
  },
];

const AMENITIES = [
  { icon: Wifi, label: '1 Gbps Fibre' },
  { icon: Coffee, label: 'Free drinks' },
  { icon: Printer, label: 'Printing' },
  { icon: Lock, label: 'Lockers' },
  { icon: Users, label: 'Community' },
  { icon: Zap, label: 'Standing desks' },
];

const SPACE_FEATURES: Record<string, string[]> = {
  desk: ['1 Gbps WiFi', 'Power & USB charging', 'Free coffee & tea', 'Kitchen access', 'Printing included'],
  'private-office': ['Everything in Dedicated', 'Fully private space', 'Up to 4 people', 'Custom furniture', 'Meeting room credits'],
};

function getRateForPeriod(space: CoworkSpace, period: CoworkRatePeriod): CoworkSpaceRate | undefined {
  if (period === 'hourly') {
    return space.rates.find((r) => r.period === 'hourly' && r.enabled);
  }
  if (space.type === 'private-office') {
    return space.rates.find((r) => r.period === period && r.enabled);
  }
  const dedicated = (space.dedicatedRates ?? []).find((r) => r.period === period && r.enabled);
  if (dedicated) return dedicated;
  return space.rates.find((r) => r.period === period && r.enabled);
}

export default function CoworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: spaces, loading, fromFirestore } = useFirestoreSlice<CoworkSpace[]>('spaces', FALLBACK_SPACES);
  const { data: tabs } = useFirestoreSlice<DeskTab[]>('tabs', []);
  const displaySpaces = spaces.length > 0 ? spaces : FALLBACK_SPACES;
  const space = displaySpaces.find((s) => s.id === id && !s.archived);

  // "Hot Desk" and "No Desk" packages are walk-in only — all their rates are bookable directly
  const isWalkInPackage = space
    ? space.name.toLowerCase().includes('hot') || space.name.toLowerCase().includes('no desk')
    : false;

  // Periods available to book: for regular desks, only dedicated rates; for walk-in packages and private offices, all rates
  const bookablePeriods = space
    ? (isWalkInPackage || space.type === 'private-office')
      ? PERIOD_ORDER.filter((p) => getRateForPeriod(space, p) !== undefined)
      : PERIOD_ORDER.filter(
          (p) => p !== 'hourly' && (space.dedicatedRates ?? []).some((r) => r.period === p && r.enabled),
        )
    : [];

  const [period, setPeriod] = useState<CoworkRatePeriod>('daily');

  // Update period to first bookable once Firestore data arrives
  useEffect(() => {
    if (fromFirestore && bookablePeriods.length > 0) {
      setPeriod(bookablePeriods[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromFirestore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-ink-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Monitor className="w-12 h-12 text-ink-faint" />
        <h1 className="text-2xl font-bold text-ink">Space not found</h1>
        <Link href="/coworking" className="text-brand text-sm font-medium hover:underline">← Back to all spaces</Link>
      </div>
    );
  }

  const selectedRate = getRateForPeriod(space, period);
  const features = SPACE_FEATURES[space.type] ?? SPACE_FEATURES['desk'];
  const isPrivateOffice = space.type === 'private-office';

  // Walk-in rates shown as informational only (non-hourly rates from space.rates, for regular desks)
  const walkInInfoRates = (!isWalkInPackage && !isPrivateOffice)
    ? space.rates.filter((r) => r.enabled && r.period !== 'hourly')
    : [];

  // Count active bookings for this space from the POS tabs slice.
  // Mirrors the POS coworking board logic: paid daily tabs active if opened today,
  // paid non-daily tabs active if bookingEndsAt is in the future.
  const now = new Date();
  const activeCount = tabs.filter((t) => isTabActiveForSpace(t, space.name, space.id, now)).length;
  const capacity = space.capacity ?? 1;
  const desksAvailable = Math.max(0, capacity - activeCount);

  // Booking is blocked when the space is full AND the selected period maps to today
  // (daily walk-in and walk-in packages) or the space is fully booked for the period
  // (private office, walk-in packages).
  const bookingBlocked =
    desksAvailable === 0 && (isWalkInPackage || isPrivateOffice || period === 'daily');

  function book() {
    if (!selectedRate) return;
    router.push(
      `/order?type=coworking&space=${space!.id}&period=${period}&spaceType=${space!.type}&estimatedTotal=${selectedRate.price}`
    );
  }

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
            <Badge variant="brand" className="mb-4">{isPrivateOffice ? 'Private Office' : 'Coworking Desk'}</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">{space.name}</h1>
            {space.description && (
              <p className="text-ink-muted text-lg leading-relaxed mb-8">{space.description}</p>
            )}

            {/* Amenity pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2">
                  <Icon className="w-4 h-4 text-brand" />
                  <span className="text-sm font-medium text-ink-muted">{label}</span>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-4">What&apos;s included</h2>
              <ul className="space-y-2.5">
                {features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-ink-muted">
                    <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Long description */}
            {space.longDescription && (
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
                dangerouslySetInnerHTML={{ __html: space.longDescription }}
              />
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl border border-ink-faint/20 shadow-sm p-6">

              {/* Walk-in info (regular desks only — not bookable, just informational) */}
              {walkInInfoRates.length > 0 && (
                <div className="mb-5 pb-5 border-b border-ink-faint/20">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">Walk-in rate</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      desksAvailable > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {desksAvailable > 0
                        ? `${desksAvailable} of ${capacity} spot${capacity === 1 ? '' : 's'} available`
                        : 'Currently occupied'}
                    </span>
                  </div>
                  {walkInInfoRates.map((r) => (
                    <div key={r.period} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-muted">{PERIOD_LABELS[r.period]}</span>
                      <span className="font-bold text-ink tabular-nums">฿{r.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <p className="text-xs text-ink-muted mt-2">
                    {desksAvailable > 0
                      ? 'Drop in anytime · first come, first served'
                      : 'Walk-in full · book a dedicated desk to secure your spot'}
                  </p>
                </div>
              )}

              {/* Availability for private offices and walk-in packages (no separate walk-in section) */}
              {walkInInfoRates.length === 0 && (
                <div className="flex justify-end mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    desksAvailable > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {desksAvailable > 0
                      ? `${desksAvailable} of ${capacity} spot${capacity === 1 ? '' : 's'} available`
                      : 'Currently occupied'}
                  </span>
                </div>
              )}

              {/* Prominent price for selected bookable period */}
              {selectedRate && (
                <div className="mb-5">
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
                    {walkInInfoRates.length > 0 ? 'Dedicated desk' : 'From'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-ink">฿{selectedRate.price.toLocaleString()}</span>
                    <span className="text-sm text-ink-muted ml-1">/ {PERIOD_LABELS[period]?.toLowerCase()}</span>
                  </div>
                </div>
              )}

              {/* Bookable period selector */}
              {bookablePeriods.length > 1 && (
                <div className="flex flex-col gap-1 mb-5">
                  {bookablePeriods.map((p) => {
                    const rate = getRateForPeriod(space, p);
                    const periodFull = p === 'daily' && desksAvailable === 0;
                    return (
                      <button
                        key={p}
                        onClick={() => !periodFull && setPeriod(p)}
                        disabled={periodFull}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors border ${
                          periodFull
                            ? 'border-ink-faint/10 text-ink-faint/50 cursor-not-allowed opacity-50'
                            : period === p
                              ? 'bg-ink text-white border-ink cursor-pointer'
                              : 'border-ink-faint/20 text-ink-muted hover:border-ink-faint/40 hover:text-ink cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{PERIOD_LABELS[p]}</span>
                          {periodFull && (
                            <span className="text-xs text-amber-600 font-normal">Full today</span>
                          )}
                        </div>
                        {rate && (
                          <span className={`font-bold tabular-nums ${period === p && !periodFull ? 'text-white' : 'text-ink'}`}>
                            ฿{rate.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={book}
                disabled={!selectedRate || bookingBlocked}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingBlocked ? 'Not available today' : 'Book this space'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-ink-muted text-center mt-4 leading-relaxed">
                {bookingBlocked && !isPrivateOffice && !isWalkInPackage
                  ? 'Walk-in full today · choose a weekly or monthly option above'
                  : 'Includes café access, gigabit WiFi and printing.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
