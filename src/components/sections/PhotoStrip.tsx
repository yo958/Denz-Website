'use client';

import { motion } from 'framer-motion';

const PHOTOS = [
  { src: '/images/coworking-evening.jpg', alt: 'Denz coworking space at sunset', wide: true },
  { src: '/images/private-office.jpg', alt: 'Private office studio at Denz', wide: false },
  { src: '/images/food-cashew-chicken.jpg', alt: 'Cashew chicken at Denz Cafe', wide: false },
  { src: '/images/phuket-sunset.jpg', alt: 'Phuket sunset view from Denz', wide: false },
];

export function PhotoStrip() {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 h-64 md:h-80"
      >
        {/* First photo takes double column on larger screens */}
        <div className="col-span-2 md:col-span-2 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTOS[0].src}
            alt={PHOTOS[0].alt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        {PHOTOS.slice(1).map((photo) => (
          <div key={photo.src} className="rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
