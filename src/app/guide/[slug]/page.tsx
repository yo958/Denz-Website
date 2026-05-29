'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/types';
import { Calendar, Clock, ChevronRight, Tag, List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Parse h2/h3 headings from HTML string and inject id attributes */
function processContent(html: string): { processed: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const processed = html.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (_, tag, inner) => {
    const level = parseInt(tag[1]) as 2 | 3;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
    toc.push({ id, text, level });
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
  return { processed, toc };
}

function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  if (toc.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <List size={16} className="text-brand" />
        <span className="text-sm font-semibold text-ink">Contents</span>
      </div>
      <ol className="space-y-1">
        {toc.map(item => (
          <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${item.id}`}
              className={`block text-sm py-0.5 transition-colors hover:text-brand ${
                activeId === item.id
                  ? 'text-brand font-medium'
                  : 'text-ink-muted'
              }`}
            >
              {item.level === 3 && <span className="mr-1 opacity-40">›</span>}
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        // Fetch current post
        const q = query(
          collection(db, 'blog-posts'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const currentPost = { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
          setPost(currentPost);

          // Fetch other published posts for the related section
          const allSnap = await getDocs(
            query(collection(db, 'blog-posts'), where('status', '==', 'published')),
          );
          const others = allSnap.docs
            .map(d => ({ id: d.id, ...d.data() }) as BlogPost)
            .filter(p => p.slug !== slug);

          // Prioritise same-category posts, then fill with newest
          const sameCategory = others.filter(p =>
            currentPost.categories.some(c => p.categories.includes(c)),
          );
          const rest = others.filter(p =>
            !currentPost.categories.some(c => p.categories.includes(c)),
          );
          const sorted = [
            ...sameCategory.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)),
            ...rest.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)),
          ];
          setRelated(sorted.slice(0, 6));
        }
      } catch {
        setPost(null);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Track active heading for TOC highlight
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2[id], h3[id]');
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [post]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12 animate-pulse">
        <div className="h-8 bg-ink/5 rounded w-2/3 mb-4" />
        <div className="h-64 bg-ink/5 rounded-2xl mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-ink/5 rounded" />)}
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12 text-center">
        <h1 className="text-2xl font-bold text-ink mb-3">Article not found</h1>
        <Link href="/guide" className="text-brand hover:underline text-sm">← Back to Guide</Link>
      </main>
    );
  }

  const { processed, toc } = processContent(post.content);

  return (
    <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand transition-colors">Home</Link>
        <ChevronRight size={12} className="shrink-0" />
        <Link href="/guide" className="hover:text-brand transition-colors">Guide</Link>
        {post.categories[0] && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <Link
              href={`/guide/category/${post.categories[0]}`}
              className="hover:text-brand transition-colors capitalize"
            >
              {post.categories[0].replace(/-/g, ' ')}
            </Link>
          </>
        )}
        <ChevronRight size={12} className="shrink-0" />
        <span className="text-ink truncate max-w-xs">{post.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
        {/* Article */}
        <article>
          {/* Feature image */}
          {post.featureImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featureImage}
              alt={post.title}
              className="w-full rounded-2xl mb-8 object-cover max-h-[420px]"
            />
          )}

          {/* Meta */}
          <div className="mb-6">
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.map(cat => (
                  <Link
                    key={cat}
                    href={`/guide/category/${cat}`}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
              {post.author && <span>By {post.author}</span>}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />{fmtDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={13} />{readingTime(post.content)}
              </span>
            </div>
          </div>

          {/* Mobile TOC */}
          {toc.length >= 3 && (
            <div className="lg:hidden mb-8">
              <TableOfContents toc={toc} activeId={activeId} />
            </div>
          )}

          {/* Article body */}
          <div
            ref={contentRef}
            className={[
              'prose prose-ink max-w-none',
              '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-24',
              '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-24',
              '[&_p]:text-ink-muted [&_p]:leading-relaxed [&_p]:my-4',
              '[&_strong]:text-ink [&_strong]:font-semibold',
              '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5',
              '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5',
              '[&_li]:text-ink-muted [&_li]:leading-relaxed',
              '[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline',
              '[&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-muted',
              '[&_code]:bg-ink/5 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: processed }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-ink/10">
              <div className="flex flex-wrap items-center gap-2">
                <Tag size={14} className="text-ink-muted" />
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/guide/tag/${tag}`}
                    className="text-xs px-3 py-1 rounded-full bg-ink/5 text-ink-muted hover:bg-brand/10 hover:text-brand transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-ink/10">
              <h2 className="text-lg font-bold text-ink mb-5">More Articles</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map(rel => (
                  <Link key={rel.id} href={`/guide/${rel.slug}`} className="group block rounded-2xl border border-ink/10 overflow-hidden hover:shadow-md transition-shadow bg-white">
                    {rel.featureImage
                      ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rel.featureImage}
                          alt={rel.title}
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                      : (
                        <div className="w-full h-36 bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center">
                          <span className="text-3xl opacity-30">✍️</span>
                        </div>
                      )}
                    <div className="p-4">
                      {rel.categories[0] && (
                        <span className="text-xs font-medium text-brand capitalize">
                          {rel.categories[0].replace(/-/g, ' ')}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors mt-1 line-clamp-2 leading-snug">
                        {rel.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-ink-muted">
                        {rel.publishedAt && <span>{fmtDate(rel.publishedAt)}</span>}
                        <span>·</span>
                        <span>{readingTime(rel.content)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-8">
            <Link href="/guide" className="text-sm text-brand hover:underline flex items-center gap-1.5">
              ← Back to Guide
            </Link>
          </div>
        </article>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {toc.length >= 2 && <TableOfContents toc={toc} activeId={activeId} />}

            {/* Coworking promo */}
            <Link
              href="/coworking"
              className="group block rounded-2xl border border-violet-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">💻 Coworking</p>
              <p className="text-sm font-bold text-ink leading-snug mb-1">Hot Desks &amp; Private Offices</p>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Fast Wi-Fi, great coffee, and a productive atmosphere in the heart of Phuket.</p>
              <span className="inline-block text-xs font-semibold text-violet-600 group-hover:text-violet-800 transition-colors">
                See spaces →
              </span>
            </Link>

            {/* Rooms promo */}
            <Link
              href="/rooms"
              className="group block rounded-2xl border border-emerald-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">🛏️ Rooms</p>
              <p className="text-sm font-bold text-ink leading-snug mb-1">Stay at Denz Phuket</p>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Comfortable rooms with a social vibe — perfect for digital nomads and travellers.</p>
              <span className="inline-block text-xs font-semibold text-emerald-600 group-hover:text-emerald-800 transition-colors">
                View rooms →
              </span>
            </Link>

            {/* Menu / café promo */}
            <Link
              href="/menu"
              className="group block rounded-2xl border border-amber-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">☕ Café &amp; Food</p>
              <p className="text-sm font-bold text-ink leading-snug mb-1">Eat &amp; Drink at Denz</p>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Fresh food, great coffee, and smoothies — fuel your day without leaving the vibe.</p>
              <span className="inline-block text-xs font-semibold text-amber-600 group-hover:text-amber-800 transition-colors">
                See the menu →
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
