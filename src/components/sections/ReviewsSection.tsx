'use client';

import { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ReviewTag = 'food' | 'coworking' | 'rooms' | 'general';

interface GoogleReview {
  reviewId: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  photos: string[];
  publishedAt: string;
  visible: boolean;
  tags: ReviewTag[];
  approved: boolean;
}

interface ReviewsDoc {
  reviews?: GoogleReview[];
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-border'}`} />
      ))}
    </div>
  );
}

/** Route Google CDN images through the server-side proxy (avoids browser referrer blocks) */
function googlePhotoUrl(url: string, size = 'w800'): string {
  if (!url.includes('googleusercontent.com')) return url;
  const sized = /=[swh]\d/.test(url) ? url : `${url}=${size}`;
  return `/api/proxy-image?url=${encodeURIComponent(sized)}`;
}

function GoogleBadge() {
  return (
    <span className="ml-auto text-[10px] font-semibold tracking-wide text-muted-foreground border border-ink-faint/20 rounded px-1.5 py-0.5 shrink-0">
      Google
    </span>
  );
}

/** Photo carousel for review cards — shows all photos with prev/next arrows + dot indicators */
function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={googlePhotoUrl(photos[0])}
        alt=""
        className="w-full aspect-video object-cover"
        onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
      />
    );
  }

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); };

  return (
    <div className="relative w-full aspect-video overflow-hidden group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={googlePhotoUrl(photos[idx])}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
      />

      {/* Prev / Next arrows — visible on hover */}
      <button
        onClick={prev}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={next}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
      >
        <ChevronRight size={14} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setIdx(i); }}
            aria-label={`Photo ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>

      {/* Photo count badge */}
      <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
        {idx + 1}/{photos.length}
      </div>
    </div>
  );
}

interface ReviewsSectionProps {
  tag?: ReviewTag;
  limit?: number;
  minItems?: number;
  title?: string;
  subtitle?: string;
}

const byRatingThenDate = (a: GoogleReview, b: GoogleReview) => {
  if (b.rating !== a.rating) return b.rating - a.rating;
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
};

export function ReviewsSection({
  tag,
  limit = 8,
  minItems = 4,
  title = 'Loved by nomads',
  subtitle = "Don't take our word for it.",
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDoc(doc(db, 'venue-settings', 'google-reviews'))
      .then(snap => {
        if (!snap.exists()) return;
        const data = snap.data() as ReviewsDoc;
        const approved = (data.reviews ?? []).filter(r => r.approved && r.visible);

        // Primary: reviews matching the requested tag
        const primary = tag
          ? approved.filter(r => r.tags?.includes(tag)).sort(byRatingThenDate)
          : approved.sort(byRatingThenDate);

        let result = primary.slice(0, limit);

        // Fallback: if we have fewer than minItems, top up with other approved reviews
        if (tag && result.length < minItems) {
          const usedIds = new Set(result.map(r => r.reviewId));
          const fallback = approved
            .filter(r => !usedIds.has(r.reviewId))
            .sort(byRatingThenDate);
          result = [...result, ...fallback].slice(0, Math.max(minItems, result.length));
        }

        setReviews(result);
      })
      .catch(() => {});
  }, [tag, limit, minItems]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Reviews
          </span>
          <h2 className="text-4xl font-bold text-ink">{title}</h2>
          <p className="text-ink-muted mt-3">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review, i) => {
            const isExpanded = expanded.has(review.reviewId);
            const longText = review.text.length > 200;
            return (
              <motion.div
                key={review.reviewId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-ink-faint/30 rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                <PhotoCarousel photos={review.photos} />

                <div className="p-6 flex flex-col flex-1">
                  <Stars count={review.rating} />
                  <p className={`text-sm text-ink-muted leading-relaxed mt-3 mb-4 ${!isExpanded && longText ? 'line-clamp-4' : ''}`}>
                    &ldquo;{review.text}&rdquo;
                  </p>
                  {longText && (
                    <button
                      onClick={() => setExpanded(prev => {
                        const next = new Set(prev);
                        next.has(review.reviewId) ? next.delete(review.reviewId) : next.add(review.reviewId);
                        return next;
                      })}
                      className="text-xs text-brand underline mb-3 text-left cursor-pointer"
                    >
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                  <div className="mt-auto flex items-center gap-2">
                    {review.authorPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={googlePhotoUrl(review.authorPhoto, 's120')} alt={review.authorName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand/20 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-ink truncate">{review.authorName}</span>
                    <GoogleBadge />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
