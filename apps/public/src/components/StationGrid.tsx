'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ListOrdered, ChevronDown, Building2 } from 'lucide-react';
import {
  FloatingCard,
  SearchBar,
  StatPill,
  Badge,
  staggerParent,
  cardRise,
} from '@ward54/ui';
import type { StationWithCounts } from '@/lib/data';

interface Props {
  stations: StationWithCounts[];
}

export function StationGrid({ stations }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.parts.some((p) => p.section_text.toLowerCase().includes(q)),
    );
  }, [query, stations]);

  return (
    <>
      <SearchBar
        sticky
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search station name, address, or section…"
        aria-label="Search polling stations"
      />

      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="visible"
        className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-2"
      >
        {filtered.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <motion.div key={s.id} variants={cardRise}>
              <FloatingCard interactive={false} className="flex flex-col">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-glass-border bg-glass-soft text-cream-200">
                        <Building2 className="h-4.5 w-4.5" strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
                          Station · #{s.display_order.toString().padStart(2, '0')}
                        </div>
                        <h3 className="mt-0.5 truncate font-display text-[22px] leading-tight text-cream-100">
                          {s.name}
                        </h3>
                      </div>
                    </div>
                    <Badge tone="green" dot>
                      {s.parts.length} parts
                    </Badge>
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-cream-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cream-400" />
                    {s.address}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <StatPill label="Male" value={s.male_count.toLocaleString()} tone="male" />
                    <StatPill label="Female" value={s.female_count.toLocaleString()} tone="female" />
                    <StatPill label="Total" value={s.total_count.toLocaleString()} tone="total" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/parts?station=${s.slug}`}
                      className="inline-flex h-10 items-center gap-2 rounded-pill border border-glass-border bg-glass-base px-4 text-[13px] font-medium text-cream-100 transition-colors hover:border-glass-border-strong hover:bg-glass-raised"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                      View Parts
                    </Link>
                    {s.lat && s.lng && (
                      <a
                        href={`https://maps.google.com/?q=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-pill border border-glass-border bg-glass-soft px-4 text-[13px] font-medium text-cream-200 transition-colors hover:border-glass-border-strong hover:text-cream-100"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Map
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-pill px-3 text-[12px] font-medium text-cream-300 hover:text-cream-100"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? 'Collapse' : 'Show parts'}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-glass-border/60 bg-ink-900/40"
                  >
                    <ul className="divide-y divide-glass-border/40 px-5 sm:px-6">
                      {s.parts.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-3 text-[13px]"
                        >
                          <div className="min-w-0">
                            <div className="font-mono text-cream-100">
                              Part {p.part_number}
                            </div>
                            <div className="truncate text-cream-400">{p.section_text}</div>
                          </div>
                          <span className="font-mono text-[12px] tabular-nums text-cream-300">
                            {p.total_count.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </FloatingCard>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-lg border border-dashed border-glass-border bg-glass-soft p-12 text-center">
          <p className="text-[14px] text-cream-300">
            No stations match <span className="font-mono text-cream-100">{query}</span>
          </p>
        </div>
      )}
    </>
  );
}
