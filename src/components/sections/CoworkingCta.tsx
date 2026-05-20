'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import type { CoworkSpace, CoworkRatePeriod } from '@/types';

const PERKS = [
  '1 Gbps fibre internet',
  'Unlimited coffee & tea',
  'Standing & sit desks',
  'Printing included',
  'Lockers available',
  'Community events',
];

// Periods to show on the homepage card, in order
const FEATURED_PERIODS: { period: CoworkRatePeriod; label: string; note: string }[] = [
  { period: 'hourly',  label: 'Hourly',    note: 'per hour' },
  { period: 'daily',   label: 'Day Pass',  note: 'full day' },
  { period: 'weekly',  label: 'Weekly',    note: '7 days' },
  { period: 'monthly', label: 'Monthly',   note: 'calendar month' },
];

export function CoworkingCta() {
  const { data: spaces } = useFirestoreSlice<CoworkSpace[]>('spaces', []);

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

  // Derive the "from" headline price (hourly)
  const fromPrice = lowestRate('hourly');
  const fromLabel = fromPrice != null ? `฿${fromPrice.toLocaleString()}/hr.` : '฿50/hr.';

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
              From {fromLabel}<br />
              <span className="text-white/50">No commitment needed.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Whether you need a desk for an hour or a private office for a year,
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
            {FEATURED_PERIODS.map((row, i) => {
              const price = lowestRate(row.period);
              // Hide rows where no space offers this period
              if (price === null) return null;
              return (
                <div
                  key={row.period}
                  className={`flex items-center justify-between py-4 ${i < FEATURED_PERIODS.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  <div>
                    <p className="font-semibold text-white">{row.label}</p>
                    <p className="text-xs text-white/40">{row.note}</p>
                  </div>
                  <p className="text-xl font-bold text-white">฿{price.toLocaleString()}</p>
                </div>
              );
            })}
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
