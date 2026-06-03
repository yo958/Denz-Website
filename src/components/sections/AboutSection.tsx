'use client';

import { motion } from 'framer-motion';
import { useVenueSettings, getTodayHours } from '@/hooks/useVenueSettings';

const STATS = [
  { value: '1 Gbps', label: 'Fibre internet' },
  { value: '฿200', label: 'From per day' },
  { value: '10+', label: 'Desk options' },
  { value: '5★', label: 'Avg. review' },
];

interface AboutContent {
  title?: string;
  body1?: string;
  body2?: string;
}

export function AboutSection({ content = {} }: { content?: AboutContent }) {
  const title = content.title || 'Coworking Space in Kathu, Phuket';
  const body1 = content.body1 || 'Nestled between the mountains of Kathu and the beaches of Patong, Denz is where remote workers, freelancers and digital nomads call their second home in Phuket.';
  const body2 = content.body2 || 'We built Denz because we wanted a place that had everything — fast internet, proper food, comfortable desks and a community that gets it. No pretension, just a great place to get things done.';
  const settings = useVenueSettings();
  const todayHours = getTodayHours(settings);

  return (
    <section className="py-24 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-raised shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/about-coworking.jpg"
                alt="Denz Coworking Cafe open area at sunset"
                className="w-full h-full object-cover"
                width={800}
                height={600}
                loading="lazy"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-ink-faint/20">
              <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Open today</p>
              <p className="font-bold text-ink text-sm">{todayHours}</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-4">
              About Denz
            </span>
            <h2 className="text-4xl font-bold text-ink leading-tight mb-5">
              {title}
            </h2>
            <p className="text-ink-muted leading-relaxed mb-4">{body1}</p>
            <p className="text-ink-muted leading-relaxed mb-10">{body2}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-ink">{stat.value}</p>
                  <p className="text-xs text-ink-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
