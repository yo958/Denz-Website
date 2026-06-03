'use client';

import Link from 'next/link';
import { ArrowRight, Wifi, Coffee, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_PILLS = ['1 Gbps WiFi', 'Specialty Coffee', 'Mountain Views'];
const PILL_ICONS = [Wifi, Coffee, Mountain];

interface HeroContent {
  headline?: string;
  subtext?: string;
  cta1?: string;
  cta2?: string;
  locationPill?: string;
  pills?: string[];
}

export function HeroSection({ content = {} }: { content?: HeroContent }) {
  const headline     = content.headline     || 'Work, Eat & Explore.';
  const subtext      = content.subtext      || "Phuket’s favourite coworking café. Fast internet, great Thai & Western food, and the best mountain views on the island.";
  const cta1         = content.cta1         || 'Coworking Prices';
  const cta2         = content.cta2         || 'View Menu';
  const locationPill = content.locationPill || 'Kathu · Pa Tong · Phuket';
  const pills        = content.pills?.length ? content.pills : DEFAULT_PILLS;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bay-view.webp"
          alt="Denz CoWorking outdoor terrace with Patong bay view"
          className="w-full h-full object-cover"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Location pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-surface-raised border border-ink-faint/40 rounded-full px-4 py-2 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            {locationPill}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.08] tracking-tight mb-6"
          >
            <span className="sr-only">Coworking Café in Kathu, Phuket — </span>
            {headline}
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-ink-muted leading-relaxed mb-8 max-w-md"
          >
            {subtext}
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {pills.map((label, i) => {
              const Icon = PILL_ICONS[i % PILL_ICONS.length];
              return (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-white border border-ink-faint/40 rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  {label}
                </span>
              );
            })}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/coworking"
              className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors duration-150"
            >
              {cta1}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white border border-ink-faint/60 text-ink px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-surface-muted transition-colors duration-150 shadow-sm"
            >
              {cta2}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
