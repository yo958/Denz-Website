'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/types';
import { Calendar, Clock, Tag } from 'lucide-react';

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Single-field query (no composite index needed). Sort client-side.
        const q = query(
          collection(db, 'blog-posts'),
          where('status', '==', 'published'),
        );
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BlogPost);
        setPosts(
          all.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)),
        );
      } catch {
        setPosts([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-ink mb-3">Blog</h1>
        <p className="text-ink-muted text-lg">Tips, guides, and stories from Denz Coworking & Café, Kathu, Phuket.</p>
      </div>

      {loading && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-lg">No articles published yet. Check back soon!</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <article key={post.id} className="group rounded-2xl border border-ink/10 overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <Link href={`/blog/${post.slug}`}>
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
                      <Link
                        key={cat}
                        href={`/blog/category/${cat}`}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-lg font-bold text-ink group-hover:text-brand transition-colors leading-snug mb-2">
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
      )}
    </main>
  );
}
