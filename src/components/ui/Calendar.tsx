'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toDateValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns grid of Date | null for a given month, padded to Mon-start weeks
function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // Monday = 0 offset, Sunday = 6
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarProps {
  value: string;              // 'YYYY-MM-DD'
  minDate?: string;           // 'YYYY-MM-DD', defaults to today
  onChange: (value: string) => void;
  disableWeekends?: boolean;  // if true, Sat & Sun are not selectable
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay(); // 0 = Sun, 6 = Sat
  return dow === 0 || dow === 6;
}

// Advance a date forward past weekends (used to skip initial value onto a weekday)
function nextWeekday(d: Date): Date {
  const r = new Date(d);
  while (isWeekend(r)) r.setDate(r.getDate() + 1);
  return r;
}

export function Calendar({ value, minDate, onChange, disableWeekends }: CalendarProps) {
  const today = startOfDay(new Date());
  const rawMin = minDate ? startOfDay(new Date(minDate + 'T00:00:00')) : today;
  // If weekends are disabled and rawMin lands on a weekend, advance to Monday
  const min = disableWeekends ? nextWeekday(rawMin) : rawMin;

  const selected = value ? startOfDay(new Date(value + 'T00:00:00')) : null;
  const initial = selected && selected >= min ? selected : min;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Disable prev if the previous month is entirely before min
  const firstOfView = new Date(viewYear, viewMonth, 1);
  const canGoPrev = new Date(viewYear, viewMonth, 0) >= min; // last day of prev month

  const grid = buildGrid(viewYear, viewMonth);

  return (
    <div className="rounded-2xl border border-ink-faint/30 bg-white p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-ink">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface-raised hover:text-ink transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-semibold py-1 ${disableWeekends && i >= 5 ? 'text-ink-faint/50' : 'text-ink-muted'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {grid.map((date, i) => {
          if (!date) return <div key={i} />;
          const isPast = startOfDay(date) < min;
          const isWknd = disableWeekends && isWeekend(date);
          const isDisabled = isPast || isWknd;
          const isToday = isSameDay(date, today);
          const isSelected = selected ? isSameDay(date, selected) : false;
          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(toDateValue(date))}
              title={isWknd ? 'Not available on weekends' : undefined}
              className={`
                mx-auto w-9 h-9 rounded-full text-sm font-medium transition-colors
                ${isDisabled ? 'text-ink-faint cursor-not-allowed opacity-40' : 'cursor-pointer'}
                ${isSelected && !isDisabled
                  ? 'bg-ink text-white'
                  : isToday && !isDisabled
                  ? 'ring-1 ring-brand text-ink hover:bg-surface-raised'
                  : !isDisabled
                  ? 'text-ink hover:bg-surface-raised'
                  : ''
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Friendly display string for a 'YYYY-MM-DD' value
export function formatBookingDate(value: string): string {
  if (!value) return '';
  const d = new Date(value + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
