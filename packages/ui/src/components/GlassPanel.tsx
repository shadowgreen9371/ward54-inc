'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'soft' | 'base' | 'raised';
  bordered?: boolean;
  /** Adds a soft neon-amber rim. Use sparingly for primary surfaces. */
  glow?: 'none' | 'amber' | 'green' | 'blue';
  inset?: boolean;
}

const toneClasses = {
  soft: 'bg-glass-soft',
  base: 'bg-glass-base',
  raised: 'bg-glass-raised',
} as const;

const glowClasses = {
  none: '',
  amber: 'shadow-neon-amber',
  green: 'shadow-neon-green',
  blue: 'shadow-neon-blue',
} as const;

/**
 * The base glassmorphism surface. Every floating card, modal, and panel
 * starts from here. Wraps children in a translucent blurred layer with
 * a hairline border.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  { tone = 'base', bordered = true, glow = 'none', inset = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-lg backdrop-blur-glass',
        toneClasses[tone],
        bordered && 'border border-glass-border',
        glowClasses[glow],
        inset && 'shadow-inner',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
