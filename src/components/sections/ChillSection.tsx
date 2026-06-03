'use client';

import { Gamepad2, Tv, Sofa, Users } from 'lucide-react';

const FEATURES = [
  { icon: Sofa,     label: 'Bean bags & sofas' },
  { icon: Tv,       label: 'TV lounge' },
  { icon: Gamepad2, label: 'Nintendo 64' },
  { icon: Users,    label: 'Community vibes' },
];

export function ChillSection() {
  return (
    <section className="py-24 bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-4">
              Chill space
            </span>
            <h2 className="text-4xl font-bold text-white leading-tight mb-5">
              Chill Space & Social Lounge in Phuket
            </h2>
            <p className="text-white/50 text-lg mb-2">Not everything has to be productive.</p>
            <p className="text-white/70 leading-relaxed mb-4">
              The Denz chill lounge is your communal living room in Phuket. Bean bags, panoramic Patong Bay views, a TV, and a Nintendo 64 for when a multiplayer game of GoldenEye feels more important than your inbox.
            </p>
            <p className="text-white/70 leading-relaxed mb-10">
              It&apos;s a place to decompress, meet fellow remote workers and travellers, swap stories, and make the kind of connections that don&apos;t happen in a regular office. Come for the work, stay for the vibe.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/chill-area.webp"
              alt="Denz chill lounge — sofas and jungle views"
              className="w-full h-full object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white text-sm font-semibold">Panoramic Patong Bay views</p>
              <p className="text-white/60 text-xs mt-0.5">From the balcony &amp; chill lounge</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
