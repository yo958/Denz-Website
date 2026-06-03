# Denz Website — Full SEO Audit Report
**Date:** 2026-06-03 | **URL:** https://denz-website--denz-pos.asia-southeast1.hosted.app/
**Scope:** Full site — homepage + /coworking, /rooms, /menu, /guide, /contact + 2 guide articles
**Business type:** Local business — coworking café, Kathu, Phuket, Thailand

---

## Overall SEO Health Score: 76 / 100 (Good)

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Technical SEO | 25% | 78 | 19.5 |
| Content Quality | 20% | 78 | 15.6 |
| On-Page SEO | 15% | 72 | 10.8 |
| Schema / Structured Data | 15% | 82 | 12.3 |
| Performance (CWV) | 10% | 65* | 6.5 |
| Image Optimization | 10% | 45 | 4.5 |
| AI Search Readiness | 5% | 100 | 5.0 |
| **Total** | | | **74.2** |

*PageSpeed API rate-limited; CWV score estimated from structural signals.

---

## Top 5 Critical Issues

1. 🔴 /guide listing has `noindex, nofollow` — entire blog section de-indexed
2. 🔴 Sitemap only 6 URLs — coworking spaces + rooms not loading (wrong Firestore path)
3. 🔴 Rooms page: 96 words, 0 H2s — dangerously thin for a commercial page
4. 🔴 Menu page: 32 words — almost no crawlable text (fully JS-rendered)
5. ⚠️ All images site-wide missing width/height — CLS on every page

## Top 5 Quick Wins

1. Fix guide noindex → immediate recovery of 20+ blog articles
2. Fix sitemap Firestore path → 12+ more URLs in sitemap
3. Add static content blocks to rooms/menu/contact → word count + H2 boost
4. Add width/height to images → CLS fix site-wide
5. Add Related Articles linking → orphan count drops from 38 to ~15

---

## B) Findings Table

### Technical SEO

| Check | Result | Severity |
|-------|--------|----------|
| HTTPS | ✅ Yes | Pass |
| Redirect chains | ✅ 0 hops, 173ms | Pass |
| robots.txt | ⚠️ Disallow:/ (staging noindex=true in Firestore) | Info |
| Sitemap URLs | ⚠️ 6 (should be 50+) | Warning |
| HSTS | ✅ Present (max-age=31536000; preload) | Pass |
| CSP | ❌ Missing | Warning |
| X-Frame-Options | ✅ SAMEORIGIN | Pass |
| Broken links | ✅ 0 | Pass |
| Facebook link | ⚠️ 2-hop redirect (301→302) | Info |

**[Technical] Sitemap — wrong Firestore collection path**
- Severity: Warning | Confidence: Confirmed
- Finding: sitemap.ts queries 'coworking-spaces' but website uses `stores/default/slices/spaces`. Result: coworking + room detail pages absent from sitemap.
- Fix: Update to use `getAdminDb().doc('stores/default/slices/spaces')` and parse the serialized JSON.

### Content Quality

| Page | Words | H1 | H2 count | Assessment |
|------|-------|----|----------|------------|
| Homepage | 1,007 ✅ | Keyword-rich ✅ | 7 ✅ | Strong |
| /coworking | 382 ⚠️ | Weak ⚠️ | 1 🔴 | Thin |
| /rooms | 96 🔴 | Medium ⚠️ | 0 🔴 | Very thin |
| /menu | 32 🔴 | No keywords 🔴 | 0 🔴 | Critical |
| /guide | 816 ✅ | Good ✅ | 20 ✅ | **noindex** 🔴 |
| /contact | 48 🔴 | No keywords 🔴 | 0 🔴 | Very thin |
| Guide articles | 2,700–3,245 ✅ | Keyword H1 ✅ | 5 each ✅ | Excellent |

