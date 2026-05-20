'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    eyebrow: 'Coworking',
    title: 'Your office away from home',
    description:
      'Gigabit WiFi, standing desks, private offices and flexible packages from day passes to monthly. Start from just ฿200/day.',
    href: '/coworking',
    cta: 'View packages',
    photo: '/images/about-standup.jpg',
    photoAlt: 'Standup desk at Denz Coworking Cafe',
  },
  {
    eyebrow: 'Café',
    title: 'Thai & western food, done right',
    description:
      'Freshly cooked Thai classics, western breakfasts, great coffee and fresh smoothies — all day, every day.',
    href: '/menu',
    cta: 'See the menu',
    photo: '/images/food-green-curry.jpg',
    photoAlt: 'Thai green curry at Denz Cafe',
  },
  {
    eyebrow: 'Stay',
    title: 'Sleep, work, repeat',
    description:
      'Clean, comfortable rooms right above the café. Wake up, grab a coffee and get straight to work.',
    href: '/rooms',
    cta: 'See rooms',
    photo: '/images/room-honeymoon.png',
    photoAlt: 'Honey Moon Suite at Denz',
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
          Everything you need,<br />in one place
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
              className="group block rounded-2xl overflow-hidden border border-ink-faint/20 hover:shadow-lg transition-all duration-200 h-full bg-white"
            >
              {/* Photo */}
              <div className="aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feat.photo}
                  alt={feat.photoAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Text */}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">
                  {feat.eyebrow}
                </p>
                <h3 className="text-xl font-bold text-ink mb-3">{feat.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed mb-5">{feat.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
                  {feat.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
