'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { CoworkSpace, CoworkRatePeriod, Equipment } from '@/types';

const PERKS = [
  '1 Gbps fibre internet',
  'Unlimited coffee & tea',
  'Standing & sit desks',
  'Printing included',
  'Backup internet line',
  'Community events',
];

// Periods to show on the homepage card, in order (no standalone hourly — not offered)
const FEATURED_PERIODS: { period: CoworkRatePeriod; label: string; note: string }[] = [
  { period: 'daily',   label: 'Day Pass',  note: 'full day' },
  { period: 'weekly',  label: 'Weekly',    note: '5 days' },
  { period: 'monthly', label: 'Monthly',   note: 'calendar month' },
];

export function CoworkingCta() {
  const { data: spaces }    = useFirestoreSlice<CoworkSpace[]>('spaces', []);
  const { data: equipment } = useFirestoreSlice<Equipment[]>('equipment', []);

  // For each featured period, find the lowest price across all non-archived desk spaces
  function lowestRate(period: CoworkRatePeriod): number | null {
    let best: number | null = null;
    for (const space of spaces) {
      if (space.archived) continue;
      const rate = space.rates?.find(r => r.period === period && r.enabled !== false);
      if (rate && (best === null || rate.price < best)) best = rate.price;
    }
    return best;
  }

  // Lowest Mac Mini (or any equipment) tier-1 hourly rate
  function lowestMacMiniRate(): number | null {
    let best: number | null = null;
    for (const equip of equipment) {
      if (equip.archived) continue;
      if (!equip.name.toLowerCase().includes('mac')) continue;
      const tier1 = equip.tiers?.[0]?.price;
      if (tier1 != null && (best === null || tier1 < best)) best = tier1;
    }
    return best;
  }

  const macRate     = lowestMacMiniRate();
  // Mac Mini rental includes desk access — bundle price is just the Mac Mini rate
  const bundlePrice = macRate;

  // "From" headline uses the day pass rate
  const dayRate   = lowestRate('daily');
  const fromLabel = dayRate != null ? `฿${dayRate.toLocaleString()}/day.` : '฿200/day.';

  return (
    <section className="py-24 bg-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-4">
              Coworking
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Desk Rental in Patong, Phuket<br />
              <span className="text-white/50">From {fromLabel} No commitment needed.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Whether you need a desk for a day or a private office for a month,
              we have a package that works. Bring your laptop and we&apos;ll handle the rest.
            </p>

            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 mb-10">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-4 h-4 text-brand shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>

            <Link
              href="/coworking"
              className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              See all packages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right — price card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
              Quick pricing
            </p>
            {(() => {
              // Build visible rows: Mac Mini bundle first (entry hourly), then day/week/month
              const rows: { key: string; label: string; note: string; price: number }[] = [];
              if (bundlePrice !== null) {
                rows.push({
                  key: 'mac-bundle',
                  label: 'Desk + Mac Mini',
                  note: 'per hour · desk included',
                  price: bundlePrice,
                });
              }
              rows.push({
                key: 'private-office',
                label: 'Private Office',
                note: 'per hour',
                price: 200,
              });
              for (const row of FEATURED_PERIODS) {
                const price = lowestRate(row.period);
                if (price === null) continue;
                rows.push({ key: row.period, label: row.label, note: row.note, price });
              }
              return rows.map((row, i) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between py-4 ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  <div>
                    <p className="font-semibold text-white">{row.label}</p>
                    <p className="text-xs text-white/40">{row.note}</p>
                  </div>
                  <p className="text-xl font-bold text-white"><span className="text-sm font-normal text-white/40 mr-1">from</span>฿{row.price.toLocaleString()}</p>
                </div>
              ));
            })()}
            <Link
              href="/coworking"
              className="mt-6 flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors w-full"
            >
              Full pricing & packages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
