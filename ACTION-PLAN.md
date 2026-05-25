# Denz Website — SEO Action Plan
**Generated:** 2026-05-25  
**Status:** Critical and High items completed in this session. Medium/Low items remain.

---

## ✅ Completed (this session)

| Item | Impact | File |
|---|---|---|
| Create `robots.ts` | Critical | `src/app/robots.ts` |
| Create `sitemap.ts` | Critical | `src/app/sitemap.ts` |
| Create `llms.txt` | High | `public/llms.txt` |
| Per-page metadata layouts (coworking, rooms, menu, contact) | Critical | `src/app/*/layout.tsx` |
| `metadataBase` in root layout | High | `src/app/layout.tsx` |
| Fix `og:url` (was missing) | High | `src/app/layout.tsx` |
| Fix OG image to 1200×630 hero photo | Medium | `src/app/layout.tsx` |
| Add Twitter card metadata | High | `src/app/layout.tsx` |
| Add canonical URLs to all pages | High | Per-page layouts |
| LocalBusiness + WebSite JSON-LD schema | High | `src/app/layout.tsx` |
| Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) | Medium | `next.config.ts` |
| `noindex` on `/order` and `/dashboard` | High | `next.config.ts` |

---

## 🔴 Critical — Fix immediately

> All critical items have been resolved. No blockers remain.

---

## ⚠️ High — Fix within 1 week

### 1. Set `NEXT_PUBLIC_SITE_URL` in production environment
**Why:** All canonical URLs, sitemap entries, OG tags, and JSON-LD currently fall back to `https://denzphuket.com`. If the actual live domain differs, every canonical and schema URL will be wrong.  
**Fix:**
```bash
# Firebase App Hosting secrets
firebase apphosting:secrets:set NEXT_PUBLIC_SITE_URL
# Value: https://your-actual-domain.com
```
Then declare in `apphosting.yaml`:
```yaml
env:
  - variable: NEXT_PUBLIC_SITE_URL
    secret: NEXT_PUBLIC_SITE_URL
```

### 2. Submit sitemap to Google Search Console
**Why:** Even with `sitemap.xml` live, Google won't discover it unless submitted.  
**Fix:** Go to [Google Search Console](https://search.google.com/search-console) → Sitemaps → Submit `https://denzphuket.com/sitemap.xml`

### 3. Submit sitemap to Bing Webmaster Tools
**Why:** Bing serves a meaningful share of search traffic, especially for travellers on Windows/Edge.  
**Fix:** [Bing Webmaster Tools](https://www.bing.com/webmasters) → Submit sitemap URL.

### 4. Add anchor text to icon-only nav/footer links
**Why:** 7 links with no anchor text lose link equity and are inaccessible.  
**Fix:** Add `aria-label` attributes (e.g. `aria-label="Go to Instagram"`) and `<span className="sr-only">Instagram</span>` inside icon-only links in `Navbar` and `Footer` components.

---

## ⚠️ Medium — Fix within 1 month

### 5. Switch `<img>` to `next/image` throughout
**Why:** `next/image` provides automatic WebP conversion, lazy loading, responsive `srcset`, and layout shift prevention (CLS fix). Currently most page images use raw `<img>` tags.  
**Files:** `coworking/page.tsx` (hero photo), `rooms/page.tsx` (room hero), `coworking/[id]/page.tsx`  
**Note:** Requires adding the image domain to `next.config.ts` if images come from external URLs, but all current images are local so no config change needed.

### 6. Add `AggregateRating` schema to homepage
**Why:** Star ratings in search results (rich snippets) dramatically improve click-through rate.  
**Fix:** Add to root JSON-LD if you have Google/TripAdvisor review data:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "47"
}
```

### 7. Add `BreadcrumbList` schema to detail pages
**Why:** Google shows breadcrumbs in search results for `/coworking/[id]` and `/rooms/[id]` pages.  
**Fix:** In `coworking/[id]/page.tsx` and `rooms/[id]/page.tsx`, inject breadcrumb JSON-LD:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://denzphuket.com" },
    { "@type": "ListItem", "position": 2, "name": "Coworking", "item": "https://denzphuket.com/coworking" },
    { "@type": "ListItem", "position": 3, "name": "[Space Name]" }
  ]
}
```

### 8. Add `generateMetadata` to dynamic routes
**Why:** `/coworking/[id]` and `/rooms/[id]` currently inherit parent metadata. Each space/room should have its own title and description for Google to show the right snippet.  
**Fix:** Since these pages are `'use client'`, the approach is to create a server wrapper:
```
src/app/coworking/[id]/
  layout.tsx   ← server component, generateMetadata reads Firestore via firebase-admin
  page.tsx     ← existing 'use client' component unchanged
```
This requires adding `firebase-admin` to the website repo (already used in the POS).

### 9. Expand contact page content
**Why:** The contact page is thin (~100 words). Google's helpful content guidelines favour pages that fully answer user intent.  
**Fix:** Add: (a) embedded Google Maps, (b) a short "getting here" paragraph describing transport links from Patong/Phuket Town, (c) a brief FAQ (How do I book? Do you have parking? Can I bring a laptop?).

### 10. Convert remaining images to WebP
**Why:** WebP is 25–34% smaller than JPEG and PNG. Faster LCP = better Core Web Vitals ranking signal.  
**Fix:** Convert `room-standard.png`, `room-honeymoon.png`, `about-coworking.jpg`, `about-standup.jpg`, `food-*.jpg` to `.webp` and update `src` references.

---

## 💡 Low — Backlog

### 11. Add `Content-Security-Policy` header
**Why:** CSP prevents XSS attacks. Skipped in this session because Firebase, Google Maps embeds, Firestore, and `next/font` all require specific `script-src` / `connect-src` / `frame-src` allowlist entries — risk of breaking things if set incorrectly.  
**Fix:** Build the policy incrementally using CSP report-only mode first (`Content-Security-Policy-Report-Only`).

### 12. Localised landing page for Thai visitors
**Why:** "coworking ภูเก็ต" and "คาเฟ่ทำงาน ภูเก็ต" are underserved Thai-language queries. A Thai-language page or `hreflang` annotation could capture this traffic.  
**Fix:** Create `src/app/th/page.tsx` with Thai-language content and add `hreflang="th"` / `hreflang="en"` alternates.

### 13. Add `Service` schema for coworking packages
**Why:** Lets Google understand and potentially surface individual desk packages in AI Overviews.  
**Fix:** Add a `Service` schema node for Hot Desk, Dedicated Desk, and Private Office packages with `offers`, `priceRange`, and `areaServed`.

### 14. Google Business Profile verification
**Why:** GBP listing is the single highest-impact local SEO action — appears in Maps, local pack, Knowledge Panel.  
**Fix:** Claim and verify at [business.google.com](https://business.google.com). Match the NAP (Name, Address, Phone) exactly with what's in the LocalBusiness schema.

### 15. Run PageSpeed Insights on live domain
**Why:** Core Web Vitals are a ranking signal. The audit was blocked on localhost.  
**Fix:** After pushing, run: `python3 ~/.claude/skills/seo/scripts/pagespeed.py https://denzphuket.com --strategy mobile`

---

## Domain Note
> All canonical URLs, sitemap entries, OG tags, and JSON-LD currently use `https://denzphuket.com` as the fallback.  
> **If your actual live domain is different**, set `NEXT_PUBLIC_SITE_URL` in Firebase App Hosting secrets before pushing. This one variable controls everything.
