import Link from 'next/link';
import {
  MapPinned,
  ListOrdered,
  Users,
  Sliders,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { Badge, FloatingCard, SectionHeader } from '@ward54/ui';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const sb = getSupabase();
  const [
    { count: stations },
    { count: parts },
    { count: voters },
    { count: agents },
    { count: drafts },
    { data: recent },
  ] = await Promise.all([
    sb.from('polling_stations').select('id', { count: 'exact', head: true }),
    sb.from('parts').select('id', { count: 'exact', head: true }),
    sb.from('voters').select('id', { count: 'exact', head: true }),
    sb.from('agents').select('id', { count: 'exact', head: true }),
    sb
      .from('parts')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', false),
    sb
      .from('activity_logs')
      .select('id, action, entity_type, actor_email, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const tiles = [
    {
      label: 'Polling Stations',
      value: stations ?? 0,
      href: '/stations',
      icon: MapPinned,
      tone: 'amber' as const,
    },
    {
      label: 'Parts',
      value: parts ?? 0,
      href: '/parts',
      icon: ListOrdered,
      tone: 'green' as const,
    },
    {
      label: 'Voters',
      value: voters ?? 0,
      href: '/voters',
      icon: ListOrdered,
      tone: 'blue' as const,
    },
    {
      label: 'Volunteers',
      value: agents ?? 0,
      href: '/volunteers',
      icon: Users,
      tone: 'cream' as const,
    },
  ];

  return (
    <>
      <SectionHeader
        eyebrow="Operations Console"
        title="Overview"
        subtitle="Live counts pulled from Supabase. Use the sidebar to drill into each domain."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="group">
            <FloatingCard className="p-5" reveal>
              <div className="flex items-start justify-between">
                <Badge tone={tone}>{label}</Badge>
                <ArrowUpRight className="h-4 w-4 text-cream-400 transition-transform group-hover:translate-x-0.5 group-hover:text-cream-100" />
              </div>
              <div className="mt-4 font-mono text-3xl tabular-nums leading-none text-cream-100">
                {value.toLocaleString()}
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-[11px] text-cream-300">
                <Icon className="h-3 w-3" />
                Manage {label.toLowerCase()}
              </div>
            </FloatingCard>
          </Link>
        ))}
      </section>

      {(drafts ?? 0) > 0 && (
        <FloatingCard
          glow="amber"
          interactive={false}
          className="mt-8 flex items-center gap-3 p-5"
        >
          <AlertTriangle className="h-5 w-5 text-brand-saffron" />
          <div className="flex-1 text-[13px] text-cream-200">
            <strong className="text-cream-100">{drafts}</strong> unpublished part
            {(drafts ?? 0) === 1 ? '' : 's'} — drafts are not visible to the public.
          </div>
          <Link
            href="/parts?filter=draft"
            className="rounded-pill border border-glass-border bg-glass-soft px-3 py-1.5 text-[12px] font-medium text-cream-100 hover:border-glass-border-strong"
          >
            Review drafts
          </Link>
        </FloatingCard>
      )}

      <section className="mt-10">
        <SectionHeader title="Recent activity" eyebrow="Audit log" />
        <FloatingCard interactive={false} className="mt-5">
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-glass-border/50">
              {recent.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5 text-[13px]"
                >
                  <span className="font-mono text-[11px] tabular-nums text-cream-400">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                  <span className="text-cream-100">
                    <strong className="font-medium">{row.actor_email}</strong>{' '}
                    <span className="text-cream-300">{row.action}</span>{' '}
                    <span className="font-mono text-cream-400">{row.entity_type}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center text-[13px] text-cream-400">
              No activity yet. Any change you make will show up here.
            </div>
          )}
        </FloatingCard>
      </section>
    </>
  );
}
