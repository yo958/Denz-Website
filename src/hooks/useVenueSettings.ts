'use client';

import { useFirestoreSlice } from './useFirestoreSlice';
import type { DayHours, DayOfWeek, SiteSettings } from '@/types';

export const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const FALLBACK_SETTINGS: SiteSettings = {
  venue: {
    timezone: 'Asia/Bangkok',
    openingHours: {
      monday:    { open: '10:00', close: '23:30', closed: false },
      tuesday:   { open: '10:00', close: '23:30', closed: false },
      wednesday: { open: '10:00', close: '23:30', closed: false },
      thursday:  { open: '10:00', close: '23:30', closed: false },
      friday:    { open: '10:00', close: '23:30', closed: false },
      saturday:  { open: '10:00', close: '23:30', closed: false },
      sunday:    { open: '10:00', close: '23:30', closed: false },
    },
  },
};

export function useVenueSettings() {
  const { data } = useFirestoreSlice<SiteSettings>('settings', FALLBACK_SETTINGS);
  return data;
}

/** Format a single day's hours as "10:00 – 23:30" or "Closed". */
export function formatDayHours(h: DayHours): string {
  if (h.closed) return 'Closed';
  return `${h.open} – ${h.close}`;
}

/**
 * Collapse consecutive days with identical hours into ranges.
 * Returns an array of display strings like "Mon – Fri: 10:00 – 23:30".
 */
export function formatOpeningHours(hours: Record<DayOfWeek, DayHours>): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < DAYS_ORDER.length) {
    const day = DAYS_ORDER[i];
    const h = hours[day];
    const hoursStr = formatDayHours(h);
    let j = i + 1;
    while (j < DAYS_ORDER.length) {
      const next = hours[DAYS_ORDER[j]];
      if (formatDayHours(next) === hoursStr) j++;
      else break;
    }
    const label = j - i > 1
      ? `${DAY_SHORT[DAYS_ORDER[i]]} – ${DAY_SHORT[DAYS_ORDER[j - 1]]}`
      : DAY_SHORT[day];
    result.push(`${label}: ${hoursStr}`);
    i = j;
  }
  return result;
}

/** Get today's hours string using the venue's timezone. */
export function getTodayHours(settings: SiteSettings): string {
  const hours = settings.venue.openingHours;
  if (!hours) return '10:00 – 23:30';
  const tz = settings.venue.timezone ?? 'Asia/Bangkok';
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: tz })
    .format(new Date())
    .toLowerCase() as DayOfWeek;
  const h = hours[dayName];
  if (!h) return '10:00 – 23:30';
  return formatDayHours(h);
}
