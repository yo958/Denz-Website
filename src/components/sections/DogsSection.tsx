'use client';

import { PawPrint } from 'lucide-react'; // used for dog name badges

const DOGS = ['Denz', 'Frank', 'Coco', 'Isabell (Bell)', 'Little Luna'];

export function DogsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/dogs.jpg"
              alt="Three of the Denz French Bulldogs sitting inside the café"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-4">
              Meet the locals
            </span>
            <h2 className="text-4xl font-bold text-ink leading-tight mb-5">
              Meet Our 5 French Bulldogs at Denz
            </h2>
            <p className="text-ink-muted leading-relaxed mb-4">
              Denz is home to five French Bulldogs —{' '}
              <span className="font-semibold text-ink">{DOGS.join(', ')}</span> — who roam the space freely and have become something of a Phuket landmark in their own right.
            </p>
            <p className="text-ink-muted leading-relaxed mb-8">
              While we&apos;re not a dog café, our Frenchies are a beloved part of the atmosphere, padding around the premises and keeping the energy calm and welcoming. If you love dogs, you&apos;re going to love it here.
            </p>

            <div className="flex flex-wrap gap-2">
              {DOGS.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 bg-brand/8 text-brand text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  <PawPrint className="w-3.5 h-3.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
