import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';
import { GuideListingClient } from './GuideListingClient';

// Force dynamic rendering — posts are fetched from Firestore at request time,
// not baked in at build time when the service account is not available.
export const dynamic = 'force-dynamic';

async function getPosts(): Promise<BlogPost[]> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return [];
    const snap = await adminDb.collection('blog-posts').where('status', '==', 'published').get();
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BlogPost);
    return posts.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  } catch {
    return [];
  }
}

export default async function GuidePage() {
  const posts = await getPosts();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

      {/* Header — server-rendered for SEO */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">Denz Phuket Guide</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4 leading-tight">
          Your local guide to<br className="hidden sm:block" /> life in Phuket
        </h1>
        <p className="text-ink-muted text-lg max-w-2xl leading-relaxed">
          From the best spots to eat and work, to events, adventures, and hidden gems — written by the team at Denz in Kathu.
        </p>
      </div>

      {/* First 20 posts server-rendered for SEO — links crawlable without JS */}
      {posts.length > 0 && (
        <ul className="sr-only" aria-hidden="true">
          {posts.map(post => (
            <li key={post.id}>
              <a href={`/guide/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      )}

      {/* Interactive client: category filter, pagination */}
      <GuideListingClient posts={posts} />
    </main>
  );
}
