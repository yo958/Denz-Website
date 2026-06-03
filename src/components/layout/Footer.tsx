'use client';

import Link from 'next/link';
import { MapPin, Clock, Globe, Share2, Camera, Music2, Play, AtSign, Briefcase, MessageCircle, Star, MessageSquare } from 'lucide-react';
import { useVenueSettings, formatOpeningHours } from '@/hooks/useVenueSettings';
import type { SocialLink } from '@/types';

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'instagram':  return <Camera className="w-4 h-4" />;
    case 'facebook':   return <Share2 className="w-4 h-4" />;
    case 'tiktok':     return <Music2 className="w-4 h-4" />;
    case 'youtube':    return <Play className="w-4 h-4" />;
    case 'x':          return <AtSign className="w-4 h-4" />;
    case 'linkedin':   return <Briefcase className="w-4 h-4" />;
    case 'whatsapp':   return <MessageCircle className="w-4 h-4" />;
    case 'tripadvisor': return <Star className="w-4 h-4" />;
    case 'threads':    return <MessageSquare className="w-4 h-4" />;
    default:           return <Globe className="w-4 h-4" />;
  }
}

function socialLabel(link: SocialLink): string {
  if (link.label) return link.label;
  const map: Record<string, string> = {
    instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok',
    youtube: 'YouTube', x: 'X / Twitter', linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp', tripadvisor: 'TripAdvisor', threads: 'Threads',
  };
  return map[link.platform] ?? 'Social';
}

export function Footer() {
  const settings = useVenueSettings();
  const hoursLines = settings.venue.openingHours
    ? formatOpeningHours(settings.venue.openingHours)
    : ['Mon – Sun: 10:00 – 23:30'];

  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/denz-logo.png"
              alt="Denz"
              className="h-10 w-auto mix-blend-screen mb-4"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              A coworking café in the heart of Phuket — built for digital nomads,
              remote workers, and anyone who wants great coffee with a mountain view.
            </p>
            {(settings.venue.socialLinks ?? []).length > 0 && (
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                {(settings.venue.socialLinks ?? []).map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={socialLabel(link)}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">Explore</h3>
            <ul className="space-y-2">
              {[
                { label: 'Café Menu', href: '/menu' },
                { label: 'Coworking', href: '/coworking' },
                { label: 'Rooms', href: '/rooms' },
                { label: 'Order Online', href: '/order' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">Visit Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <span>Kathu, Patong, Phuket<br />Thailand 83120</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <span>
                  {hoursLines.map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Denz Coworking Cafe. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
