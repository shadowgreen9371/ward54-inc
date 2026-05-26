'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { accordionExpand } from './motion-variants';

export interface AccordionCardProps {
  header: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * The collapsible card used on the Part-wise list. Header always visible
 * with a meta strip (M/F/Total stats); body expands smoothly.
 */
export function AccordionCard({
  header,
  meta,
  children,
  defaultOpen = false,
  className,
}: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-glass-border bg-glass-base/80 backdrop-blur-glass transition-colors',
        open ? 'border-glass-border-strong' : 'hover:border-glass-border-strong',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-glass-soft sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">{header}</div>
        {meta && <div className="hidden shrink-0 sm:block">{meta}</div>}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-glass-border text-cream-300"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      {/* Mobile: meta appears under header */}
      {meta && (
        <div className="border-t border-glass-border/50 px-5 py-3 sm:hidden">{meta}</div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={accordionExpand}
            className="overflow-hidden"
          >
            <div className="border-t border-glass-border/50 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
