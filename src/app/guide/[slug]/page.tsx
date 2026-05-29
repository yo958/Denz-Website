'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/types';
import { Calendar, Clock, ChevronRight, Tag, List, Wifi, UtensilsCrossed, BedDouble, ArrowRight } from 'lucide-react';

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
function ytEmbed(videoId: string): string {
  return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1.5rem 0"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`;
}

function processContent(html: string): { processed: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let out = html;

  // Convert wp-block-embed__wrapper figures with YouTube URLs → iframe
  out = out.replace(/<figure[^>]*wp-block-embed[^>]*>[\s\S]*?<div[^>]*wp-block-embed__wrapper[^>]*>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]*v=|youtu\.be\/)([\w-]{11})[^\s<]*)\s*<\/div>[\s\S]*?<\/figure>/gi, (_, _url, videoId) => ytEmbed(videoId));

  // Convert bare YouTube URLs in <p> tags to responsive iframes
  out = out.replace(/<p[^>]*>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]*v=|youtu\.be\/)([\w-]{11})[^\s<]*)\s*<\/p>/gi, (_, _url, videoId) => ytEmbed(videoId));

  // Inject heading IDs for TOC
  out = out.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (_, tag, inner) => {
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

  return { processed: out, toc };
}

function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  // Group into sections: each H2 with its following H3 children
  const sections = toc.reduce<{ h2: TocItem; h3s: TocItem[] }[]>((acc, item) => {
    if (item.level === 2) acc.push({ h2: item, h3s: [] });
    else if (acc.length > 0) acc[acc.length - 1].h3s.push(item);
    return acc;
  }, []);

  // Track which H2s are open; auto-open the one containing the active item
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const active = toc.find(t => t.id === activeId);
    if (!active) return;
    if (active.level === 2) {
      setOpen(prev => new Set([...prev, active.id]));
    } else {
      // Find parent H2
      const idx = toc.indexOf(active);
      for (let i = idx - 1; i >= 0; i--) {
        if (toc[i].level === 2) { setOpen(prev => new Set([...prev, toc[i].id])); break; }
      }
    }
  }, [activeId, toc]);

  if (toc.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <List size={15} className="text-brand shrink-0" />
        <span className="text-sm font-semibold text-ink">Contents</span>
      </div>
      <ol className="space-y-0.5">
        {sections.map(({ h2, h3s }) => {
          const isOpen = open.has(h2.id);
          const h2Active = activeId === h2.id;
          const h3Active = h3s.some(h => h.id === activeId);
          return (
            <li key={h2.id}>
              <div className="flex items-center gap-1">
                <a
                  href={`#${h2.id}`}
                  className={`flex-1 text-sm py-1 leading-snug transition-colors hover:text-brand ${
                    h2Active ? 'text-brand font-semibold' : 'text-ink font-medium'
                  }`}
                >
                  {h2.text}
                </a>
                {h3s.length > 0 && (
                  <button
                    onClick={() => setOpen(prev => { const n = new Set(prev); n.has(h2.id) ? n.delete(h2.id) : n.add(h2.id); return n; })}
                    className="p-0.5 rounded text-ink-muted hover:text-brand transition-colors shrink-0"
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    <ChevronRight size={13} className={`transition-transform duration-200 ${(isOpen || h3Active) ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
              {h3s.length > 0 && (isOpen || h3Active) && (
                <ol className="ml-3 border-l border-ink/10 pl-3 mt-0.5 mb-1 space-y-0.5">
                  {h3s.map(h3 => (
                    <li key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        className={`block text-xs py-0.5 leading-snug transition-colors hover:text-brand ${
                          activeId === h3.id ? 'text-brand font-medium' : 'text-ink-muted'
                        }`}
                      >
                        {h3.text}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
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

  // Load Instagram embed script when post content contains Instagram embeds
  useEffect(() => {
    if (!post?.content?.includes('instagram-media')) return;
    const w = window as Window & { instgrm?: { Embeds: { process: () => void } } };
    if (w.instgrm) {
      w.instgrm.Embeds.process();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embeds.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [post]);

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 animate-pulse">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
        <h1 className="text-2xl font-bold text-ink mb-3">Article not found</h1>
        <Link href="/guide" className="text-brand hover:underline text-sm">← Back to Guides</Link>
      </main>
    );
  }

  const { processed, toc } = processContent(post.content);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand transition-colors">Home</Link>
        <ChevronRight size={12} className="shrink-0" />
        <Link href="/guide" className="hover:text-brand transition-colors">Guides</Link>
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

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
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
              '[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-6',
              '[&_iframe]:w-full [&_iframe]:rounded-xl',
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
              ← Back to Guides
            </Link>
          </div>
        </article>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">

            {/* Coworking promo */}
            <Link href="/coworking" className="group block rounded-2xl p-5 bg-blue-50 border border-transparent hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-blue-100 mb-3">
                <Wifi className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Coworking</p>
              <h3 className="text-sm font-bold text-ink mb-1.5 leading-snug">Your office away from home</h3>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Gigabit WiFi, standing desks, private offices and flexible packages. From ฿200/day.</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                View packages <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Café promo */}
            <Link href="/menu" className="group block rounded-2xl p-5 bg-orange-50 border border-transparent hover:border-orange-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-orange-100 mb-3">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Café</p>
              <h3 className="text-sm font-bold text-ink mb-1.5 leading-snug">Thai &amp; western food, done right</h3>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Freshly cooked Thai classics, western breakfasts, great coffee and fresh smoothies.</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                See the menu <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Rooms promo */}
            <Link href="/rooms" className="group block rounded-2xl p-5 bg-green-50 border border-transparent hover:border-green-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-green-100 mb-3">
                <BedDouble className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Stay</p>
              <h3 className="text-sm font-bold text-ink mb-1.5 leading-snug">Sleep, work, repeat</h3>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">Clean, comfortable rooms right above the café. Wake up, grab a coffee and get to work.</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                See rooms <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {toc.length >= 2 && <TableOfContents toc={toc} activeId={activeId} />}
          </div>
        </aside>
      </div>
    </main>
  );
}
