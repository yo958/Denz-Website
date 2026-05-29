'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPost } from '@/types';

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function slugToLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function GuideListingClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(p => p.categories.forEach(c => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => slug);
  }, [posts]);

  const filtered = activeCategory ? posts.filter(p => p.categories.includes(activeCategory)) : posts;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setVisibleCount(20);
  }

  return (
    <>
      {/* Category filters */}
      {posts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null ? 'bg-brand text-white' : 'bg-ink/5 text-ink-muted hover:bg-ink/10'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                activeCategory === cat ? 'bg-brand text-white' : 'bg-ink/5 text-ink-muted hover:bg-ink/10'
              }`}
            >
              {slugToLabel(cat)}
            </button>
          ))}
          <span className="ml-auto text-sm text-ink-muted">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </span>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-lg">{activeCategory ? 'No articles in this category yet.' : 'No articles published yet. Check back soon!'}</p>
          {activeCategory && (
            <button onClick={() => handleCategoryChange(null)} className="mt-3 text-brand hover:underline text-sm">
              View all articles
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map(post => (
              <article key={post.id} className="group rounded-2xl border border-ink/10 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <Link href={`/guide/${post.slug}`}>
                  {post.featureImage
                    ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featureImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                    : (
                      <div className="w-full h-48 bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center">
                        <span className="text-4xl opacity-30">✍️</span>
                      </div>
                    )}
                </Link>
                <div className="p-5">
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors capitalize"
                        >
                          {slugToLabel(cat)}
                        </button>
                      ))}
                    </div>
                  )}
                  <Link href={`/guide/${post.slug}`}>
                    <h2 className="text-base font-bold text-ink group-hover:text-brand transition-colors leading-snug mb-2">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="text-sm text-ink-muted line-clamp-2 mb-4">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />{fmtDate(post.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} />{readingTime(post.content)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount(c => c + 20)}
                className="px-8 py-3 rounded-full border border-ink/20 text-sm font-medium text-ink-muted hover:bg-ink/5 hover:border-ink/30 transition-colors"
              >
                Load more · {filtered.length - visibleCount} remaining
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
