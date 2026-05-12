'use client';

import { MapPin, Clock, Phone } from 'lucide-react';
import { useVenueSettings, formatOpeningHours } from '@/hooks/useVenueSettings';

export function MapSection() {
  const settings = useVenueSettings();
  const hoursLines = settings.venue.openingHours
    ? formatOpeningHours(settings.venue.openingHours)
    : ['Mon – Sun: 10:00 – 23:30'];

  return (
    <section className="py-24 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-4">
              Find us
            </span>
            <h2 className="text-4xl font-bold text-ink mb-8">Get directions</h2>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Address</p>
                  <p className="text-ink-muted text-sm mt-1">
                    Kathu, Pa Tong<br />
                    Phuket 83120, Thailand
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Opening hours</p>
                  <div className="text-ink-muted text-sm mt-1 space-y-1">
                    {hoursLines.map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-semibold text-ink">Contact</p>
                  <p className="text-ink-muted text-sm mt-1">
                    <a href="https://instagram.com/denzphuket" className="hover:text-brand transition-colors">
                      @denzphuket on Instagram
                    </a>
                  </p>
                </div>
              </li>
            </ul>

            <a
              href="https://maps.google.com/?q=Denz+Coworking+Phuket"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-ink/80 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>

          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-ink-faint/20 aspect-[4/3]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.1!2d98.3167!3d7.9156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNTQnNTYuMiJOIDk4wrAxOCc1OS45IkU!5e0!3m2!1sen!2sth!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Denz location map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
