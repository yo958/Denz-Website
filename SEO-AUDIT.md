# Denz Phuket — SEO Audit
**Audited:** 2026-05-30
**Site:** http://localhost:3003 (Next.js — NOT denzphuket.com WordPress)
**Auditor:** Claude SEO Agent

---

## Overall Score: 68 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 25% | 72 | 18.0 |
| Content / On-Page | 20% | 65 | 13.0 |
| Schema / Structured Data | 15% | 80 | 12.0 |
| On-Page SEO (titles/metas) | 15% | 62 | 9.3 |
| Performance Signals | 10% | 70 | 7.0 |
| Images | 10% | 85 | 8.5 |
| AI Search Readiness | 5% | 80 | 4.0 |

---

## Page-by-Page Summary

| Page | Title (chars) | Meta Desc (chars) | H1 | Canonical | Schema | Status |
|---|---|---|---|---|---|---|
| / (homepage) | 52 ✓ | 125 ⚠ short | 1 ✓ | denzphuket.com ✓ | LocalBusiness, WebSite ✓ | GOOD |
| /guide | 33 ✗ + duplicated | 148 ✓ | 1 ✓ | /guide ✓ | BreadcrumbList ✓ | ISSUES |
| /guide/[slug] | 21 ✗ fallback | 71 ✗ fallback | 0 ✗ | /guide/slug ✓ | BreadcrumbList only ✗ | CRITICAL |
| /coworking | 44 ✓ | 163 ⚠ long | 1 ✓ | /coworking ✓ | Service ✓ | GOOD |
| /menu | 43 ✓ | 153 ✓ | 1 ✓ | /menu ✓ | Menu ✓ | GOOD |
| /rooms | 49 ✓ | 160 ✓ | 1 ✓ | /rooms ✓ | LodgingBusiness ✓ | GOOD |
| /contact | 48 ✓ | 143 ✓ | 1 ✓ | /contact ✓ | None ✗ | MISSING SCHEMA |

---

## Findings

---

### CRITICAL ISSUES

---

#### C1 — Guide listing and guide post pages are `'use client'` components (no SSR content)

**Severity:** Critical
**Affected:** `/guide` (listing), `/guide/[slug]` (all guide posts)
**Evidence:** Both `src/app/guide/page.tsx` and `src/app/guide/[slug]/page.tsx` begin with `'use client'`. Posts are fetched from Firestore inside `useEffect`, which runs only in the browser. Googlebot crawls the HTML returned by the server — which contains zero article cards on `/guide` and zero article body content on `/guide/[slug]`. The fetched HTML for `/guide` contains only the shell (`"Your local guide to life in Phuket"`) with no post links. The fetched HTML for `/guide/best-time-to-visit-phuket` has **zero H1 tags** and no article content.

**Impact:** None of the guide posts will be indexed or ranked. The `/guide` listing page shows no posts to Googlebot. All article content, headings, and internal links to guide posts are invisible to search engines.

**Fix:** Convert both pages to async Server Components that fetch from Firestore Admin SDK (already used in the layout for metadata). Keep interactivity (category filter, TOC scroll) in small Client Components wrapped inside.

`src/app/guide/page.tsx`:
```tsx
// Remove 'use client' — make this a Server Component
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';
import { BlogListingClient } from './BlogListingClient'; // new file for filter UI

export default async function GuidePage() {
  const db = getAdminDb();
  const snap = await db
    .collection('blog-posts')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();
  const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  return <BlogListingClient initialPosts={posts} />;
}
```

`src/app/guide/[slug]/page.tsx`:
```tsx
// Remove 'use client' — make this a Server Component
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { BlogPostClient } from './BlogPostClient'; // new file for TOC/interactivity

export default async function GuidePostPage({ params }: { params: { slug: string } }) {
  const db = getAdminDb();
  const snap = await db
    .collection('blog-posts')
    .where('slug', '==', params.slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (snap.empty) notFound();
  const post = { id: snap.docs[0].id, ...snap.docs[0].data() };
  return <BlogPostClient post={post} />;
}
```

