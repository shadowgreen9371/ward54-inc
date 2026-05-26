'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { pageTransition } from './motion-variants';

export interface PageShellProps {
  children: ReactNode;
  /** Adds the ambient radial glow that drifts behind hero content. */
  ambient?: boolean;
  className?: string;
}

/**
 * Top-level page wrapper. Provides the cinematic fade-in, the ambient
 * radial backdrop, and the safe max-width container Apple/Bloomberg use.
 */
export function PageShell({ children, ambient = true, className }: PageShellProps) {
  return (
    <motion.main
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageTransition}
      className={cn('relative min-h-screen overflow-x-hidden bg-ink-base text-cream-100', className)}
    >
      {ambient && (
        <>
          {/* Ambient saffron glow, top-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-[-20%] h-[640px] w-[640px] rounded-pill bg-brand-saffron/12 blur-[140px]"
          />
          {/* Ambient INC blue glow, bottom-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-[-30%] h-[720px] w-[720px] rounded-pill bg-brand-inc/10 blur-[160px]"
          />
          {/* Faint cream highlight along center */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-pill bg-cream-100/[0.025] blur-[120px]"
          />
        </>
      )}
      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        {children}
      </div>
    </motion.main>
  );
}
