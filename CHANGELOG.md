# Changelog

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
