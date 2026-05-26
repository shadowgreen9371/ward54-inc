'use client';

import { motion } from 'framer-motion';
import { sectionReveal } from '@ward54/ui';

export function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionReveal}
      className="relative pt-6 sm:pt-10"
    >
      {/* Tiny eyebrow */}
      <div className="flex items-center gap-3">
        <span className="inline-flex h-6 items-center rounded-pill border border-brand-saffron/30 bg-[rgba(232,148,90,0.08)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-saffron">
          Ward · 54
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-400">
          163-Entally Assembly Constituency
        </span>
      </div>

      {/* Display title */}
      <h1 className="mt-5 max-w-[18ch] font-display text-[44px] leading-[0.98] tracking-tight text-cream-100 sm:text-[64px] md:text-[78px]">
        <span className="inline-block">
          Indian
          <br />
        </span>
        <span className="bg-gradient-to-r from-brand-saffron via-cream-100 to-brand-green bg-clip-text text-transparent">
          National Congress
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-cream-300 sm:text-[17px]">
        The official voter directory and field-operations platform for the Ward 54 unit.
        Search polling stations, browse part-wise rolls, and coordinate volunteers — built for
        the campaign, by the campaign.
      </p>

      {/* Sources strip */}
      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream-400">
          Source
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-glass-border bg-glass-soft px-2.5 py-1 text-[11px] text-cream-200">
          <span className="h-1.5 w-1.5 rounded-pill bg-brand-green" />
          Electoral Roll 2026 · S25 West Bengal
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-glass-border bg-glass-soft px-2.5 py-1 text-[11px] text-cream-200">
          Draft Roll Revision 1 · 16 Dec 2025
        </span>
      </div>
    </motion.section>
  );
}
