# Denz Website — Full SEO Audit Report
**Date:** 2026-05-25  
**Audited URL:** http://localhost:3003 (production: https://denzphuket.com)  
**Business type detected:** Local Service Business — Coworking Café (Kathu, Phuket, Thailand)  
**Overall SEO Health Score: 74 / 100** (Good — was ~38 / 100 before fixes)

---

## Executive Summary

### Top 5 Issues Found (pre-fix)
1. 🔴 No `robots.txt` — crawlers unguided, internal pages exposed
2. 🔴 No `sitemap.xml` — pages not submitted to search engines
3. 🔴 No per-page metadata — all inner pages (`/coworking`, `/rooms`, `/menu`, `/contact`) had only the root template title
4. 🔴 `og:url` missing — Open Graph share cards incomplete
5. 🔴 No JSON-LD structured data — zero schema markup, LocalBusiness not registered with Google

### Top 5 Quick Wins (all implemented)
1. ✅ `robots.ts` + `sitemap.ts` created in App Router
2. ✅ Per-page layouts with unique metadata for all four public routes
3. ✅ `metadataBase` set so OG/Twitter image URLs resolve correctly
4. ✅ LocalBusiness + WebSite JSON-LD schema in root layout
5. ✅ Security headers added to `next.config.ts`

---

## 1. Technical SEO (25%) — Score: 68/100

