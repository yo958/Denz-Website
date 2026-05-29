'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/types';
import { Calendar, Clock } from 'lucide-react';

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

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'blog-posts'), where('status', '==', 'published'));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BlogPost);
        setPosts(all.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)));
      } catch {
        setPosts([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Collect all unique categories from published posts, ordered by frequency
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(p => p.categories.forEach(c => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => slug);
  }, [posts]);

  const filtered = activeCategory
    ? posts.filter(p => p.categories.includes(activeCategory))
    : posts;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setVisibleCount(20);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">Denz Phuket Guide</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4 leading-tight">
          Your local guide to<br className="hidden sm:block" /> life in Phuket
        </h1>
        <p className="text-ink-muted text-lg max-w-2xl leading-relaxed">
          From the best spots to eat and work, to events, adventures, and hidden gems — written by the team at Denz in Kathu.
        </p>
      </div>

      {/* Category filters + post count */}
      {!loading && posts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-brand text-white'
                : 'bg-ink/5 text-ink-muted hover:bg-ink/10'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                activeCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-ink/5 text-ink-muted hover:bg-ink/10'
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

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-ink/10 overflow-hidden animate-pulse">
              <div className="h-48 bg-ink/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-ink/5 rounded w-3/4" />
                <div className="h-4 bg-ink/5 rounded w-full" />
                <div className="h-4 bg-ink/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-lg">{activeCategory ? 'No articles in this category yet.' : 'No articles published yet. Check back soon!'}</p>
          {activeCategory && (
            <button onClick={() => handleCategoryChange(null)} className="mt-3 text-brand hover:underline text-sm">View all articles</button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
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
    </main>
  );
}