---

#### C2 — Guide post title, meta description, H1, and Article schema all showing fallback values

**Severity:** Critical
**Affected:** `/guide/[slug]`
**Evidence:**
- Title: `"Article | Denz Phuket"` (21 chars — the fallback from `guide/[slug]/layout.tsx` when `getPostBySlug()` returns null)
- Meta description: `"Read the latest articles from Denz Coworking & Café, Kathu, Phuket."` (71 chars — generic fallback)
- H1: 0 found in server-rendered HTML
- Article schema: Not present (only BreadcrumbList rendered — the Article schema block is also conditional on post data)
- OG: Falls back to guide listing values (`og:title = "Guide | Denz Phuket"`, guide listing image)
- Twitter card: Falls back to root layout homepage values

**Root cause:** The `layout.tsx` calls `getAdminDb()` and queries Firestore Admin SDK (which works in server context), but the `page.tsx` is `'use client'` and loads content client-side. When Googlebot (or the audit curl) hits the page, the layout renders with real metadata from Firestore Admin — but because the page itself fetches client-side, no H1 or content is present. The inconsistency means OG/Twitter may work (layout is server) but H1/content/Article schema do not.

**Fix:** Addressed by C1 (server component conversion). Once page.tsx is a Server Component fetching the same post, H1 and content will render server-side. The Article schema in layout.tsx is already correct and will populate once post data is returned.

---

#### C3 — Guide listing title is double-stamped by root layout template

**Severity:** High
**Affected:** `/guide`
**Evidence:** Rendered title = `"Guide — Denz Phuket | Denz Phuket"` (33 chars visible but semantically wrong). The `guide/layout.tsx` sets `title: 'Guide — Denz Phuket'` as a static string. The root layout has `template: '%s | Denz Phuket'`. Next.js appends the template to the child title, producing the duplicate.

**Fix:** In `src/app/guide/layout.tsx`, use the short form so the template produces the correct result:
```ts
export const metadata: Metadata = {
  title: 'Phuket Guide — Tips, Coworking & Local Life', // ~44 chars — template adds " | Denz Phuket"
  // Result: "Phuket Guide — Tips, Coworking & Local Life | Denz Phuket" = 58 chars ✓
```
Or suppress the template for this page:
```ts
title: {
  absolute: 'Phuket Guide — Coworking & Travel Tips | Denz Phuket', // 52 chars ✓
},
```

---

### HIGH SEVERITY ISSUES

---

#### H1 — robots.txt missing AI crawler disallow rules

**Severity:** High
**Affected:** `src/app/robots.ts`
**Evidence:** Current robots.txt output:
```
User-Agent: *
Allow: /
Disallow: /order
Disallow: /dashboard
Sitemap: https://denzphuket.com/sitemap.xml
```
Missing: No specific directives for AI training crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Diffbot). These bots scrape content for LLM training and AI answer engines. Without explicit rules you have no control over which content they ingest.

**Fix:** Update `src/app/robots.ts`:
```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/order', '/dashboard'],
      },
      // Block LLM training crawlers (not AI search answer crawlers — those are fine via llms.txt)
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Diffbot',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```
Note: Do NOT block ClaudeBot, PerplexityBot, or Google-Extended — these power AI search answers and are traffic sources. Block only training crawlers (GPTBot = OpenAI training, CCBot = Common Crawl used for training, Diffbot = data reseller).

---

#### H2 — Homepage meta description is 125 chars (below 140-char minimum)

**Severity:** High
**Affected:** `src/app/layout.tsx`
**Evidence:** Current: `"Denz is a modern coworking café in Kathu, Phuket — fast WiFi, great food, stunning mountain views and flexible desk packages."` = 125 chars. Target range: 140–160 chars. Short descriptions get rewritten by Google more often.

