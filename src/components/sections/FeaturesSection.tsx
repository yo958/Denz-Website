'use client';

import Link from 'next/link';
import { ArrowRight, Wifi, UtensilsCrossed, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: Wifi,
    eyebrow: 'Coworking',
    title: 'Coworking Space in Phuket',
    description:
      'Gigabit WiFi, standing desks, private offices and flexible packages from day passes to monthly. Start from just ฿200/day.',
    href: '/coworking',
    cta: 'View packages',
    accent: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: UtensilsCrossed,
    eyebrow: 'Café',
    title: 'Thai & Western Food in Kathu, Phuket',
    description:
      'Freshly cooked Thai classics, western breakfasts, great coffee and fresh smoothies — all day, every day.',
    href: '/menu',
    cta: 'See the menu',
    accent: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: BedDouble,
    eyebrow: 'Stay',
    title: 'WorkStay Rooms for Remote Workers in Phuket',
    description:
      'Clean, comfortable rooms right above the café with Patong Bay views, gigabit WiFi and direct coworking access.',
    href: '/rooms',
    cta: 'See rooms',
    accent: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          What we offer
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight">
          Coworking, Café & Rooms<br />in One Place in Phuket
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.eyebrow}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              href={feat.href}
              className={`group block rounded-2xl p-8 ${feat.accent} border border-transparent hover:border-ink-faint/30 hover:shadow-md transition-all duration-200 h-full`}
            >
              <div className={`inline-flex p-3 rounded-xl ${feat.iconBg} mb-5`}>
                <feat.icon className={`w-6 h-6 ${feat.iconColor}`} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-1">
                {feat.eyebrow}
              </p>
              <h3 className="text-xl font-bold text-ink mb-3">{feat.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-5">{feat.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
                {feat.cta}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
