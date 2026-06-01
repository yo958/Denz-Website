'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    name: 'Verified Guest',
    flag: '🌍',
    text: 'I had the sloppy Denz, my friend had the Fatboy Burger with onion rings. Both were amazing — I even ordered a second plate of onion rings. Food and view were something that everyone needs to experience. A must visit for any trip to Phuket.',
    rating: 5,
  },
  {
    name: 'Verified Guest',
    flag: '🌍',
    text: "I visited Denz — it's exactly what I was looking for. It's spacious, has lots of greenery, and has a beautiful mountain view. The food is delicious. It's a great place to work remotely. I highly recommend it.",
    rating: 5,
  },
  {
    name: 'Verified Guest',
    flag: '🌍',
    text: 'Beautiful place, best burger in Phuket! Family atmosphere, great welcome. I will definitely come back.',
    rating: 5,
  },
  {
    name: 'Verified Guest',
    flag: '🌍',
    text: 'Denz is more than just a café — it\'s an experience you\'ll never forget. The WiFi is actually 1000 Mbps, the coffee is great, and the Patong Bay views from the balcony are incredible.',
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
