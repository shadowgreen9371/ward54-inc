'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AccordionCard, SearchBar, Badge, StatPill, cn } from '@ward54/ui';
import type { Part } from '@ward54/db';
import type { StationWithCounts } from '@/lib/data';

interface Props {
  parts: Part[];
  stationMap: Record<string, StationWithCounts>;
  initialStation: string | null;
}

export function PartsList({ parts, stationMap, initialStation }: Props) {
  const [query, setQuery] = useState('');
  const [stationFilter, setStationFilter] = useState<string | null>(initialStation);

  const stations = useMemo(() => Object.values(stationMap), [stationMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts.filter((p) => {
      const station = stationMap[p.station_id];
      if (stationFilter && station?.slug !== stationFilter) return false;
      if (!q) return true;
      return (
        String(p.part_number).includes(q) ||
        p.section_text.toLowerCase().includes(q) ||
        p.road_names.some((r) => r.toLowerCase().includes(q)) ||
        (p.premises_range ?? '').toLowerCase().includes(q) ||
        (p.locality ?? '').toLowerCase().includes(q)
      );
    });
  }, [parts, query, stationFilter, stationMap]);

  return (
    <div className="mt-8">
      <SearchBar
        sticky
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search part #, road, premises, locality…"
        aria-label="Search parts"
      />

      {/* Station filter chips */}
      <div className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setStationFilter(null)}
          className={cn(
            'shrink-0 rounded-pill border px-3 py-1.5 text-[12px] font-medium transition-colors',
            stationFilter === null
              ? 'border-glass-border-strong bg-glass-raised text-cream-100'
              : 'border-glass-border bg-glass-soft text-cream-300 hover:text-cream-100',
          )}
        >
          All stations · {parts.length}
        </button>
        {stations.map((s) => (
          <button
            key={s.id}
            onClick={() => setStationFilter(s.slug)}
            className={cn(
              'shrink-0 rounded-pill border px-3 py-1.5 text-[12px] font-medium transition-colors',
              stationFilter === s.slug
                ? 'border-glass-border-strong bg-glass-raised text-cream-100'
                : 'border-glass-border bg-glass-soft text-cream-300 hover:text-cream-100',
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="mt-6 flex flex-col gap-3"
      >
        {filtered.map((p, idx) => {
          const station = stationMap[p.station_id];
          return (
            <AccordionCard
              key={p.id}
              defaultOpen={idx === 0 && !!initialStation}
              header={
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-glass-border bg-glass-soft font-mono text-[15px] tabular-nums text-cream-100">
                    {String(p.part_number).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
                      Part · {p.part_number}
                    </div>
                    <div className="mt-0.5 truncate font-display text-[19px] leading-tight text-cream-100 sm:text-[21px]">
                      {station?.name ?? 'Polling station'}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-cream-300">
                      {p.locality ?? p.section_text}
                    </div>
                  </div>
                </div>
              }
              meta={
                <div className="flex items-center gap-3">
                  <Badge tone="blue" dot>
                    M · {p.male_count.toLocaleString()}
                  </Badge>
                  <Badge tone="amber" dot>
                    F · {p.female_count.toLocaleString()}
                  </Badge>
                  <Badge tone="green" dot>
                    Σ {p.total_count.toLocaleString()}
                  </Badge>
                </div>
              }
            >
              <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">
                <div className="space-y-4">
                  <Detail label="Section">
                    <p className="font-mono text-[13px] leading-relaxed text-cream-200">
                      {p.section_text}
                    </p>
                  </Detail>
                  {p.road_names.length > 0 && (
                    <Detail label="Road names">
                      <div className="flex flex-wrap gap-1.5">
                        {p.road_names.map((r) => (
                          <span
                            key={r}
                            className="rounded-pill border border-glass-border bg-glass-soft px-2.5 py-1 text-[12px] text-cream-200"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </Detail>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {p.premises_range && (
                      <Detail label="Premises range">
                        <span className="font-mono text-[13px] text-cream-100">
                          {p.premises_range}
                        </span>
                      </Detail>
                    )}
                    {p.locality && (
                      <Detail label="Locality">
                        <span className="text-[13px] text-cream-100">{p.locality}</span>
                      </Detail>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 self-start sm:w-[260px]">
                  <StatPill label="Male" value={p.male_count.toLocaleString()} tone="male" />
                  <StatPill
                    label="Female"
                    value={p.female_count.toLocaleString()}
                    tone="female"
                  />
                  <StatPill label="Total" value={p.total_count.toLocaleString()} tone="total" />
                </div>
              </div>
            </AccordionCard>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-lg border border-dashed border-glass-border bg-glass-soft p-12 text-center">
          <p className="text-[14px] text-cream-300">No parts match these filters.</p>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
