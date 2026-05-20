# Changelog

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
