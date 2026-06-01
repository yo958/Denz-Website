'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Where is Denz located?',
    a: 'Denz is on Patong Hill, nestled between Patong Beach and Kathu. We\'re on Soi Khuanyang — turn left opposite the rescue centre at the base of the hill, just before the large temple. You\'ve probably passed us on the Kathu–Patong road.',
  },
  {
    q: 'What are the opening hours?',
    a: 'We\'re open Monday to Friday, 10:00 AM – 11:30 PM. The kitchen serves food from 11:00 AM – 10:00 PM. We are closed on Saturdays and Sundays, but can extend hours upon request.',
  },
  {
    q: 'Do I need a coworking pass just to eat or drink?',
    a: 'No — everyone is welcome to visit Denz as a café guest. You can order food, coffee, or a smoothie and enjoy the space without buying a coworking pass. A pass is only required if you plan to work during your visit.',
  },
  {
    q: 'How does coworking work at Denz?',
    a: 'Simply choose a coworking plan and pick any available desk. Day passes start from ฿200. We also offer weekly, monthly, and longer packages. Walk-ins are welcome — no reservation needed for most desks.',
  },
  {
    q: 'How many desks and screens are there?',
    a: 'We have 8 individual desks (including adjustable standing desks), plus dining tables, sofas, and a full balcony. There are 10 external monitors available on a first-come, first-served basis — ask the team if you need one urgently.',
  },
  {
    q: 'What is the WiFi like?',
    a: 'Business-grade dual fibre delivering up to 1000/1000 Mbps, with a dedicated backup line for redundancy. Some say we have the best coworking internet in Phuket — you can be the judge.',
  },
  {
    q: 'Is there a private office?',
    a: 'Yes. We have an air-conditioned private office available hourly, daily, weekly, or monthly. It\'s equipped with a standing desk, external monitor, and an optional two-seater sofa — ideal for calls, confidential work, or deep focus.',
  },
  {
    q: 'What food and coffee do you serve?',
    a: 'We serve freshly cooked Thai and Western dishes — our famous Thai chicken cashew nuts and Fatboy Burger are customer favourites. Coffee comes with multiple milk options including nut milks, plus caramel, cinnamon, and honey. Free coffee and tea are included with all coworking packages.',
  },
  {
    q: 'Is there printing available?',
    a: 'Yes — we offer printing and scanning services at ฿10 per page.',
  },
  {
    q: 'Is there parking?',
    a: 'Yes, parking is available at the front and side of the building.',
  },
  {
    q: 'What about the dogs?',
    a: 'Denz is home to five French Bulldogs — Denz, Frank, Coco, Isabell (Bell), and Little Luna — who roam the space freely. We\'re not a dog café, but they\'re a beloved part of the atmosphere. If you\'d like to bring your own pet, please check with our team first.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-surface-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            FAQs
          </span>
          <h2 className="text-4xl font-bold text-ink">Questions about Denz</h2>
          <p className="text-ink-muted mt-3">Everything you need to know before your first visit.</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-ink-faint/30 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-ink text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-ink-muted text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
