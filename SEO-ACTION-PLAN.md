# Denz Phuket — SEO Action Plan
**Generated:** 2026-05-30
**Source:** SEO-AUDIT.md

Implement in order. Critical items block all other SEO work — fix them first.

---

## CRITICAL (Fix before launch)

### C1 — Convert guide listing and guide post pages to Server Components
**File:** `src/app/guide/page.tsx` and `src/app/guide/[slug]/page.tsx`
**Impact:** Currently ZERO guide content is visible to Googlebot. All guide SEO value is lost.
**Action:**
1. Remove `'use client'` from `src/app/guide/page.tsx`
2. Fetch posts via `getAdminDb()` in an async Server Component
3. Pass `initialPosts` to a new `BlogListingClient` component for category filter interactivity
4. Remove `'use client'` from `src/app/guide/[slug]/page.tsx`
5. Fetch post via `getAdminDb()` in an async Server Component, call `notFound()` if missing
6. Pass post data to a new `BlogPostClient` component for TOC scroll / interactivity

```tsx
// src/app/guide/page.tsx — new structure
import { getAdminDb } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';
import { BlogListingClient } from './BlogListingClient';

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

```tsx
// src/app/guide/[slug]/page.tsx — new structure
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { BlogPostClient } from './BlogPostClient';

export default async function GuidePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getAdminDb();
  const snap = await db
    .collection('blog-posts')
    .where('slug', '==', slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (snap.empty) notFound();
  const post = { id: snap.docs[0].id, ...snap.docs[0].data() };
  return <BlogPostClient post={post} />;
}
```

---

### C2 — Fix guide listing title double-stamping
**File:** `src/app/guide/layout.tsx`
**Current rendered title:** `"Guide — Denz Phuket | Denz Phuket"` (template appended to a title that already included the brand)
**Action:** Change title to use `absolute` to bypass the root template:

```ts
export const metadata: Metadata = {
  title: {
    absolute: 'Phuket Travel Guide — Tips, Coworking & Local Life | Denz',
  },
  // ... rest unchanged
};
```

---

## HIGH (Fix within first week)

### H1 — Add AI crawler rules to robots.ts
**File:** `src/app/robots.ts`

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/order', '/dashboard'],
      },
      { userAgent: 'GPTBot', disallow: ['/'] },    // OpenAI training crawler
      { userAgent: 'CCBot', disallow: ['/'] },      // Common Crawl (LLM training)
      { userAgent: 'Diffbot', disallow: ['/'] },    // Data extraction/resale
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

### H2 — Fix homepage meta description (125 chars → 150–155 chars)
**File:** `src/app/layout.tsx` line 23

```ts
description: 'Denz is a modern coworking café in Kathu, Phuket — 1 Gbps WiFi, great Thai food, mountain views and flexible desk packages. Walk-ins welcome Mon–Fri.',
```

### H3 — Fix coworking meta description (163 chars → ≤160 chars)
**File:** `src/app/coworking/layout.tsx` line 8

```ts
description: 'Flexible coworking in Kathu, Phuket. Hot desks from ฿50/hr, dedicated desks, private offices. 1 Gbps WiFi, free drinks, standing desks and printing. Mon–Fri.',
```

### H4 — Add ContactPoint + BreadcrumbList schema to /contact
**File:** `src/app/contact/layout.tsx`

```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
```

---

## MEDIUM (Fix within first two weeks)

### M1 — Add BreadcrumbList to /coworking layout
**File:** `src/app/coworking/layout.tsx`

Add alongside existing `coworkingSchema`:
```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Coworking', item: `${BASE_URL}/coworking` },
  ],
};
```

### M2 — Add BreadcrumbList to /rooms layout
**File:** `src/app/rooms/layout.tsx`

```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Rooms', item: `${BASE_URL}/rooms` },
  ],
};
```

### M3 — Add BreadcrumbList to /menu layout
**File:** `src/app/menu/layout.tsx`

```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Café Menu', item: `${BASE_URL}/menu` },
  ],
};
```

### M4 — Remove empty telephone from LocalBusiness schema
**File:** `src/app/layout.tsx` line 70

```ts
// Delete or update:
// telephone: '',   ← remove this line entirely if no phone number
// Or:
telephone: '+66-76-XXX-XXX',  // use real number
```

### M5 — Fix streetAddress in LocalBusiness schema
**File:** `src/app/layout.tsx` line 71 and `src/app/rooms/layout.tsx` line 46

```ts
address: {
  '@type': 'PostalAddress',
  streetAddress: '1/23 Moo 5, Vichitsongkram Road',  // real street address — update with actual
  addressLocality: 'Kathu',
  addressRegion: 'Phuket',
  postalCode: '83120',
  addressCountry: 'TH',
},
```

### M6 — Add weekend opening hours to LocalBusiness schema
**File:** `src/app/layout.tsx` lines 84–91

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
    opens: '10:00',   // confirm actual hours
    closes: '21:00',  // confirm actual hours
  },
],
```

