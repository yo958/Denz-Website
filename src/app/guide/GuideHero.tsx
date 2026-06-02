'use client';

import { usePageContent } from '@/hooks/usePageContent';

export function GuideHero() {
  const content = usePageContent<{ hero?: { badge?: string; title?: string; body?: string } }>('guide');
  const badge = content.hero?.badge || 'Denz Phuket Guide';
  const title = content.hero?.title || 'Your local guide to life in Phuket';
  const body  = content.hero?.body  || 'From the best spots to eat and work, to events, adventures, and hidden gems — written by the team at Denz in Kathu.';

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">{badge}</p>
      <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4 leading-tight">{title}</h1>
      <p className="text-ink-muted text-lg max-w-2xl leading-relaxed">{body}</p>
    </div>
  );
}