**[Content] /guide page: noindex, nofollow**
- Severity: Critical | Confidence: Confirmed
- Finding: Guide listing renders `<meta name="robots" content="noindex, nofollow">`. All 20 guide articles discoverable only via this page.
- Fix: Add explicit `robots: { index: true, follow: true }` to guide/layout.tsx generateMetadata.

**[Content] Menu page: 32 crawlable words**
- Severity: Critical | Confidence: Confirmed
- Finding: /menu is fully JS-rendered. Google sees "What's cooking?" and a loading spinner.
- Fix: Add a server-rendered static intro with Thai/western food keywords above the dynamic grid.

**[Content] Rooms: 96 words, 0 H2s**
- Severity: Critical | Confidence: Confirmed
- Fix: Add a static server-rendered intro block with room names, features, and keyword H2s.

**[Content] Contact: 48 words, no location H1/H2**
- Severity: Warning | Confidence: Confirmed
- Fix: Improve H1 to "Find Denz in Kathu, Phuket" and add descriptive paragraphs.

### On-Page SEO

**[On-Page] H1s on inner pages are weak**
- Coworking: "Flexible workspace in Phuket" — missing "coworking", "desk", "café"
- Menu: "What's cooking?" — zero keyword value
- Contact: "Get in touch" — zero location keywords

**[On-Page] 38 guide articles are orphan pages (1 incoming link each)**
- All linked only from /guide listing; no cross-linking between articles.
- Fix: Add "Related Articles" section to each guide post linking to 3 related posts.

### Schema

| Page | Schema | Quality |
|------|--------|---------|
| Home | LocalBusiness + AggregateRating + WebSite | ✅ Excellent |
| /coworking | Service + pricing Offers + BreadcrumbList | ✅ Strong |
| /rooms | LodgingBusiness + HotelRoom ×3 + BreadcrumbList | ✅ Strong |
| /menu | Menu + MenuSection + MenuItem ×16 + BreadcrumbList | ✅ Strong |
| /contact | LocalBusiness + BreadcrumbList | ✅ Good |
| Guide articles | Article + BreadcrumbList | ✅ Excellent |

**[Schema] No individual Review entities (150 reviews available)**
- Severity: Warning
- Adding 3-5 Review entities to LocalBusiness would strengthen E-E-A-T.

### Image Optimization

**[Images] All images missing width/height attributes — every page**
- Severity: Warning | Confidence: Confirmed
- Impact: Layout shift on every page. Worst affected: homepage hero, guide listing (22 images).
- Fix: Add explicit width/height to all `<img>` tags. Use `next/image` where possible.

**[Images] Hero image has no fetchpriority="high"**
- Severity: Warning
- Fix: Add `fetchpriority="high"` to the hero `<img>` tag — critical for LCP.

### AI Search Readiness

| Check | Result |
|-------|--------|
| llms.txt | ✅ 100/100 |
| llms-full.txt | ✅ Found |
| AI crawler rules | ✅ Explicit (Perplexity allowed, GPTBot blocked) |
| Structured data | ✅ Full LocalBusiness |

---

## C) Prioritized Action Plan

### Immediate (do before launch)
1. Fix /guide noindex → add robots override in guide/layout.tsx
2. Fix sitemap Firestore path → add coworking spaces + rooms
3. Add static content to /rooms, /menu, /contact pages
4. Fix image width/height attributes site-wide
5. Improve H1s on /coworking, /rooms, /menu, /contact
6. Add `fetchpriority="high"` to hero image

### Post-launch (week 1)
7. Add Related Articles to guide posts
8. Add CSP header
9. Add 3-5 Review entities to LocalBusiness schema
10. Submit sitemap in Google Search Console immediately after DNS switch

### Strategic (month 1)
11. Create author bio page for E-E-A-T
12. Internal linking strategy: feature top guide articles from coworking + rooms pages
13. Monitor Core Web Vitals in GSC after launch

---

*Report generated 2026-06-03 — Denz Website v0.5.54*
