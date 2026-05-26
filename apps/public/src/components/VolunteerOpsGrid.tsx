'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, Eye } from 'lucide-react';
import type { Agent, Part } from '@ward54/db';
import {
  FloatingCard,
  SearchBar,
  Badge,
  LeaderBadge,
  staggerParent,
  cardRise,
} from '@ward54/ui';
import type { StationWithCounts } from '@/lib/data';

interface Row {
  part: Part;
  station: StationWithCounts | undefined;
  leaders: Agent[];
  pic: Agent[];
  pollingAgents: Agent[];
}

export function VolunteerOpsGrid({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.part.part_number).includes(q) ||
        r.station?.name.toLowerCase().includes(q) ||
        r.leaders.some((a) => a.name.toLowerCase().includes(q)) ||
        r.pic.some((a) => a.name.toLowerCase().includes(q)) ||
        r.pollingAgents.some((a) => a.name.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="mt-8">
      <SearchBar
        sticky
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search by part #, station, or volunteer name…"
        aria-label="Search volunteer roster"
      />

      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="visible"
        className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-2"
      >
        {filtered.map((row) => (
          <motion.div key={row.part.id} variants={cardRise}>
            <FloatingCard interactive className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-glass-border bg-glass-soft font-mono text-[15px] tabular-nums text-cream-100">
                    {String(row.part.part_number).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
                      Part · {row.part.part_number}
                    </div>
                    <div className="truncate font-display text-[19px] leading-tight text-cream-100">
                      {row.station?.name ?? 'Polling station'}
                    </div>
                    {row.part.premises_range && (
                      <div className="mt-0.5 truncate font-mono text-[11px] text-cream-300">
                        Premises {row.part.premises_range}
                      </div>
                    )}
                  </div>
                </div>
                <Badge tone="cream">
                  Σ {row.part.total_count.toLocaleString()}
                </Badge>
              </div>

              {/* Effective Leaders */}
              <OpsBlock
                icon={<Crown className="h-3.5 w-3.5" />}
                label="Effective Leaders"
                tone="amber"
                agents={row.leaders}
              />

              {/* PIC */}
              <OpsBlock
                icon={<Shield className="h-3.5 w-3.5" />}
                label="PIC"
                tone="blue"
                agents={row.pic}
              />

              {/* Polling Agents */}
              <OpsBlock
                icon={<Eye className="h-3.5 w-3.5" />}
                label="Polling Agents"
                tone="green"
                agents={row.pollingAgents}
              />
            </FloatingCard>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-lg border border-dashed border-glass-border bg-glass-soft p-12 text-center">
          <p className="text-[14px] text-cream-300">No volunteers match this search.</p>
        </div>
      )}
    </div>
  );
}

function OpsBlock({
  icon,
  label,
  tone,
  agents,
}: {
  icon: React.ReactNode;
  label: string;
  tone: 'amber' | 'blue' | 'green';
  agents: Agent[];
}) {
  return (
    <div className="mt-5 first:mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-300">
          <span
            className={
              tone === 'amber'
                ? 'text-brand-saffron'
                : tone === 'blue'
                  ? 'text-[#7AA8D8]'
                  : 'text-brand-green'
            }
          >
            {icon}
          </span>
          {label}
        </span>
        <Badge tone={tone}>{agents.length}</Badge>
      </div>
      {agents.length === 0 ? (
        <div className="rounded-sm border border-dashed border-glass-border/60 bg-glass-soft/40 px-3 py-2.5 text-[12px] text-cream-400">
          No {label.toLowerCase()} assigned yet.
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {agents.map((a) => (
            <LeaderBadge
              key={a.id}
              name={a.name}
              role={a.agent_code}
              photoUrl={a.photo_url}
              phone={a.phone}
              size="sm"
              className="rounded-md border border-glass-border bg-glass-soft/60 px-3 py-2"
            />
          ))}
        </div>
      )}
    </div>
  );
}