### M7 — Fix WebSite SearchAction target URL
**File:** `src/app/layout.tsx` line 118

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
Note: Only add this if guide listing actually supports URL-based `?q=` filtering (implement URL search params to replace client-side state filter).

### M8 — Remove hardcoded fallback menu IDs from sitemap or make dynamic
**File:** `src/app/sitemap.ts` lines 88–93

Replace static ID array with Firestore fetch:
```ts
async function getMenuSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snap = await db.collection('menu-items').get();
    return snap.docs.map(d => ({
      url: `${BASE_URL}/menu/${d.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch { return []; }
}
```

### M9 — Fix Article schema author type (Organization → Person for named authors)
**File:** `src/app/guide/[slug]/layout.tsx` lines 109–112

```ts
author: post.author && post.author !== 'Denz Phuket'
  ? { '@type': 'Person', name: post.author }
  : { '@type': 'Organization', name: 'Denz Phuket', url: BASE_URL },
```

---

## LOW (Ongoing improvements)

### L1 — Add pricing and hours to llms.txt
**File:** `public/llms.txt`

Append:
```md
## Pricing
- Hot desk: from ฿50/hr, ฿400/day
- Dedicated desk: from ฿1,600/week, ฿4,800/month
- Private office: from ฿12,000/month
- Standard room: from ฿800/night
- Deluxe room: from ฿1,200/night
- Studio suite: from ฿1,800/night

## Opening Hours
- Coworking: Monday–Friday, 10:00–23:30
- Café: Daily (confirm weekend hours)
- Rooms: Daily check-in available
```

### L2 — Add Content-Security-Policy-Report-Only header
**File:** `next.config.ts`

Add to `securityHeaders` array:
```ts
{
  key: 'Content-Security-Policy-Report-Only',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com;",
},
```

### L3 — Add interest-cohort=() to Permissions-Policy
**File:** `next.config.ts` line 18

```ts
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
```

### L4 — Add FAQ schema to coworking and rooms pages
**File:** `src/app/coworking/layout.tsx` and `src/app/rooms/layout.tsx`

Example for coworking:
```ts
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need to book a hot desk in advance?',
      acceptedAnswer: { '@type': 'Answer', text: 'No — hot desks are walk-in, first-come first-served Monday to Friday.' },
    },
    {
      '@type': 'Question',
      name: 'Is WiFi included with the coworking pass?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — 1 Gbps fibre WiFi is included with all coworking packages.' },
    },
    {
      '@type': 'Question',
      name: 'What is the cheapest way to use the coworking space?',
      acceptedAnswer: { '@type': 'Answer', text: 'The hourly hot desk rate starts at ฿50 per hour with no minimum booking.' },
    },
  ],
};
```

### L5 — Add ItemList schema to guide listing page (once SSR converted)
**File:** `src/app/guide/layout.tsx` or a new component

When guide listing is SSR, add an `ItemList` schema listing the first 10 articles so Google can display guide post sitelinks in search.

### L6 — Implement URL-based search params for guide category filter
**File:** `src/app/guide/page.tsx`

Replace client-side `activeCategory` state with `searchParams`:
```tsx
export default async function GuidePage({ searchParams }: { searchParams: { category?: string } }) {
  const { category } = await searchParams;
  // Filter server-side or pass to client component
}
```
This makes filtered category pages linkable, crawlable, and sitemap-eligible (e.g. `/guide?category=phuket-living`).

---

## Summary Checklist

| Priority | Count | Status |
|---|---|---|
| Critical | 2 | Implement before launch |
| High | 4 | Implement week 1 |
| Medium | 9 | Implement weeks 1–2 |
| Low | 6 | Ongoing |
| **Total** | **21** | |
