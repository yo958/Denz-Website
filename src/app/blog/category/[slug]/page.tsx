'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/types';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CategoryArchivePage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const catName = slug ? slug.replace(/-/g, ' ') : '';

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        // Firestore doesn't support array-contains + orderBy without a composite index
        // Fetch all published posts and filter client-side
        const snap = await getDocs(collection(db, 'blog-posts'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BlogPost);
        const filtered = all
          .filter(p => p.status === 'published' && p.categories.includes(slug))
          .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
        setPosts(filtered);
      } catch {
        setPosts([]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-8">
        <Link href="/" className="hover:text-brand transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-ink capitalize">{catName}</span>
      </nav>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-brand/10 text-brand capitalize">{catName}</span>
        </div>
        <h1 className="text-3xl font-bold text-ink capitalize">{catName} Articles</h1>
        <p className="text-ink-muted mt-2">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
      </div>

      {loading && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-ink/10 overflow-hidden animate-pulse">
              <div className="h-48 bg-ink/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-ink/5 rounded w-3/4" />
                <div className="h-4 bg-ink/5 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-lg">No articles in this category yet.</p>
          <Link href="/blog" className="mt-3 inline-block text-sm text-brand hover:underline">Browse all articles</Link>
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
