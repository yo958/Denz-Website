'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
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
  // Append size param if not already present
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

interface ReviewsSectionProps {
  tag?: ReviewTag;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function ReviewsSection({
  tag,
  limit = 8,
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
        const all = (data.reviews ?? [])
          .filter(r => r.approved && r.visible)
          .filter(r => tag ? r.tags?.includes(tag) : true)
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
          })
          .slice(0, limit);
        setReviews(all);
      })
      .catch(() => {});
  }, [tag, limit]);

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
                {review.photos[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={googlePhotoUrl(review.photos[0])}
                    alt=""
                    className="w-full aspect-video object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
                  />
                )}
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
