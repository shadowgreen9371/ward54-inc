'use client';

import { motion } from 'framer-motion';
import { cn } from '../lib/cn';
import { sectionReveal } from './motion-variants';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Bloomberg-meets-Claude header. Tiny uppercase eyebrow, large serif display,
 * muted subtitle — used at the top of every page section.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <motion.header
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={sectionReveal}
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-saffron/80">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl leading-[1.05] text-cream-100 sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-[15px] leading-relaxed text-cream-300">{subtitle}</p>
      )}
    </motion.header>
  );
}