| Check | Status | Finding | Evidence |
|---|---|---|---|
| robots.txt | ✅ Fixed | Serving correctly via App Router `robots.ts` | `/robots.txt` → 200 |
| sitemap.xml | ✅ Fixed | All 5 public URLs with priorities + change freq | `/sitemap.xml` → 200, valid XML |
| llms.txt | ✅ Fixed | AI crawler readiness file created | `/llms.txt` → 200 |
| HTTPS | ℹ️ N/A | Localhost environment; Firebase App Hosting enforces HTTPS in production automatically | Runtime env |
| Redirects | ✅ Pass | No unnecessary redirect chains (0 hops to homepage) | `redirect_checker.py` |
| Security headers | ✅ Fixed | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` added | `next.config.ts` |
| CSP | ⚠️ Warning | No `Content-Security-Policy` header — complex to add due to Firebase/Google Maps inline scripts | `security_headers.py` |
| noindex on internal pages | ✅ Fixed | `/order` and `/dashboard` get `X-Robots-Tag: noindex, nofollow` | `next.config.ts` |
| Mobile-first | ✅ Pass | Responsive Tailwind layouts throughout; `lang="en"` on `<html>` | Source review |
| Core Web Vitals | ⚠️ Unknown | PageSpeed API rate-limited; check via Google Search Console on live domain | API timeout |

---

## 2. Content Quality (20%) — Score: 72/100

| Check | Status | Finding | Evidence |
|---|---|---|---|
| Homepage content depth | ✅ Pass | Hero, Features, About, Coworking CTA, Reviews, Map sections | `app/page.tsx` |
| Coworking page content | ✅ Pass | Pricing cards, amenity pills, full house rules section (10 rules) | Source review |
| Menu page content | ✅ Pass | 8 food + 8 drink fallback items; filterable by category | Source review |
| Rooms page content | ✅ Pass | 3 room types with seasonal pricing, check-in booking | Source review |
| Contact page content | ⚠️ Warning | Thin content — address + hours + social links only; no FAQ, directions narrative, or "about the area" copy | Source review |
| E-E-A-T signals | ⚠️ Warning | No author attribution, no staff profiles, no awards/press mentions | Likely |
| Reviews | ✅ Pass | `ReviewsSection` component present on homepage | `app/page.tsx` |
| Readability | ✅ Pass | Plain, friendly language; short sentences; not keyword-stuffed | Content review |
| Duplicate content | ✅ Pass | Each page covers distinct content; no near-duplicate pages | Source review |
| AI citation readiness | ✅ Fixed | `llms.txt` created with structured business info | `/llms.txt` |

---

## 3. On-Page SEO (15%) — Score: 78/100

| Check | Status | Finding | Evidence |
|---|---|---|---|
| Homepage title | ✅ Pass | "Denz Coworking Cafe Phuket \| Work, Eat & Explore" (51 chars) | `layout.tsx` |
| Title template | ✅ Pass | `%s \| Denz Phuket` — unique per page | `metadata.title.template` |
| Coworking page title | ✅ Fixed | "Coworking Desk Space in Phuket \| Denz Phuket" | `coworking/layout.tsx` |
| Rooms page title | ✅ Fixed | "Rooms & Accommodation in Phuket \| Denz Phuket" | `rooms/layout.tsx` |
| Menu page title | ✅ Fixed | "Café Menu — Food & Drinks \| Denz Phuket" | `menu/layout.tsx` |
| Contact page title | ✅ Fixed | "Contact — Find Us in Kathu, Phuket \| Denz Phuket" | `contact/layout.tsx` |
| Meta descriptions | ✅ Fixed | All pages have unique, keyword-rich descriptions 120–160 chars | Per-page layouts |
| Canonical URLs | ✅ Fixed | `alternates.canonical` set on every page | `evaluate()` confirmed |
| H1 tags | ✅ Pass | Each page has one clear `<h1>` matching its page topic | Source review |
| Heading hierarchy | ✅ Pass | H1 → H2 → H3 pattern maintained throughout | Source review |
| Internal links | ✅ Pass | 6 consistent nav links across all pages; no orphan pages | `internal_links.py` |
| Anchor text | ⚠️ Warning | 7 links with empty anchor text (likely icon-only links in nav/footer) | `internal_links.py` |
| Keyword targeting | ✅ Pass | Keywords include location modifiers (phuket, kathu) + intent terms (coworking, desk, digital nomad) | `layout.tsx` |

---

## 4. Schema / Structured Data (15%) — Score: 80/100

| Check | Status | Finding | Evidence |
|---|---|---|---|
| LocalBusiness schema | ✅ Fixed | `@type: LocalBusiness + CafeOrCoffeeShop` with full address, geo, hours, amenities, social profiles | Root `layout.tsx` |
| WebSite schema | ✅ Fixed | Includes `SearchAction` / sitelinks searchbox signal | Root `layout.tsx` |
| JSON-LD format | ✅ Pass | Uses `<script type="application/ld+json">` — correct method | `evaluate()` confirmed |
| `@graph` pattern | ✅ Pass | Multiple entities linked via `@id` references | Root `layout.tsx` |
| Product/Service schema | ⚠️ Warning | No `Product` or `Service` schema on coworking pricing cards | Opportunity |
| Review schema | ⚠️ Warning | Reviews section present but no `Review` / `AggregateRating` schema | `ReviewsSection` |
| FAQPage schema | ℹ️ Info | Restricted to government/healthcare — not appropriate for commercial site | Critical rule |
| BreadcrumbList | ⚠️ Warning | No breadcrumb schema on `/coworking/[id]` or `/rooms/[id]` detail pages | Opportunity |

---

## 5. Performance / Core Web Vitals (10%) — Score: Unknown

| Check | Status | Finding |
|---|---|---|
| PageSpeed Insights | ⚠️ Unknown | API rate-limited during audit — test manually at pagespeed.web.dev with live domain |
| Image formats | ✅ Pass | Hero image uses `.webp` (`hero-bay-view.webp`); others are `.jpg` / `.png` |
| Image lazy loading | ⚠️ Warning | Hero images use `<img>` tags without `loading="lazy"` or Next.js `<Image>` |
| Font loading | ✅ Pass | `Plus_Jakarta_Sans` loaded via `next/font/google` with `display: 'swap'` |
| JS bundle | ✅ Pass | Next.js standalone output; all pages are dynamic client components |

---

## 6. Images (10%) — Score: 65/100

| Check | Status | Finding |
|---|---|---|
| Alt text | ✅ Pass | Hero images have descriptive alt text ("Denz Coworking Cafe open area") |
| Missing alt | ⚠️ Warning | Icon-only nav/footer links have empty anchor text (not images, but similar UX impact) |
| OG image | ✅ Fixed | Changed from logo PNG to `hero-coworking.jpg` with explicit 1200×630 dimensions |
| Next.js Image component | ⚠️ Warning | Pages use `<img>` not `next/image` — missing automatic WebP conversion, lazy loading, and size optimisation |
| WebP coverage | ⚠️ Warning | Only `hero-bay-view.webp` uses WebP; other images are `.jpg` / `.png` |

---

## 7. AI Search Readiness / GEO (5%) — Score: 75/100

| Check | Status | Finding |
|---|---|---|
| llms.txt | ✅ Fixed | Present at `/llms.txt` with structured business info and page links |
| Citability | ✅ Pass | Clear location, amenities, and pricing ranges stated in content |
| Direct answers | ⚠️ Warning | No FAQ-style Q&A content that AI can extract as a direct answer |
| Entity clarity | ✅ Pass | Business name, location, and type unambiguous across all pages |

---

## Open Graph / Social Meta

| Tag | Before | After |
|---|---|---|
| `og:url` | ❌ Missing | ✅ `https://denzphuket.com` |
| `og:image` | Logo PNG (no dimensions) | `hero-coworking.jpg` 1200×630 |
| `og:title` | ✅ Present | ✅ Per-page titles |
| `og:description` | ✅ Present | ✅ Per-page descriptions |
| `twitter:card` | ❌ Missing | ✅ `summary_large_image` |
| `twitter:site` | ❌ Missing | ✅ `@denzphuket` |

---

## Environment Limitations

- **PageSpeed / Core Web Vitals**: Google's PageSpeed Insights API blocked requests to `localhost`. Run `pagespeed.web.dev` against the live domain after pushing.
- **HTTPS checks**: Security header scores showed 0/100 because localhost uses HTTP. Firebase App Hosting enforces HTTPS in production — HSTS, mixed-content, and redirect checks should be re-run on the live domain.
- **Dynamic route metadata** (`/coworking/[id]`, `/rooms/[id]`): These pages are `'use client'` and pull space data from Firestore client-side. Server-side `generateMetadata` would require `firebase-admin` on the website. Currently these pages inherit their parent route's metadata (good), but unique per-space titles/descriptions are not yet possible without adding firebase-admin.
