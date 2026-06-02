'use client';

import { MapPin, Clock, Globe, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useVenueSettings, formatOpeningHours } from '@/hooks/useVenueSettings';
import { usePageContent } from '@/hooks/usePageContent';

export default function ContactPage() {
  const settings = useVenueSettings();
  const pageContent = usePageContent<{ hero?: { title?: string; subtitle?: string } }>('contact');
  const hoursLines = settings.venue.openingHours
    ? formatOpeningHours(settings.venue.openingHours)
    : ['Mon – Sun: 10:00 – 23:30'];

  return (
    <>
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">Contact</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">{pageContent.hero?.title || 'Get in touch'}</h1>
          <p className="text-ink-muted max-w-md">
            {pageContent.hero?.subtitle || "Have a question? Slide into our DMs on Instagram or swing by in person — we're open every day."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink">Address</p>
                <p className="text-ink-muted text-sm mt-1">Kathu, Pa Tong<br />Phuket 83120, Thailand</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink">Hours</p>
                <div className="text-ink-muted text-sm mt-1 space-y-0.5">
                  {hoursLines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink">Social</p>
                <div className="flex gap-3 mt-2">
                  <a
                    href="https://instagram.com/denzphuket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    @denzphuket
                  </a>
                  <a
                    href="https://facebook.com/denzphuket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-surface-muted border border-ink-faint/20 rounded-full px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-ink-faint/20 shadow-sm aspect-[4/3]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.1!2d98.3167!3d7.9156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNTQnNTYuMiJOIDk4wrAxOCc1OS45IkU!5e0!3m2!1sen!2sth!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Denz location"
            />
          </div>
        </div>
      </div>
    </>
  );
}
