# Changelog

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
