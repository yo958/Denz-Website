'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand text-white hover:bg-brand-dark active:scale-[0.98]': variant === 'primary',
            'border-2 border-ink text-ink hover:bg-ink hover:text-white active:scale-[0.98]': variant === 'outline',
            'text-ink-muted hover:text-ink hover:bg-surface-raised': variant === 'ghost',
            'bg-white text-ink hover:bg-surface-muted active:scale-[0.98] shadow-sm': variant === 'white',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
