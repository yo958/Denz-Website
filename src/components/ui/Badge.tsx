import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'muted' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'brand', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        {
          'bg-brand/10 text-brand': variant === 'brand',
          'bg-surface-raised text-ink-muted': variant === 'muted',
          'border border-ink-faint text-ink-muted': variant === 'outline',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
