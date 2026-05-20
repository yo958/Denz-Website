'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi, Coffee, Printer, Lock, Users, Zap, ArrowRight, Loader2, ChevronLeft, Monitor,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { CoworkSpace, CoworkRatePeriod, CoworkSpaceRate } from '@/types';

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

  const { data: spaces, loading } = useFirestoreSlice<CoworkSpace[]>('spaces', FALLBACK_SPACES);
  const displaySpaces = spaces.length > 0 ? spaces : FALLBACK_SPACES;
  const space = displaySpaces.find((s) => s.id === id && !s.archived);

  // Build available periods for this space
  const availablePeriods = PERIOD_ORDER.filter((p) => getRateForPeriod(space!, p) !== undefined);
  const defaultPeriod = availablePeriods[0] ?? 'daily';
  const [period, setPeriod] = useState<CoworkRatePeriod>(defaultPeriod);

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

              {/* Period toggle */}
              {availablePeriods.length > 1 && (
                <div className="flex flex-col gap-1 mb-5">
                  {availablePeriods.map((p) => {
                    const rate = getRateForPeriod(space, p);
                    return (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border ${
                          period === p
                            ? 'bg-ink text-white border-ink'
                            : 'border-ink-faint/20 text-ink-muted hover:border-ink-faint/40 hover:text-ink'
                        }`}
                      >
                        <span className="font-medium">{PERIOD_LABELS[p]}</span>
                        {rate && (
                          <span className={`font-bold tabular-nums ${period === p ? 'text-white' : 'text-ink'}`}>
                            ฿{rate.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Price display (single period) */}
              {availablePeriods.length === 1 && selectedRate && (
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-ink">฿{selectedRate.price.toLocaleString()}</span>
                    <span className="text-sm text-ink-muted ml-1">/ {PERIOD_LABELS[period]?.toLowerCase()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={book}
                disabled={!selectedRate}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book this space
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-ink-muted text-center mt-4 leading-relaxed">
                Includes café access, gigabit WiFi and printing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
