import { SectionHeader, FloatingCard, Badge } from '@ward54/ui';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const actionTone: Record<string, 'green' | 'amber' | 'danger' | 'blue' | 'neutral'> = {
  upsert: 'amber',
  insert: 'amber',
  update: 'amber',
  publish: 'green',
  unpublish: 'neutral',
  delete: 'danger',
  reorder: 'blue',
  save_draft: 'blue',
};

export default async function ActivityPage() {
  const sb = getSupabase();
  const { data: logs } = await sb
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <>
      <SectionHeader
        eyebrow="Audit"
        title="Activity log"
        subtitle="Every edit, publish, and delete is recorded with actor email and a diff."
      />
      <FloatingCard interactive={false} className="mt-8 overflow-hidden">
        <ul className="divide-y divide-glass-border/40">
          {(logs ?? []).map((l) => (
            <li key={l.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5 text-[13px]">
              <span className="font-mono text-[11px] tabular-nums text-cream-400">
                {new Date(l.created_at).toLocaleString()}
              </span>
              <Badge tone={actionTone[l.action] ?? 'neutral'}>{l.action}</Badge>
              <span className="font-mono text-cream-200">{l.entity_type}</span>
              <span className="text-cream-300">by</span>
              <span className="font-medium text-cream-100">{l.actor_email ?? 'unknown'}</span>
            </li>
          ))}
          {(!logs || logs.length === 0) && (
            <li className="px-5 py-10 text-center text-[13px] text-cream-400">
              No activity yet.
            </li>
          )}
        </ul>
      </FloatingCard>
    </>
  );
}
