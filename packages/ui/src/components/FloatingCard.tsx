'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { hoverLift, cardRise } from './motion-variants';

export interface FloatingCardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  glow?: 'none' | 'amber' | 'green' | 'blue';
  /** When true, the card lifts on hover and reveals a soft shadow. */
  interactive?: boolean;
  /** Apply the rise-in entrance variant (used inside a staggerParent). */
  reveal?: boolean;
}

const glowMap = {
  none: 'shadow-card hover:shadow-card-hover',
  amber: 'shadow-neon-amber hover:shadow-[0_0_0_1px_rgba(232,148,90,0.35),0_18px_60px_rgba(232,148,90,0.28)]',
  green: 'shadow-neon-green hover:shadow-[0_0_0_1px_rgba(125,168,122,0.35),0_18px_60px_rgba(125,168,122,0.24)]',
  blue: 'shadow-neon-blue hover:shadow-[0_0_0_1px_rgba(122,168,216,0.35),0_18px_60px_rgba(122,168,216,0.24)]',
} as const;

/**
 * A glass card that floats and reacts to hover. The primary container
 * for everything visible to voters: polling stations, parts, volunteers.
 */
export const FloatingCard = forwardRef<HTMLDivElement, FloatingCardProps>(function FloatingCard(
  { glow = 'none', interactive = true, reveal = false, className, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      initial={reveal ? 'hidden' : undefined}
      whileInView={reveal ? 'visible' : undefined}
      viewport={reveal ? { once: true, margin: '-60px' } : undefined}
      variants={reveal ? cardRise : undefined}
      whileHover={interactive ? 'hover' : undefined}
      animate={interactive ? 'rest' : undefined}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-glass-border bg-glass-base backdrop-blur-glass transition-colors duration-300',
        'hover:border-glass-border-strong',
        glowMap[glow],
        className,
      )}
      {...rest}
    >
      {interactive && (
        <motion.div
          variants={hoverLift}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        />
      )}
      {/* Top sheen — Apple-style highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {children}
    </motion.div>
  );
});