**Fix:**
```ts
description: 'Denz is a modern coworking café in Kathu, Phuket — 1 Gbps WiFi, great food, mountain views, flexible hot desk and dedicated desk packages. Walk-ins welcome.',
// 161 chars — trim to 155:
description: 'Denz is a modern coworking café in Kathu, Phuket — 1 Gbps WiFi, great Thai food, mountain views and flexible desk packages. Walk-ins welcome Mon–Fri.',
```

---

#### H3 — Coworking page meta description is 163 chars (exceeds 160-char limit)

**Severity:** Medium-High
**Affected:** `src/app/coworking/layout.tsx`
**Evidence:** `"Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, and private offices. Gigabit WiFi, free drinks, standing desks, printing — Mon to Fri."` = 163 chars. Google truncates at ~160.

**Fix:**
```ts
description: 'Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, private offices. 1 Gbps WiFi, free drinks, standing desks and printing. Mon–Fri.',
// 159 chars ✓
```

---

#### H4 — Guide listing page is fully client-side — posts not visible to Googlebot

**Severity:** High (see C1 for full detail)
**Affected:** `/guide` listing — Googlebot sees only the page shell, no article links, no post titles, no dates
**Impact:** The guide section provides no SEO value to the site until converted to SSR.

---

#### H5 — Contact page has no ContactPoint or LocalBusiness schema

**Severity:** High
**Affected:** `/contact`
**Evidence:** The contact page fetched HTML shows only root layout schemas (`LocalBusiness`, `WebSite`). There is no `ContactPoint` schema or page-specific breadcrumb.

