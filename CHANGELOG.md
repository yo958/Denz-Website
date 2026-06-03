# Changelog

## [0.5.62] - 2026-06-03
### Changed
- llms.txt and llms-full.txt served as dynamic Next.js route handlers reading from Firestore (editable from POS Settings); static files removed

## [0.5.61] - 2026-06-03
### Added
- Contact page: social links now dynamic from Firestore, matching footer
### Changed
- Extracted SocialIcon + socialLabel into shared component (src/components/ui/SocialIcon.tsx)

## [0.5.60] - 2026-06-03
### Fixed
- Footer: removed duplicate Privacy Policy and Terms of Service from Explore links (already in bottom bar)

## [0.5.59] - 2026-06-03
### Changed
- Footer: replaced generic Lucide icons with official brand SVGs for all social platforms (Instagram, Facebook, TikTok, YouTube, X, LinkedIn, WhatsApp, TripAdvisor, Threads)

## [0.5.58] - 2026-06-03
### Added
- Footer: TripAdvisor (Star icon) and Threads (MessageSquare icon) social link support

## [0.5.57] - 2026-06-03
### Changed
- Footer: social media links now rendered dynamically from Firestore (managed via POS Settings → Venue → Social Media Links)

## [0.5.56] - 2026-06-03
### Added
- Complete migration redirect map in next.config.ts (301 permanent):
  - 40 old WordPress blog posts at root level (e.g. /coworking-phuket) → /guide/:slug
  - Old /guides/ plural → /guide
  - Old WP pages: /coworking-prices → /coworking, /denz-cafe → /menu, /privacy-policy-2 → /privacy, /sitemap → /, /social-links → /contact
  - All /product/* WooCommerce URLs → /menu
  - 15 old WordPress coworking desk page slugs → new SEO-friendly coworking slugs
  - /room/* (WordPress room URLs) → /rooms/* equivalents
  - Existing ID-based redirects preserved

## [0.5.55] - 2026-06-03
### Fixed
- `/guide` listing page: added explicit `robots: { index: true, follow: true }` override — was incorrectly inheriting noindex
- Sitemap: coworking spaces + rooms now load from correct Firestore path (`stores/default/slices/{spaces|products}`)
### Added
- Static server-rendered intro blocks to `/rooms`, `/menu`, `/coworking`, `/contact` layouts — Google now sees keyword-rich content without JS
- `/rooms`: H1 + H2s for all 3 room types + amenities + location in sr-only block
- `/menu`: H1 + H2s for Thai food, Western food, coffee, online ordering in sr-only block
- `/coworking`: H1 + H2s for hot desk, dedicated desk, private office, monitor desks, amenities
- `/contact`: H1 "Find Denz Coworking Café in Kathu, Phuket" + directions + hours + contact info
- `fetchPriority="high"` + `width`/`height` on hero image (LCP improvement)
- `width`/`height` + `loading="lazy"` on AboutSection, ChillSection, DogsSection images (CLS fix)
- `width`/`height` on navbar logo image

## [0.5.54] - 2026-06-03
### Changed
- FAQ answers now always rendered in DOM (CSS max-height toggle instead of conditional render) — all 11 Q&As now indexable by Google
- FeaturesSection H2: "Everything you need, in one place" → "Coworking, Café & Rooms in One Place in Phuket"
- FeaturesSection card H3s updated: coworking → "Coworking Space in Phuket", café → "Thai & Western Food in Kathu, Phuket", rooms → "WorkStay Rooms for Remote Workers in Phuket"
- AboutSection default H2: "A workspace that feels like home" → "Coworking Space in Kathu, Phuket"
- ChillSection H2: "Not everything has to be productive." → "Chill Space & Social Lounge in Phuket" (tagline demoted to subtitle)
- CoworkingCta H2: "From ฿X/day." → "Desk Rental in Patong, Phuket"
- DogsSection H2: "Our 5 French Bulldogs" → "Meet Our 5 French Bulldogs at Denz"
- MapSection H2: "Get directions" → "How to Get to Denz in Kathu, Phuket"

## [0.5.53] - 2026-06-03
### Added
- `llms-full.txt` — comprehensive AI-search profile (services, pricing, FAQ, directions)
- `AggregateRating` (5.0 / 150 reviews) added to LocalBusiness JSON-LD schema — enables star ratings in SERPs
- Explicit AI crawler management in `robots.ts` — allow PerplexityBot/Google-Extended, block GPTBot/ClaudeBot/CCBot
- Coworking spaces and rooms now included in `sitemap.ts` (fetched dynamically from Firestore)
- HSTS (`Strict-Transport-Security`) header added to all responses
### Changed
- `robots` metadata: added `max-snippet:-1`, `max-image-preview:large`, `max-video-preview:-1` for richer Google previews
- Hero H1 now includes visually-hidden keyword text ("Coworking Café in Kathu, Phuket") before the tagline
- Logo `alt` updated to "Denz Coworking Café Phuket" (was "Denz")
- `llms.txt` expanded with popular guide article links, pricing detail, and amenity summary
- `openingHoursSpecification` no longer includes Saturday/Sunday 00:00–00:00 entries (schema spec: omit closed days)
### Fixed
- Saturday/Sunday `openingHoursSpecification` removed from contact layout schema (was incorrectly set to 00:00–00:00)

## [0.5.52] - 2026-06-02
### Added
- Privacy Policy page at `/privacy` with PDPA-aware sections
- Terms of Service page at `/terms` covering bookings, cancellations, and acceptable use
- Footer links to Privacy Policy and Terms in Explore nav + copyright bar

## [0.5.51] - 2026-06-02
### Added
- Coworking page: amenity pills and house rules section now read from Firestore page-content with hardcoded fallbacks

## [0.5.50] - 2026-06-02
### Added
- All page layouts (Home, Menu, Coworking, Rooms, Guide, Contact) now use `generateMetadata` reading `seo.*` from Firestore `page-content/{slug}` via Admin SDK — meta title, description, and focus keyword all controllable from POS
- `src/lib/page-seo.ts` shared helper for server-side SEO reads

## [0.5.49] - 2026-06-02
### Added
- All page hero sections (Home, Menu, Coworking, Rooms, Guide, Contact) now read live content from `page-content` Firestore collection via `usePageContent` hook, falling back to hardcoded defaults
- `usePageContent` hook for client-side Firestore reads from `page-content/{slug}`
- `GuideHero` client component so guide page hero is editable without losing SSR for post listings

## [0.5.48] - 2026-06-02
### Changed
- Navbar: reorder links to Coworking → Rooms → Menu → Guides → Contact

## [0.5.47] - 2026-06-02
### Fixed
- Guide page: add `FIREBASE_SERVICE_ACCOUNT_JSON` secret to `apphosting.yaml` so server-side Firestore fetch works on Firebase App Hosting — posts were returning empty because the env var was missing at runtime

## [0.5.46] - 2026-06-01
### Fixed
- Rooms page: images now fetched from `product-images/{id}` Firestore collection (was trying to read from products slice which strips images to stay under 1MB)

## [0.5.45] - 2026-06-01
### Fixed
- ReviewsSection: fallback logic — if a page has fewer than `minItems` (default 4) tag-matched reviews, fills remaining slots with other top-rated approved reviews so no page ever shows fewer than 4 cards

## [0.5.44] - 2026-06-01
### Added
- ReviewsSection: multi-photo carousel on review cards — prev/next arrows (appear on hover), dot indicators, and photo count badge (e.g. 1/3); single-photo cards show static image as before

## [0.5.43] - 2026-06-01
### Fixed
- ReviewsSection: Google review photos now load via server-side proxy (`/api/proxy-image`) — bypasses browser referrer block on Google's `grass-cs` CDN path
- Author avatars also proxied for consistency; size params (`=w800`, `=s120`) appended correctly
- Added `onError` handler to gracefully hide photo header if image ever fails

## [0.5.42] - 2026-06-01
### Added
- ReviewsSection: dynamic Google Reviews from Firestore (replaces hardcoded placeholders) with photo cards, star ratings, author avatar, Google badge, "read more" expand, and per-page tag filtering
- Menu, coworking, and rooms pages: food/coworking/rooms-tagged review strips at bottom of each page
- Menu item detail page: food-tagged review strip at bottom

## [0.5.41] - 2026-06-01
### Added
- Homepage: Chill Space / Social Lounge section (bean bags, TV, Nintendo 64, Patong Bay views)
- Homepage: French Bulldogs section with all 5 names (Denz, Frank, Coco, Isabell, Little Luna)
- Homepage: FAQ section with 11 Q&As covering hours, desks, monitors, food, dogs, printing, parking, WiFi
### Changed
- Homepage: Replaced 4 placeholder reviews with real customer quotes
- Homepage: Fixed opening hours fallback from "Mon–Sun" to "Mon–Fri, Sat–Sun: Closed, Kitchen: 11:00–22:00"
- Homepage: Added directions narrative to map section address
- Rooms: Updated FALLBACK_ROOMS pricing (฿2,000–2,500/night), WorkStay branding, and full amenities copy
- Rooms: Updated feature badges to reflect actual room inclusions (standing desk, 50" Smart TV, hot desk included)

## [0.5.40] - 2026-06-01
### Changed
- SEO: menu, coworking, and rooms detail pages now use name-derived slugs (e.g. `/menu/pad-thai`, `/coworking/hot-desk`, `/rooms/room-1-king-deluxe`) instead of raw Firestore IDs
- Added `src/lib/slug.ts` with `toSlug()` utility (unicode normalisation, strips inch marks and special chars)
- Added 301 redirects in `next.config.ts` for all known old ID-based URLs

## [0.5.39] - 2026-06-01
### Fixed
- Rooms detail page: breadcrumb was hidden under the fixed navbar (pt-6 → pt-24)

## [0.5.38] - 2026-06-01
### Added
- Visible breadcrumb navigation (Home › Section › Item) on coworking, rooms, and menu detail pages — replaces the simple back link

## [0.5.37] - 2026-06-01
### Fixed
- Coworking detail page: removed hardcoded "What's included" bullet list — content is now covered by the longDescription; amenity pills remain as the visual summary

## [0.5.36] - 2026-06-01
### Changed
- Menu item detail page: image now displays as a full-width hero (16/7 aspect, rounded, same layout as rooms pages) instead of a small thumbnail inside the order card; items without an image fall back to a glyph emoji placeholder

## [0.5.35] - 2026-05-31
### Fixed
- Menu item detail page: fetch product image from `product-images/{id}` Firestore collection so images uploaded in the POS now appear on the website

## [0.5.34] - 2026-05-31
### Added
- Menu item detail pages (`/menu/[id]`): layout upgraded to read live product data from Firestore via Admin SDK — real items now get accurate `<title>`, meta description, and Product schema (name, price, category, image)
- Product schema on menu item pages: includes `category`, `image` (when set), Twitter card, and `keywords` from focus keyword
- Website Product type: `longDescription`, `metaTitle`, `metaDescription`, `focusKeyword` fields (mirrored from POS)

## [0.5.33] - 2026-05-31
### Fixed
- Guide listing and guide post pages: added export const dynamic = 'force-dynamic' — Next.js was statically rendering them at build time when Firebase credentials aren't present, baking in empty posts; now renders at request time
- robots.ts: same fix — dynamic rendering so noindex flag is read at request time not build time

## [0.5.32] - 2026-05-30
### Added
- Root layout generateMetadata reads venue-settings/website.noindex from Firestore — when enabled, sets robots: noindex,nofollow across all pages
- robots.ts reads same setting — when noindex is true, disallows all crawlers in robots.txt

## [0.5.31] - 2026-05-30
### Fixed (SEO)
- Root layout: fixed telephone (was empty string → +66639177720), streetAddress (was 'Kathu' → 'Soi 4, Soi Khuanyang'), added Saturday/Sunday closed hours to OpeningHoursSpecification, SearchAction target changed to /guide
- coworking/layout: added BreadcrumbList schema
- rooms/layout: added BreadcrumbList schema, fixed streetAddress and added telephone
- menu/layout: added BreadcrumbList schema
- contact/layout: added BreadcrumbList + LocalBusiness + ContactPoint schema (was completely empty)
- guide/[slug]/layout: Article author now uses @type Person when author name is set, Organization as fallback
- sitemap: removed 16 fake menu IDs (f1-f8, d1-d8) that were causing 404s in the sitemap

## [0.5.30] - 2026-05-30
### Changed
- robots.ts: allow all bots — every AI crawler (GPTBot, CCBot, Diffbot, Bytespider, ClaudeBot, PerplexityBot etc.) can index the site for maximum business discoverability across all AI platforms

## [0.5.29] - 2026-05-30
### Fixed
- robots.ts: unblock GPTBot — allowing it means Denz appears when people ask ChatGPT about coworking in Phuket; only block pure data scrapers (CCBot, Diffbot, Bytespider)

## [0.5.28] - 2026-05-30
### Fixed (SEO)
- Guide listing and guide post pages converted from 'use client' to async Server Components — article content, H1, titles, and internal links now server-rendered and crawlable by Googlebot
- Guide listing: all post links included in sr-only server-rendered list for crawler discovery
- Guide post: article body, breadcrumb, tags, related articles all SSR; TOC/IntersectionObserver/Instagram extracted to ArticleClient island
- Guide layout title fixed: was duplicating suffix ("Denz Phuket | Denz Phuket"), now uses absolute title
- robots.ts: added explicit disallow rules for GPTBot, CCBot, Diffbot, Bytespider
- Homepage meta description extended to 160 chars
### Added
- TableOfContents.tsx, ArticleClient.tsx, GuideListingClient.tsx as dedicated component files

## [0.5.27] - 2026-05-30
### Changed
- Guide post TOC: restore white background, keep border removed

## [0.5.26] - 2026-05-30
### Changed
- Guide post TOC: removed border and white background from contents container

## [0.5.25] - 2026-05-30
### Fixed
- Guide post: Instagram script duplicate-guard now matches both embed.js and embeds.js variants

## [0.5.24] - 2026-05-29
### Fixed
- Guide post: Instagram embed script deferred 100ms to ensure blockquote is in DOM; duplicate script tag guard added

## [0.5.23] - 2026-05-29
### Fixed
- Guide post: Instagram embeds now render — added onload callback to call Embeds.process() after script loads
- Guide post: blockquote styles no longer override Instagram embed blockquote styling

## [0.5.22] - 2026-05-29
### Changed
- Guide post TOC: all H2 sections open by default instead of collapsed
- Guide post sidebar: removed sticky positioning so ads scroll with the page

## [0.5.21] - 2026-05-29
### Added
- Guide listing: show 20 posts initially with "Load more · N remaining" button for the rest; resets to 20 when switching category filter

## [0.5.20] - 2026-05-29
### Fixed
- Guide post tables now render with borders, padding, alternating row shading, and proper column alignment

## [0.5.19] - 2026-05-29
### Changed
- Guide post sidebar ads: icon moved inline beside title/subtitle to reduce vertical height

## [0.5.18] - 2026-05-29
### Changed
- Guide post sidebar ads: restyled to match homepage FeaturesSection cards (tinted bg, icon, eyebrow, bold headline, arrow CTA); compact p-5 size to take less vertical space

## [0.5.17] - 2026-05-29
### Changed
- Guide post sidebar: widened to 320px; ad cards moved above TOC; TOC now collapsible — H2s always visible with expand/collapse toggle, H3s hidden until opened; active section auto-expands

## [0.5.16] - 2026-05-29
### Changed
- Guide listing page: full max-w-7xl width matching all other pages; 4-col grid on xl screens
- Guide listing page: category filter buttons ordered by frequency; live article count
- Guide post page: widened to max-w-7xl to match site standard
- Clicking a category chip on a card now filters the listing in place

## [0.5.15] - 2026-05-29
### Fixed
- Guide post: dynamically load Instagram embeds.js when post contains instagram-media blockquotes, so embedded Instagram posts render correctly

## [0.5.14] - 2026-05-29
### Fixed
- Guide post: convert wp-block-embed figure wrappers and bare YouTube URLs to responsive iframes at render time (fixes already-imported posts without re-importing)

## [0.5.13] - 2026-05-29
### Fixed
- Guide post: iframe (YouTube embed) styled full-width with rounded corners

## [0.5.12] - 2026-05-29
### Changed
- Renamed "Guide" to "Guides" in navbar, all breadcrumbs, and back-links; /guide permalink unchanged

## [0.5.11] - 2026-05-29
### Changed
- Guide listing page: replaced generic AI-written hero with concise on-brand header — eyebrow label, bold headline, one-line subtext

## [0.5.10] - 2026-05-29
### Added
- Guide post article body: inline images from blog editor now render with rounded corners and spacing

## [0.5.9] - 2026-05-29
### Changed
- Guide post sidebar promo cards: removed gradient image header, now compact text-only cards with coloured border

## [0.5.8] - 2026-05-29
### Added
- Café & food promo card (amber) in guide post sidebar linking to `/menu`

## [0.5.7] - 2026-05-29
### Added
- Sidebar promo cards on guide post pages — coworking (violet) and rooms (emerald) with links to `/coworking` and `/rooms`; sidebar always visible on desktop, TOC still shown above when applicable

## [0.5.6] - 2026-05-29
### Changed
- More Articles section now shows up to 6 posts (was 3) — fills a clean 2-row grid on desktop

## [0.5.5] - 2026-05-29
### Added
- "More Articles" section at the bottom of each guide post — shows up to 3 cards with feature image, category, title, date, and reading time; prioritises posts sharing the same category, then fills with newest posts

## [0.5.4] - 2026-05-29
### Changed
- Renamed /blog → /guide across all URLs, page titles, headings, navbar, breadcrumbs, sitemap, and llms.txt
- Added 301 permanent redirects: /blog → /guide and /blog/:path* → /guide/:path*

## [0.5.3] - 2026-05-29
### Changed
- Blog post breadcrumb now includes the first category: Home › Blog › Travel › Post Title
- BreadcrumbList JSON-LD schema updated to match (4 positions when category present, 3 when not)
- Category crumb is a clickable link to the category archive page

## [0.5.2] - 2026-05-29
### Fixed
- Blog, category, and tag pages now use `pt-24` to clear the fixed navbar (was clipping the heading)
### Added
- Blog nav link added to Navbar (desktop + mobile menu)

## [0.5.1] - 2026-05-29
### Fixed
- Blog listing, category, and tag pages now use a single-field `where('status', '==', 'published')` query (no composite index required) and sort client-side — fixes "No articles published yet" caused by Firestore rejecting the composite query + unfiltered fallback

## [0.5.0] - 2026-05-29
### Added
- **Blog section** — full blog on the website with SEO-optimised pages:
  - `/blog` — listing page with published articles, feature images, category pills, reading time
  - `/blog/[slug]` — article detail with `Article` JSON-LD schema, `BreadcrumbList`, sticky Table of Contents (auto-generated from H2/H3 headings), reading time, OG tags, and per-article canonical URLs; server-side `generateMetadata` uses Firebase Admin for accurate head tags
  - `/blog/category/[slug]` — category archive with `CollectionPage` schema + `BreadcrumbList`
  - `/blog/tag/[slug]` — tag archive with `CollectionPage` schema + `BreadcrumbList`
- `firebase-admin` added as dependency; `src/lib/firebase-admin.ts` singleton for server-side Firestore reads
- `BlogPost` and `BlogTaxonomy` types added to `src/types/index.ts`
- **Sitemap** updated: `/blog` listing at priority 0.8; all published post slugs, category slugs, and tag slugs fetched live from Firestore via Admin SDK
- **`llms.txt`** updated with blog section and page URL

## [0.4.24] - 2026-05-27
### Added
- **Menu item detail pages** (`/menu/[id]`): individual page for each café menu item, matching the coworking/rooms detail page pattern
  - `src/app/menu/[id]/layout.tsx` — `generateMetadata` sets per-item canonical URL, title, description, OG tags; static `ITEM_META` map covers all 16 fallback items (f1–f8 food, d1–d8 drinks); `BreadcrumbList` schema (Home → Menu → Item); `Product` schema with `Offer` (price in THB, `InStock`, seller linked to `LocalBusiness`)
  - `src/app/menu/[id]/page.tsx` — client component; fetches live data from Firestore `products` slice; shows item name, category badge, description, price, Add to cart button, sticky cart bar; handles not-found state
- **Menu listing page links**: item name/description now links to the detail page (`/menu/${item.id}`); hover colour added
- **Sitemap**: all 16 fallback menu item URLs added at priority 0.5

## [0.4.23] - 2026-05-25
### Added
- **Product-type schema on all main pages:**
  - `/coworking` — `Service` JSON-LD with 5 pricing `Offer` nodes (Hot Desk hourly/daily, Dedicated Desk weekly/monthly, Private Office monthly), amenity features, and area served
  - `/rooms` — `LodgingBusiness` JSON-LD with `containsPlace` containing `HotelRoom` (Standard ฿800/night), `HotelRoom` (Deluxe ฿1,200/night), and `Suite` (Studio ฿1,800/night), each with full amenity features and `UnitPriceSpecification`
  - `/menu` — `Menu` JSON-LD with two `MenuSection` nodes (Food 8 items, Drinks 8 items), each `MenuItem` including name, description, price, and `suitableForDiet` where applicable
- **Detail-page layouts (3 new files):**
  - `coworking/[id]/layout.tsx` — `generateMetadata` sets correct per-space canonical and OG URL; `BreadcrumbList` schema with 3 levels
  - `coworking/equipment/[id]/layout.tsx` — `generateMetadata` with equipment-specific metadata; `BreadcrumbList` + `Product` schema with hourly `Offer`
  - `rooms/[id]/layout.tsx` — `generateMetadata` with known-room metadata lookup (standard/deluxe/suite) for correct title, description, OG image, and canonical; `BreadcrumbList` schema
### Fixed
- **Duplicate canonical bug** — `/coworking/[id]` and `/rooms/[id]` detail pages were inheriting the parent layout's canonical (`/coworking`, `/rooms`). Each now gets its own correct canonical via `generateMetadata`

## [0.4.22] - 2026-05-25
### Added
- **robots.ts** — App Router `robots.ts` serving `/robots.txt`. Allows all crawlers on public routes, disallows `/order` and `/dashboard`. Includes sitemap URL.
- **sitemap.ts** — App Router `sitemap.ts` serving `/sitemap.xml` with all five public pages (home, coworking, rooms, menu, contact) with priorities and change frequencies.
- **llms.txt** — AI search readiness file at `/llms.txt` with structured description of Denz, key pages, amenities, and location for LLM citation.
- **Per-page metadata layouts** — New `layout.tsx` files in `coworking/`, `rooms/`, `menu/`, and `contact/` route directories. Each exports unique `title`, `description`, `keywords`, `openGraph`, and `alternates.canonical` metadata suited to that page's content and search intent.
- **LocalBusiness + WebSite JSON-LD schema** — Structured data injected in root layout covering business name, address, geo coordinates, opening hours, amenities, social profiles, and `SearchAction`.
- **Security headers** — `next.config.ts` now sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` on all routes. `/order` and `/dashboard` additionally get `X-Robots-Tag: noindex, nofollow`.
### Fixed
- **og:url missing** — Added `metadataBase` to root layout metadata so Next.js resolves all OG/Twitter image URLs and `og:url` correctly as absolute URLs.
- **OG image** — Changed from `denz-logo.png` to `hero-coworking.jpg` (1200×630) as the default social share image, with explicit dimensions. Per-page layouts use relevant hero images.
- **Twitter card** — Added `twitter.card`, `twitter.images`, and `twitter.site` fields to root metadata.
- **Canonical URLs** — Each page now has an explicit `alternates.canonical` pointing to its full URL.

## [0.4.21] - 2026-05-21
### Fixed
- **First-available date — off by one for weekly/monthly bookings**: The booking calendar was opening to the day *after* `bookingEndsAt` (e.g. Tuesday 26th) when it should open to `bookingEndsAt`'s own date (Monday 25th). A weekly booking stores `bookingEndsAt` as `start + 7 calendar days` at closing time; that day is the first free day, not the last occupied one. The fix only advances by 1 day when the booking ends *today* (desk still occupied); for future end dates the calendar opens to that date directly, skipping weekends.

## [0.4.20] - 2026-05-21
### Fixed
- **First-available date in booking modal**: When a desk is at capacity, the booking calendar now opens to the first workday *after the latest active booking ends*, rather than blindly defaulting to tomorrow. For example, if a weekly booking runs through Friday the 22nd, the calendar now opens to Monday the 25th. Applies to both the coworking listing page and the space detail page.

## [0.4.19] - 2026-05-21
### Fixed
- **Booking calendar — yesterday selectable in UTC+7 timezone**: `toDateValue()` used `toISOString().slice(0, 10)` which returns the UTC date. In Thailand (UTC+7), before 7 AM local time this gives yesterday's date, making yesterday's date bookable. Fixed by using local `getFullYear()`/`getMonth()`/`getDate()` across all three coworking booking pages (listing, detail, equipment detail) — matching the approach already used by the Calendar component itself.

## [0.4.18] - 2026-05-21
### Changed
- **Working days notice — red styling**: The Mon–Fri notice in booking modals (weekly, 2-week, monthly, etc.) is now a red pill with red border and bold red text instead of a muted grey box, making it much harder to miss.

## [0.4.17] - 2026-05-20
### Changed
- **Coworking house rules updated** with the real Denz rules: Karma, No Outside Food or Drink, Share Equipment Considerately, The Cooling Fans Are for Everyone, Jukebox Etiquette, Don't Feed the Dogs, Maintain a Low-Noise Atmosphere, Keep It Clean, Respect Personal Space, Follow Staff Guidance. Each rule now shows a title + description instead of a single line.

## [0.4.16] - 2026-05-20
### Added
- **Equipment detail pages** (`/coworking/equipment/[id]`): each Mac Mini rental now has its own detail page showing name, description, tiered hourly pricing table, feature pills, and a "Rent this" button that opens the same hourly quantity + time picker modal as the listing page.
- **"More info →" links on equipment cards**: the equipment section on the coworking listing page now links to each item's detail page.
- `longDescription` field added to `Equipment` type (website) for future rich content support.

## [0.4.15] - 2026-05-20
### Fixed
- **Coworking detail page — hourly period opens quantity+time picker**: Clicking "Book this space" with "Per hour" selected now shows the same hourly modal as the listing page (hour stepper, estimated total, calendar, and start time picker). Previously it incorrectly showed the standard desk calendar modal.

## [0.4.14] - 2026-05-20
### Fixed
- **Coworking detail page — today blocked for all periods when desk is full**: Previously only the daily period blocked today when the desk was at capacity. Weekly, monthly, and longer periods now also default to tomorrow as the earliest selectable date when today is full.

## [0.4.13] - 2026-05-20
### Fixed
- **Coworking detail page — today still selectable when desk is full (timezone bug)**: `tomorrowStr` was computed using `new Date(y, m, d+1)` which creates midnight local time. Since `toISOString()` returns UTC, in UTC+7 midnight local is the previous day in UTC — so `tomorrowStr` equalled `todayStr` and the calendar treated tomorrow as today. Fixed by using `setDate(d+1)` which preserves the time component so the UTC date string is correct in all timezones.

## [0.4.12] - 2026-05-20
### Fixed
- **Coworking detail page — today still selectable in modal when desk is full**: The booking modal's calendar minDate was computed once when the modal opened. If Firestore tab data arrived after the modal was already open, the calendar remained stuck on today even when the desk was fully booked. minDate is now computed reactively on every render, and a useEffect corrects the selected date to tomorrow if Firestore later confirms today is full.

## [0.4.11] - 2026-05-20
### Fixed
- **Coworking detail page — daily bookings blocked for tomorrow when today is full**: The "Per day" period button was disabled and auto-advanced away when today was at capacity, making it impossible to book a daily slot starting tomorrow. The daily button is now always clickable; if today is full the booking modal opens with tomorrow as the earliest selectable date. A "Today full" note appears on the button as informational only, and the hint text below the book button explains the next step.

## [0.4.10] - 2026-05-20
### Changed
- **Coworking detail page — "Book this space" now opens the booking modal**: Clicking the button on a space detail page now shows the same date-picker modal used on the listing page cards (walk-in vs dedicated desk comparison, calendar, "Continue to book"), instead of navigating directly to the order page.

## [0.4.9] - 2026-05-20
### Fixed
- **Coworking detail page — "Not available today" shown even on weekly/monthly periods**: The book button now only shows "Not available today" when the desk is full AND the selected period is daily. Weekly/monthly periods always go to the order form (which defaults to the next available date).
- **Coworking detail page — auto-advances period from daily when full**: On page load, if the desk is full today and daily is the default period, the page automatically selects the next bookable period (e.g. weekly) so the user never lands on a blocked state.
- **Coworking detail page — React error #310**: The availability `useEffect` was placed after conditional early returns, violating React's rules of hooks. Moved all availability computation and hooks before the loading/not-found guards using null-safe access.

## [0.4.8] - 2026-05-20
### Fixed
- **Coworking booking picker — today blocked when desk is full**: When the calendar defaults to tomorrow because the desk is occupied, today is now also disabled (not just pre-skipped). Previously the user could click back to today and still submit a booking for a full desk.

## [0.4.7] - 2026-05-20
### Fixed
- **Coworking listing — weekly booking no longer marks monthly/longer tabs as "Full"**: A space with an active weekly booking now correctly shows as available on the weekly, monthly, and longer-period tabs. The fix infers each booking's own period from the desk product name (e.g. "… — Weekly") and only counts it on tabs of equal or longer duration. A weekly booking blocking today's daily slot does not block a future monthly reservation.

## [0.4.6] - 2026-05-20
### Changed
- **Coworking availability badges — "N of M spots available" format**: Both the detail page (`/coworking/[id]`) and the listing card grid now show the full "X of Y spots available" label instead of "X available" or "X spots free".
- **Coworking listing cards — green availability badge**: The availability pill is now green (`bg-green-50 text-green-700`) on white cards when spots remain, matching the detail page colour. Dark/highlighted and private-office cards use appropriately tinted green variants.

## [0.4.5] - 2026-05-20
### Fixed
- **Coworking listing page — multi-desk tab availability**: A single tab covering two desk spaces (e.g. two customers booking "Standup Desk + 27\"" and "Desk + Dual 24\"" together) now correctly marks both spaces as occupied on the `/coworking` card grid. Previously only the tab's primary label space was counted; all desk items in the tab are now scanned.

## [0.4.4] - 2026-05-20
### Fixed
- **Desk detail page — booking blocked when full**: When the desk is currently occupied, the "Per day" period button is disabled ("Full today" label) and the book button changes to "Not available today" with a note to choose a weekly or monthly option. Weekly/monthly periods remain bookable as advance reservations.

## [0.4.3] - 2026-05-20
### Fixed
- **Desk detail page — availability counting**: Paid daily desk tabs where `openedAt` is today now correctly count as occupied (matching POS coworking board logic). Previously only `open`-status tabs were counted, causing prepaid customers to not register as taking the spot.

## [0.4.2] - 2026-05-20
### Added
- **Desk detail page — live availability**: Booking card now reads the POS `tabs` Firestore slice and counts active bookings to show real-time desk availability. Walk-in section shows a green "X spots free" or amber "Currently occupied" badge. Message updates to "Walk-in full · book a dedicated desk to secure your spot" when the space is taken.

## [0.4.1] - 2026-05-20
### Changed
- **Desk detail page — booking card**: Walk-in rates (from `space.rates`) are now shown above the dedicated rates as informational only ("Walk-in rate · Drop in anytime") and cannot be selected for booking. Only dedicated desk rates (`space.dedicatedRates`) appear in the period selector and route to the order form. Exception: spaces named "Hot Desk" or "No Desk" remain fully bookable with all rates selectable.

## [0.4.0] - 2026-05-20
### Added
- **Desk detail pages**: New `/coworking/[id]` route showing individual desk package pages with name, description, amenity pills, features list, rich long description (from POS), and a sticky booking card with period selector.
- **"More info →" links**: Each space card on `/coworking` now has a "More info →" link pointing to its detail page.
- **`CoworkSpace.longDescription`**: Added optional `longDescription` field to the website `CoworkSpace` type, mirroring the POS addition.

## [0.3.29] - 2026-05-20
### Added
- **Quick pricing card**: Added Private Office (฿200/hour) row below Desk + Mac Mini.
### Changed
- **Coworking section (homepage)**: Removed private office photo from pricing section to fix layout imbalance.
- **Docker**: Added Dockerfile and docker-compose.yml for local development on port 3003.

## [0.3.28] - 2026-05-20
### Added
- **Real Denz photos throughout the website**: Replaced broken placeholder images with actual Denz photos.
  - **Hero section**: Background now uses the wide Denz coworking open-area photo (sunset light, panoramic windows).
  - **About section**: Shows a real standup desk photo of a customer working at Denz.
  - **Features section**: Each of the three feature cards (Coworking, Café, Rooms) now has a real photo — standup desk, Thai green curry, and Honey Moon Suite respectively. Cards redesigned with photo-on-top layout and hover scale effect.
  - **Photo strip**: New 4-photo gallery grid added between the Features and About sections — coworking evening atmosphere, private office studio, cashew chicken, and Phuket sunset view.
  - **Coworking section (homepage)**: Private office studio photo added above the pricing text with a "Private office available" badge.
  - **Coworking page**: Full-width hero photo of the open coworking space at the top of the page.
  - **Menu page**: Three-panel food photo banner (green curry, cashew chicken, western wrap) at the top of the menu page.
### Fixed
- **About section stat**: "From ฿50/hour" corrected to "From ฿200/day".
- **Features section copy**: "Start from just ฿50/hour" corrected to "Start from just ฿200/day".
- **Coworking page copy**: "From hourly hot desks" changed to "From day passes" to match actual offering.

## [0.3.27] - 2026-05-20
### Fixed
- **Homepage — coworking body copy updated**: Changed "for an hour or a private office for a year" to "for a day or a private office for a month" to accurately reflect available packages.

## [0.3.26] - 2026-05-20
### Fixed
- **Homepage — coworking perks updated**: Replaced "Lockers available" with "Backup internet line".

## [0.3.25] - 2026-05-20
### Fixed
- **Homepage — Weekly note corrected to "5 days"**: Open 5 days per week, not 7.

## [0.3.24] - 2026-05-20
### Changed
- **Homepage — headline changed to "From ฿X/day"**: Big headline now uses the day pass rate instead of the hourly Mac Mini rate.
- **Homepage — pricing card shows "from" prefix on every row**: Each price now reads "from ฿X" to make clear these are starting prices.

## [0.3.23] - 2026-05-20
### Fixed
- **Homepage — removed ฿50/hr standalone desk row**: Hourly desk-only is not an offered package. The Hourly row is removed from the Quick Pricing card. The "From X/hr" headline and the first card row now both use the Mac Mini rate (฿150) as the real entry-level hourly option.

## [0.3.22] - 2026-05-20
### Fixed
- **Homepage — Desk + Mac Mini price**: Mac Mini rental includes desk access, so bundle price is the Mac Mini rate alone (฿150), not desk + Mac Mini added together. Note updated to "per hour · desk included".

## [0.3.21] - 2026-05-20
### Added
- **Homepage — Desk + Mac Mini bundle row**: The Quick Pricing card now shows a "Desk + Mac Mini / per hour, all-in" row (฿150) immediately after the base Hourly rate. The price is computed live from Firestore: cheapest enabled hourly desk rate + cheapest Mac Mini equipment tier-1 price.

## [0.3.20] - 2026-05-20
### Changed
- **Homepage — coworking pricing pulled live from Firestore**: The "Quick Pricing" card in the homepage coworking section now reads rates directly from the POS `spaces` slice instead of using hardcoded values. The lowest enabled rate for each period (hourly, daily, weekly, monthly) across all active spaces is displayed. The "From ฿X/hr" headline also updates automatically. Periods with no matching space rate are hidden rather than showing a stale price.

## [0.3.19] - 2026-05-20
### Fixed
- **Room detail page — picker ignored seasonal pricing**: The estimated total in the night picker was calculated as `baseRate × nights` (flat) instead of summing per-night rates. Stays that span season boundaries now show a correct per-segment breakdown (e.g. "฿1,200 × 3 nights (Low Season) + ฿1,800 × 7 nights (High Season)"). The total passed to the order URL is also corrected.
- **Room detail page — future bookings incorrectly showing as "Occupied"**: Same fix applied as the listing page — `activeStay` now requires `checkInAt <= today`.

## [0.3.18] - 2026-05-20
### Fixed
- **Rooms page — future bookings incorrectly showing as "Occupied"**: A stay with `status: 'active'` whose check-in date is still in the future was causing the room card to display the amber "Occupied until…" badge today. `getActiveStay` now only flags a room as occupied when the check-in date is today or earlier.

## [0.3.17] - 2026-05-20
### Changed
- **Navbar — hide "My Orders" when not signed in**: The My Orders link only appears in the nav (desktop and mobile) once the user is authenticated. Guests see no link to the dashboard until they sign in.

## [0.3.16] - 2026-05-20
### Changed
- **My Orders page — auth-gated**: The dashboard now requires sign-in. Guests see a proper auth wall ("Sign in / Create account") with a feature overview instead of an email search form. Orders auto-load once signed in.
- **AuthModal — `initialMode` prop**: Can be opened directly to sign-up or sign-in from the auth gate on the dashboard page.
- **Navbar — Sign in button style**: Made more prominent with an outlined border so it's clearly visible to users who need to sign in.

## [0.3.15] - 2026-05-20
### Added
- **Firebase Auth — sign in / create account**: Customers can now sign in or create an account (email + password) via a modal accessible from the Navbar ("Sign in" button). Once signed in their name/email is shown in the nav with a sign-out button.
- **Dashboard — auto-load orders when signed in**: The My Orders page automatically fetches and displays orders for the logged-in user's email. A "Sign in" prompt is shown below the email search form for guests, and a sign-in CTA is available for one-click access.
- **Order submission stores userId**: When an authenticated user places a booking, their Firebase Auth `userId` is stored on the order document for future querying.

## [0.3.14] - 2026-05-20
### Changed
- **Order page — email & phone required for desk and room bookings**: Email and phone are now marked required (red `*`) and validated before submission for Desk booking and Room enquiry order types. Café orders continue to need only a name.

## [0.3.13] - 2026-05-20
### Fixed
- **Order page — Firestore write fails with "undefined field value"**: Submitting a booking when any cart item had no note set caused `setDoc()` to throw a FirebaseError because `note: undefined` is not a valid Firestore value. Fixed by converting `undefined` → `null` in both the order item mapping and in `submitWebOrder()` itself (a belt-and-braces sanitiser using a JSON reviver, so all future callers are also protected).

## [0.3.12] - 2026-05-19
### Fixed
- **Rooms page — seasonal pricing total**: The estimated total in the night picker now correctly sums each individual night at its applicable season rate, rather than applying the check-in date's rate to all nights. A stay crossing a season boundary (e.g. Oct 31 → Nov 9) now shows the correct split breakdown (e.g. "฿1,200 × 1 night (Low Season) + ฿2,000 × 8 nights (High Season)").

## [0.3.11] - 2026-05-19
### Changed
- **Room detail page — photo gallery**: Replaced dark lightbox modal with an Airbnb-style white full-page scrollable gallery. Sticky header shows a back arrow, "Photo tour" title, and photo count. A horizontal thumbnail strip below the header lets users jump to any photo. Main content is a 2-column grid of rounded photos with generous spacing. Esc key closes the gallery, body scroll is locked while open.

## [0.3.10] - 2026-05-19
### Changed
- **Room detail page — gallery**: Photo grid now has page padding, rounded corners, and a clean back link above the grid — matching Airbnb's layout. "Show all photos" button styled as a solid white pill with border rather than backdrop-blur overlay.

## [0.3.9] - 2026-05-19
### Changed
- **Room detail page — gallery**: Replaced single-image hero with an Airbnb-style photo grid. Large image left, 2×2 smaller images right. Overflow photos show a "+N" overlay on the last cell. "Show all photos" pill in the bottom-right corner. Clicking any photo opens a full-screen lightbox with prev/next arrows, keyboard nav (←/→/Esc), and a thumbnail strip. Single-image rooms fall back to the original full-width hero.

## [0.3.8] - 2026-05-19
### Added
- **Rooms — Gallery**: Room cards show a photo count badge (e.g. "4") when a gallery is present. Room detail pages display a full gallery: main image with prev/next arrows, a "X / Y" counter overlay, and a thumbnail strip below the hero for quick navigation.

## [0.3.7] - 2026-05-18
### Changed
- **Room detail page** — long description now renders as HTML (from TipTap WYSIWYG) using `dangerouslySetInnerHTML`. Headings, bold, italic, and lists are fully styled. Removes `react-markdown` dependency path.

## [0.3.6] - 2026-05-18
### Changed
- **Room detail page** — long description now renders markdown formatting (headings, bold, italic, bullet lists) via `react-markdown`.

## [0.3.5] - 2026-05-18
### Added
- **Room detail pages** — individual landing page at `/rooms/[id]` for each room. Shows hero image, short description, feature tags, full long description (multi-paragraph), and a sticky booking card with the night picker. Clicking the room image on the listing page navigates here. A "More info" link also appears on each card.

## [0.3.4] - 2026-05-18
### Added
- **Rooms page — seasonal pricing**: Room cards now display the price for the applicable season based on today's date. If a season is active, the season name and base rate are shown below the price. The night picker modal also shows the season-adjusted rate and recalculates the estimated total based on the selected check-in date.
- **Rooms page — booking block**: Rooms marked as blocked in the POS show as "Unavailable" (greyscale, centred badge, no Enquire button). Independent of the occupied/stay status.

## [0.3.3] - 2026-05-18
### Changed
- **Rooms page** — occupied rooms remain fully bookable for future dates. Card shows an amber "Occupied until [date]" badge on the image but keeps the Enquire button active. The night picker modal locks the calendar to the checkout date of the current stay and shows a notice explaining the earliest available check-in.

## [0.3.2] - 2026-05-18
### Changed
- **Rooms page** — occupancy now syncs live from the POS `stays` slice in Firestore. A room shows "Occupied" (greyed out, greyscale image, no Enquire button) whenever there is an active check-in in the POS, matching the Occupied/Available logic on the POS Guestrooms page exactly. Removed the previous `stock === 0` workaround.

## [0.3.1] - 2026-05-18
### Added
- **Rooms page** — unavailable state when a room's stock is set to 0 in the POS. Card becomes greyed out, image converts to greyscale with a "Currently unavailable" overlay badge, price is muted, and the Enquire button is replaced with plain "Unavailable" text.

## [0.3.0] - 2026-05-18
### Added
- **Rooms page** — night picker modal when clicking "Enquire" on a room card. Includes a night counter (+/−), estimated total, check-in date calendar, and check-out date display. Navigates to the order form with `bookingDate`, `nights`, `checkOut`, and `estimatedTotal` in the query string.
- **Order page** — room enquiry summary now shows check-in date, check-out date, number of nights, and estimated total.

## [0.2.9] - 2026-05-14
### Fixed
- **Coworking page** — "Most popular" badge now correctly targets "Standup Desk + 27". Previous substring check (`'standup + 27'`) never matched the full name `'Standup Desk + 27'`; updated to check for both `'standup'` and `'27'` independently.

## [0.2.8] - 2026-05-14
### Changed
- **Coworking page** — Private Office card styled with Denz brand red gradient (`brand` → `brand-dark`), a small crown icon, white text, and a white CTA button with brand-red text. Visually distinct from regular desk cards with no label text on the badge.

## [0.2.7] - 2026-05-14
### Changed
- **Coworking page** — Private Office card now has a distinct VIP gold/amber gradient style with a crown "VIP Package" badge, white text, and a white CTA button with amber text. Distinguished visually as a premium package, separate from the regular "most popular" highlight logic.

## [0.2.6] - 2026-05-13
### Fixed
- **Coworking availability** — Hourly/daily bookings (and tabs with no end time) no longer mark a space as "full" on the weekly, monthly, or longer-term tabs. Multi-day views now only count bookings whose `bookingEndsAt` extends more than 24 hours ahead.

## [0.2.5] - 2026-05-13
### Added
- **Coworking booking** — All desk, office and equipment popups for weekly or longer periods now show a Mon–Fri working-days note (e.g. "Weekly pass = 5 working days", "Monthly pass covers all working days that month"). Hourly and daily bookings are unaffected.

## [0.2.4] - 2026-05-13
### Fixed
- **Coworking booking** — Private office on weekly (and any non-hourly) tab now shows the dedicated card popup instead of "Walk-in Hot Desk". Label reads "Dedicated Office", description is office-specific, subtitle reads "Book your private office".

## [0.2.3] - 2026-05-13
### Fixed
- **Coworking booking** — Equipment picker modal no longer overflows the screen. Calendar and time picker are now side by side (2-column time slots beside the calendar). Modal widens to `max-w-2xl` for equipment bookings and gets `overflow-y-auto max-h-[95vh]` as a safety net.

## [0.2.2] - 2026-05-13
### Added
- **TimePicker** — new `components/ui/TimePicker.tsx` component: a grid of 30-minute slot buttons styled to match the Calendar (same container, same `bg-ink text-white` selected state, hover states). Replaces the native `<input type="time">` on the coworking booking picker.

## [0.2.1] - 2026-05-13
### Fixed
- **Coworking booking** — Max hourly booking duration now derives from actual venue opening hours (13 hours for 10:00–23:30) instead of being hardcoded to 12
- **Coworking booking** — Start time now defaults to venue open time (10:00) and is hard-clamped so customers can't book past closing. Last valid start time updates dynamically with the selected hours (e.g. 1hr → 22:30, 2hr → 21:30). Typed values are clamped on input and on confirm.
