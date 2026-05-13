'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    name: 'Alex M.',
    flag: '🇬🇧',
    text: 'Best coworking spot in Phuket. The WiFi is genuinely fast, the food is great and the views are stunning. I come here every day.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    flag: '🇩🇪',
    text: 'Found this gem through a friend. The atmosphere is perfect for focused work — not too loud, great coffee, and the staff are super friendly.',
    rating: 5,
  },
  {
    name: 'Jordan T.',
    flag: '🇦🇺',
    text: "Finally a coworking café that actually delivers on the internet speeds. Monthly package is great value and the Thai food is legitimately delicious.",
    rating: 5,
  },
  {
    name: 'Mia L.',
    flag: '🇫🇷',
    text: "The terrace with mountain views makes every work day feel like a holiday. I've tried every café in Phuket and Denz is by far the best.",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Reviews
          </span>
          <h2 className="text-4xl font-bold text-ink">Loved by nomads</h2>
          <p className="text-ink-muted mt-3">Don&apos;t take our word for it.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white border border-ink-faint/30 rounded-2xl p-6 shadow-sm"
            >
              <Stars count={review.rating} />
              <p className="text-sm text-ink-muted leading-relaxed mt-3 mb-4">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{review.flag}</span>
                <span className="text-sm font-semibold text-ink">{review.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
