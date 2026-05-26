'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'amber' | 'green' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  full?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-cream-100 text-ink-base hover:bg-white shadow-[0_8px_24px_rgba(245,239,230,0.18)] hover:shadow-[0_14px_32px_rgba(245,239,230,0.28)]',
  secondary:
    'bg-glass-raised text-cream-100 border border-glass-border hover:bg-glass-base hover:border-glass-border-strong',
  ghost: 'bg-transparent text-cream-200 hover:bg-glass-soft hover:text-cream-100',
  amber:
    'bg-gradient-to-b from-brand-saffron to-[#D27F4A] text-ink-base shadow-neon-amber hover:from-[#F0A06B] hover:to-brand-saffron',
  green:
    'bg-gradient-to-b from-brand-green to-[#5F8E5C] text-ink-base shadow-neon-green hover:from-[#90B98C] hover:to-brand-green',
  destructive:
    'bg-[#3A1F1F] text-[#E89696] border border-[#5C2A2A] hover:bg-[#4A2424] hover:border-[#7A3636]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] rounded-md gap-2',
  lg: 'h-14 px-7 text-base rounded-md gap-2.5',
};

/** Premium button with subtle motion. Default size is md. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    loading = false,
    full = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium tracking-tight transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-100 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-base',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-pill border-2 border-current border-t-transparent" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
});
