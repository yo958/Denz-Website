'use client';

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatSlot(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

interface TimePickerProps {
  value: string;     // 'HH:MM'
  min: string;       // 'HH:MM' — earliest selectable slot
  max: string;       // 'HH:MM' — latest selectable slot
  step?: number;     // minutes between slots, default 30
  columns?: number;  // grid columns, default 4
  className?: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, min, max, step = 30, columns = 4, className = '', onChange }: TimePickerProps) {
  const minMins = timeToMinutes(min);
  const maxMins = timeToMinutes(max);

  const slots: string[] = [];
  for (let m = minMins; m <= maxMins; m += step) {
    slots.push(minutesToTime(m));
  }

  if (slots.length === 0) return null;

  // Ensure current value is within range; snap to first slot if not
  const effectiveValue = slots.includes(value) ? value : slots[0];

  return (
    <div className={`rounded-2xl border border-ink-faint/30 bg-white p-4 select-none ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-3">
        Start time
      </p>
      <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {slots.map((slot) => {
          const isSelected = slot === effectiveValue;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              className={`
                h-9 rounded-full text-xs font-medium transition-colors cursor-pointer
                ${isSelected
                  ? 'bg-ink text-white'
                  : 'text-ink hover:bg-surface-raised'
                }
              `}
            >
              {formatSlot(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
