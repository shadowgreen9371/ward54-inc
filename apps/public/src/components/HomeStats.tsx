'use client';

import { motion } from 'framer-motion';
import { staggerParent, cardRise } from '@ward54/ui';

const stats = [
  { label: 'Total Electors', value: '26,849', sub: 'across the ward' },
  { label: 'Male / Female', value: '13,850 · 12,999', sub: 'M / F split' },
  { label: 'Polling Booths', value: '38', sub: 'in 12 buildings' },
  { label: 'Parliamentary Const.', value: '24', sub: 'Kolkata Uttar (Gen)' },
];

export function HomeStats() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerParent}
      className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      aria-label="Ward statistics"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={cardRise}
          className="relative overflow-hidden rounded-md border border-glass-border bg-glass-soft p-4 backdrop-blur-glass sm:p-5"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
            {s.label}
          </div>
          <div className="mt-2 font-mono text-lg tabular-nums leading-tight text-cream-100 sm:text-xl">
            {s.value}
          </div>
          <div className="mt-1 text-[11px] text-cream-300">{s.sub}</div>
        </motion.div>
      ))}
    </motion.section>
  );
}
