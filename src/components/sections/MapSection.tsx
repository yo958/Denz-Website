'use client';

import { MapPin, Clock, Phone } from 'lucide-react';
import { useVenueSettings, formatOpeningHours } from '@/hooks/useVenueSettings';

export function MapSection() {
  const settings = useVenueSettings();
  const hoursLines = settings.venue.openingHours
    ? formatOpeningHours(settings.venue.openingHours)
    : ['Mon – Fri: 10:00 – 23:30', 'Sat – Sun: Closed', 'Kitchen: 11:00 – 22:00'];

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
                    2/124 Soi Khuanyang, Pa Tong<br />
                    Kathu District, Phuket 83120, Thailand
                  </p>
                  <p className="text-ink-muted text-sm mt-2">
                    On Patong Hill between Kathu and Patong — turn left opposite the rescue centre at the base of the hill, just before the temple. Look for us near the Patong City Sign.
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
              href="https://maps.app.goo.gl/DvhWG46V5XLVdurTA"
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
              src="https://maps.google.com/maps?q=7.904440952130485,98.31809068833462&z=17&output=embed"
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
