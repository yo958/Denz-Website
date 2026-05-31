import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase-admin';

// Force dynamic rendering — post content is fetched from Firestore at request time.
export const dynamic = 'force-dynamic';
import type { BlogPost } from '@/types';
import { Calendar, Clock, ChevronRight, Tag, Wifi, UtensilsCrossed, BedDouble, ArrowRight } from 'lucide-react';
import { ArticleClient } from './ArticleClient';
import type { TocItem } from './TableOfContents';

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ytEmbed(videoId: string): string {
  return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1.5rem 0"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`;
}

function processContent(html: string): { processed: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let out = html;

  out = out.replace(/<figure[^>]*wp-block-embed[^>]*>[\s\S]*?<div[^>]*wp-block-embed__wrapper[^>]*>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]*v=|youtu\.be\/)([\w-]{11})[^\s<]*)\s*<\/div>[\s\S]*?<\/figure>/gi, (_, _url, videoId) => ytEmbed(videoId));
  out = out.replace(/<p[^>]*>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<"]*v=|youtu\.be\/)([\w-]{11})[^\s<]*)\s*<\/p>/gi, (_, _url, videoId) => ytEmbed(videoId));

  out = out.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (_, tag, inner) => {
    const level = parseInt(tag[1]) as 2 | 3;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
    toc.push({ id, text, level });
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });

  return { processed: out, toc };
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return null;
    const snap = await adminDb.collection('blog-posts')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
  } catch {
    return null;
  }
}

async function getRelated(currentSlug: string, categories: string[]): Promise<BlogPost[]> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    const snap = await adminDb.collection('blog-posts').where('status', '==', 'published').get();
    const others = snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as BlogPost)
      .filter(p => p.slug !== currentSlug);
    const sameCategory = others.filter(p => categories.some(c => p.categories.includes(c)));
    const rest = others.filter(p => !categories.some(c => p.categories.includes(c)));
    const sorted = [
      ...sameCategory.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)),
      ...rest.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)),
    ];
    return sorted.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [related] = await Promise.all([getRelated(slug, post.categories)]);
  const { processed, toc } = processContent(post.content);
  const hasInstagram = post.content.includes('instagram-media');

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
            <Link href={`/guide/category/${post.categories[0]}`} className="hover:text-brand transition-colors capitalize">
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
          {post.featureImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featureImage}
              alt={post.title}
              className="w-full rounded-2xl mb-8 object-cover max-h-[420px]"
            />
          )}

          <div className="mb-6">
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.map(cat => (
                  <Link key={cat} href={`/guide/category/${cat}`}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors">
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

          {/* Mobile TOC slot — filled by ArticleClient portal */}
          {toc.length >= 3 && <div id="mobile-toc-slot" className="lg:hidden mb-8" />}

          {/* Article body — server-rendered for SEO */}
          <div
            id="guide-article-body"
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
              '[&_blockquote:not(.instagram-media)]:border-l-4 [&_blockquote:not(.instagram-media)]:border-brand/30 [&_blockquote:not(.instagram-media)]:pl-4 [&_blockquote:not(.instagram-media)]:italic [&_blockquote:not(.instagram-media)]:text-ink-muted',
              '[&_code]:bg-ink/5 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm',
              '[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-6',
              '[&_iframe]:w-full [&_iframe]:rounded-xl',
              '[&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm',
              '[&_th]:bg-ink/5 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink [&_th]:border [&_th]:border-ink/10',
              '[&_td]:px-4 [&_td]:py-2.5 [&_td]:text-ink-muted [&_td]:border [&_td]:border-ink/10',
              '[&_tr:nth-child(even)_td]:bg-ink/[0.02]',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: processed }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-ink/10">
              <div className="flex flex-wrap items-center gap-2">
                <Tag size={14} className="text-ink-muted" />
                {post.tags.map(tag => (
                  <Link key={tag} href={`/guide/tag/${tag}`}
                    className="text-xs px-3 py-1 rounded-full bg-ink/5 text-ink-muted hover:bg-brand/10 hover:text-brand transition-colors">
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
                  <Link key={rel.id} href={`/guide/${rel.slug}`}
                    className="group block rounded-2xl border border-ink/10 overflow-hidden hover:shadow-md transition-shadow bg-white">
                    {rel.featureImage
                      ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rel.featureImage} alt={rel.title}
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
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

          <div className="mt-8">
            <Link href="/guide" className="text-sm text-brand hover:underline flex items-center gap-1.5">
              ← Back to Guides
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="space-y-4">
            <Link href="/coworking" className="group flex items-start gap-3 rounded-2xl p-4 bg-blue-50 border border-transparent hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-blue-100 shrink-0 mt-0.5">
                <Wifi className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Coworking</p>
                <h3 className="text-sm font-bold text-ink mb-1 leading-snug">Your office away from home</h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-2">Gigabit WiFi, desks, private offices. From ฿200/day.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                  View packages <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            <Link href="/menu" className="group flex items-start gap-3 rounded-2xl p-4 bg-orange-50 border border-transparent hover:border-orange-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-orange-100 shrink-0 mt-0.5">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Café</p>
                <h3 className="text-sm font-bold text-ink mb-1 leading-snug">Thai &amp; western food, done right</h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-2">Thai classics, western breakfasts, coffee and smoothies.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                  See the menu <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            <Link href="/rooms" className="group flex items-start gap-3 rounded-2xl p-4 bg-green-50 border border-transparent hover:border-green-200 hover:shadow-md transition-all duration-200">
              <div className="inline-flex p-2 rounded-xl bg-green-100 shrink-0 mt-0.5">
                <BedDouble className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Stay</p>
                <h3 className="text-sm font-bold text-ink mb-1 leading-snug">Sleep, work, repeat</h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-2">Comfortable rooms above the café. Wake up and get straight to work.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:gap-2 transition-all">
                  See rooms <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            {/* Desktop TOC slot — filled by ArticleClient portal */}
            {toc.length >= 2 && <div id="desktop-toc-slot" />}
          </div>
        </aside>
      </div>

      {/* Client island: IntersectionObserver, Instagram script, TOC portals */}
      <ArticleClient toc={toc} hasInstagram={hasInstagram} />
    </main>
  );
}