**Fix:** Add to `src/app/contact/layout.tsx`:
```ts
const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#business`,
  name: 'Denz',
  url: BASE_URL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English',
    sameAs: 'https://instagram.com/denzphuket',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
  ],
};
```

---

#### H6 — Guide post OG/Twitter tags fall back to guide listing and homepage values respectively

**Severity:** High
**Affected:** `/guide/[slug]`
**Evidence:**
- `og:title` = `"Guide | Denz Phuket"` (listing page value, not post title)
- `og:image` = `/images/hero-coworking.jpg` (generic)
- `twitter:title` = `"Denz Coworking Cafe Phuket | Work, Eat & Explore"` (homepage value — root layout fallback)
- `twitter:description` = homepage description

**Root cause:** The `guide/[slug]/layout.tsx` `generateMetadata()` runs on server and does fetch the post correctly via Admin SDK. However, with the current Firestore environment for localhost, the query returns null — so the fallback metadata block is used. This is a localhost/environment issue compounded by the client-side rendering problem. The Twitter tags reverting to root layout values suggests the OG type `article` is not being set, so the root layout's Twitter block overrides.

**Fix:** Once C1 is resolved and the page is SSR, the layout's `generateMetadata` will produce correct per-post OG/Twitter tags from Firestore data. No code change needed in the layout — only the page.tsx SSR conversion is required.

---

### MEDIUM SEVERITY ISSUES

---

#### M1 — Sitemap includes hardcoded `/menu/f1` through `/menu/f8`, `/menu/d1` through `/menu/d8` fallback IDs

**Severity:** Medium
**Affected:** `src/app/sitemap.ts`
**Evidence:** Lines 88–93 of sitemap.ts add 16 static menu item URLs (`/menu/f1`, `/menu/d1`, etc.) as fallback. If the actual Firestore menu items have different IDs, these will be 404 pages in the sitemap — a soft 404 signal that wastes crawl budget and can trigger GSC warnings.

**Fix:** Either remove these static fallbacks and add a dynamic Firestore fetch for menu items (similar to `getBlogSitemapEntries`), or only include them if you have verified the IDs match actual Firestore documents:
```ts
async function getMenuSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snap = await db.collection('menu-items').where('available', '==', true).get();
    return snap.docs.map(d => ({
      url: `${BASE_URL}/menu/${d.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch { return []; }
}
```

---

#### M2 — BreadcrumbList missing on /coworking, /rooms, /menu, /contact

**Severity:** Medium
**Affected:** `/coworking`, `/rooms`, `/menu`, `/contact`
**Evidence:** The coworking, rooms, and menu layouts each inject their primary schema (Service, LodgingBusiness, Menu) but do NOT include a BreadcrumbList schema. Only the guide-related pages have breadcrumbs. Google uses breadcrumbs in search result display.

**Fix:** Add a BreadcrumbList to each layout. Example for `src/app/coworking/layout.tsx`:
```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Coworking', item: `${BASE_URL}/coworking` },
  ],
};

export default function CoworkingLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coworkingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
```
Repeat for `/rooms`, `/menu`, `/contact` (see H5 for contact).

---

#### M3 — LocalBusiness schema has empty telephone field

**Severity:** Medium
**Affected:** `src/app/layout.tsx` line 70: `telephone: '',`
**Evidence:** The `telephone` property is present but empty string. This is technically invalid schema — either provide the real number or remove the property entirely. An empty string may confuse schema validators.

**Fix:**
```ts
// If no public phone number, remove the property entirely:
// telephone: '',  ← delete this line
// OR if there is a number:
telephone: '+66-XX-XXX-XXXX',
```

---

#### M4 — LocalBusiness address has streetAddress: 'Kathu' (not a street address)

**Severity:** Medium
**Affected:** `src/app/layout.tsx` lines 71–78 and `src/app/rooms/layout.tsx`
**Evidence:**
```json
"streetAddress": "Kathu"
```
`streetAddress` should be the building number / street name, not the district. `Kathu` is the sub-district (`addressLocality` level). This will cause Google's address parsing to misplace the business. The same error appears in `rooms/layout.tsx`.

**Fix:**
```ts
address: {
  '@type': 'PostalAddress',
  streetAddress: '1/23 Moo 5, Vichitsongkram Road',  // use the actual street address
  addressLocality: 'Kathu',
  addressRegion: 'Phuket',
  postalCode: '83120',
  addressCountry: 'TH',
},
```

---

#### M5 — OpeningHoursSpecification only covers Mon–Fri, missing weekend café hours

**Severity:** Medium
**Affected:** `src/app/layout.tsx` line 84–91
**Evidence:** Only one `OpeningHoursSpecification` for Mon–Fri. The llms.txt states café and rooms are open daily. If weekend café hours exist, they are not represented in schema — Google will show "Closed Sat/Sun" in Business Profile.

**Fix:** Add separate weekend hours if the café operates Saturday/Sunday:
```ts
openingHoursSpecification: [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:00',
    closes: '23:30',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday'],
    opens: '10:00',   // update with actual hours
    closes: '21:00',  // update with actual hours
  },
],
```

---

#### M6 — Guide listing page H1 is "Your local guide to life in Phuket" — low keyword density

**Severity:** Medium
**Affected:** `/guide` page.tsx H1 render
**Evidence:** H1 = `"Your local guide to life in Phuket"`. While unique and descriptive, it lacks the primary keyword terms users search for: "Phuket guide", "Phuket travel tips", "coworking Phuket blog". The guide section is a key content asset.

**Fix:** Update the H1 text on the guide listing page:
```tsx
<h1>Phuket Travel Guide — Tips, Coworking & Local Life</h1>
```

---

#### M7 — WebSite SearchAction points to `/menu?q={search_term_string}` — wrong target

**Severity:** Medium
**Affected:** `src/app/layout.tsx` line 118–123
**Evidence:** The `SearchAction` in the WebSite schema targets `/menu?q=`. A site-wide search action should target a site search URL (e.g. `/search?q=` or `/guide?q=`). Pointing it to `/menu` implies only food items are searchable, which is incorrect for a general site search.

**Fix:**
```ts
potentialAction: {
  '@type': 'SearchAction',
  target: {
    '@type': 'EntryPoint',
    urlTemplate: `${BASE_URL}/guide?q={search_term_string}`,
  },
  'query-input': 'required name=search_term_string',
},
```
Only include this if the guide listing page actually supports `?q=` URL filtering (currently the filter is client-side state, not URL params).

---

#### M8 — CSP (Content-Security-Policy) header is absent

**Severity:** Medium
**Affected:** `next.config.ts`
**Evidence:** The security headers in `next.config.ts` include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` — all confirmed present in response headers. However, `Content-Security-Policy` is absent. CSP prevents XSS attacks and is a minor trust signal.

**Fix:** Add to `next.config.ts` (start with report-only mode):
```ts
{
  key: 'Content-Security-Policy-Report-Only',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;",
},
```
Note: `'unsafe-inline'` is required for Next.js inline scripts (the JSON-LD `dangerouslySetInnerHTML` blocks).

---

### LOW SEVERITY ISSUES

---

#### L1 — llms.txt does not include pricing or opening hours data

**Severity:** Low
**Affected:** `public/llms.txt`
**Evidence:** Current llms.txt is good — present, structured, covers all pages. However it lacks pricing data (hot desk from ฿50/hr, rooms from ฿800/night) and opening hours. AI assistants queried about "coworking prices Phuket" cannot return accurate data without this.

**Fix:** Add to `public/llms.txt`:
```md
## Pricing
- Hot desk: from ฿50/hr, ฿400/day
- Dedicated desk: from ฿1,600/week, ฿4,800/month
- Private office: from ฿12,000/month
- Standard room: from ฿800/night
- Deluxe room: from ฿1,200/night
- Studio suite: from ฿1,800/night

## Hours
- Coworking: Monday–Friday 10:00–23:30
- Café and rooms: Daily (hours TBC)
```

---

#### L2 — No `robots.txt` static file in `/public` — relying solely on `robots.ts`

**Severity:** Low
**Affected:** `/public/robots.txt` — does not exist
**Evidence:** The static `public/robots.txt` file is absent. The `src/app/robots.ts` dynamic route serves robots correctly (confirmed: `curl http://localhost:3003/robots.txt` returns correct output). This is fine for Next.js App Router. No action required unless switching to static export.

---

#### L3 — Coworking [id] layout has minimal metadata (only canonical + OG url)

**Severity:** Low
**Affected:** `src/app/coworking/[id]/layout.tsx`
**Evidence:** The coworking detail page layout only sets `canonical` and `og:url` per ID. Title, description, OG image, and Twitter card all inherit from the parent coworking layout. Individual coworking space detail pages should ideally have their own title and description.

**Fix:**
```ts
export async function generateMetadata({ params }) {
  const { id } = await params;
  // Fetch space name from Firestore
  const db = getAdminDb();
  const doc = await db.collection('coworking-spaces').doc(id).get();
  const space = doc.data();
  return {
    title: space?.name ?? 'Coworking Space',
    description: space?.description?.slice(0, 155) ?? 'Flexible coworking space at Denz, Kathu, Phuket.',
    alternates: { canonical: `${BASE_URL}/coworking/${id}` },
    openGraph: { url: `${BASE_URL}/coworking/${id}`, title: space?.name, images: space?.image ? [{ url: space.image, width: 1200, height: 630 }] : undefined },
  };
}
```

---

#### L4 — Guide post Article schema uses `@type: 'Organization'` for author, not `Person`

**Severity:** Low
**Affected:** `src/app/guide/[slug]/layout.tsx` lines 109–112
**Evidence:**
```ts
author: {
  '@type': 'Organization',
  name: post.author ?? 'Denz Phuket',
  url: BASE_URL,
},
```
If `post.author` is a person's name (a string like `"James Simpson"`), wrapping it in `@type: Organization` is semantically wrong. Google's Article rich result guidelines expect `Person` for individual authors.

**Fix:**
```ts
author: post.author && post.author !== 'Denz Phuket'
  ? { '@type': 'Person', name: post.author }
  : { '@type': 'Organization', name: 'Denz Phuket', url: BASE_URL },
```

---

#### L5 — Sitemap `lastModified` is always `new Date()` (build time) for static pages

**Severity:** Low
**Affected:** `src/app/sitemap.ts`
**Evidence:** All static pages (`/`, `/coworking`, `/rooms`, `/menu`, `/contact`) use `lastModified: new Date()`, meaning every deploy marks all pages as updated. This wastes crawl budget — Googlebot will re-crawl unchanged pages.

**Fix:** For static pages, hardcode an ISO date that you update manually when content changes:
```ts
{ url: BASE_URL, lastModified: new Date('2026-05-01'), changeFrequency: 'weekly', priority: 1 },
```

---

#### L6 — `Permissions-Policy` does not include `interest-cohort=()`

**Severity:** Low
**Affected:** `next.config.ts`
**Evidence:** `Permissions-Policy: camera=(), microphone=(), geolocation=(self)` is missing `interest-cohort=()` which opts out of FLoC/Topics API participation. Minor privacy signal.

**Fix:**
```ts
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
```

---

## Structured Data Inventory

| Page | Schema Types Present | Missing |
|---|---|---|
| / | LocalBusiness, CafeOrCoffeeShop, WebSite | BreadcrumbList for homepage |
| /guide | BreadcrumbList | CollectionPage, ItemList |
| /guide/[slug] | BreadcrumbList (x2) | Article (only renders if post found — CURRENTLY MISSING) |
| /coworking | Service | BreadcrumbList |
| /rooms | LodgingBusiness | BreadcrumbList |
| /menu | Menu | BreadcrumbList |
| /contact | (inherits root) | ContactPoint, BreadcrumbList |

---

## Security Headers Audit

| Header | Status | Value |
|---|---|---|
| X-Content-Type-Options | PASS | nosniff |
| X-Frame-Options | PASS | SAMEORIGIN |
| Referrer-Policy | PASS | strict-origin-when-cross-origin |
| Permissions-Policy | PASS | camera=(), microphone=(), geolocation=(self) |
| Content-Security-Policy | FAIL | Not set |
| X-Robots-Tag | PASS | Set on /order and /dashboard routes |
| HSTS | N/A | Handled by hosting provider (Cloudflare/Vercel) |

---

## Image Alt Text Audit

| Page | Total Images | Missing Alt | Status |
|---|---|---|---|
| / | 4 | 0 | PASS |
| /guide | 2 | 0 | PASS |
| /guide/[slug] | 2 | 0 | PASS (shell only — no article images visible server-side) |
| /coworking | 3 | 0 | PASS |
| /menu | 5 | 0 | PASS |
| /rooms | 2 | 0 | PASS |
| /contact | 2 | 0 | PASS |

All server-rendered images have alt text. Guide post body images (loaded client-side) cannot be evaluated until SSR conversion is complete.

---

## Internal Linking Audit

The guide listing page currently renders zero links to guide posts (client-side fetch). Once SSR is implemented:
- Each guide post should link back to its category page (`/guide/category/[slug]`)
- Related posts section should link to other guide posts
- Homepage should feature 2–3 recent guide posts with links

No nofollow abuse detected. `/order` and `/dashboard` are correctly noindexed via X-Robots-Tag.

---

## AI Search Readiness

| Check | Status | Notes |
|---|---|---|
| llms.txt present | PASS | Well-structured, all pages listed |
| llms.txt pricing | FAIL | No pricing data — AI cannot answer "how much is coworking at Denz" |
| llms.txt hours | PARTIAL | Coworking hours listed, café/room hours incomplete |
| robots.txt AI directives | PARTIAL | No AI-specific rules — add GPTBot/CCBot block for training |
| Article schema on guide posts | FAIL | Not rendering due to C1/C2 |
| FAQ schema | MISSING | Coworking and rooms pages would benefit from FAQ schema |

---
