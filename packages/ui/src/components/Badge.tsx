import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Tone = 'neutral' | 'amber' | 'green' | 'blue' | 'cream' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-glass-base text-cream-300 border-glass-border',
  amber: 'bg-[rgba(232,148,90,0.10)] text-brand-saffron border-[rgba(232,148,90,0.25)]',
  green: 'bg-[rgba(125,168,122,0.10)] text-brand-green border-[rgba(125,168,122,0.25)]',
  blue: 'bg-[rgba(122,168,216,0.10)] text-[#7AA8D8] border-[rgba(122,168,216,0.25)]',
  cream: 'bg-cream-100 text-ink-base border-cream-100',
  danger: 'bg-[rgba(210,107,107,0.10)] text-[#D26B6B] border-[rgba(210,107,107,0.25)]',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', size = 'sm', dot = false, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border font-medium tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-pill bg-current" />}
      {children}
    </span>
  );
});
