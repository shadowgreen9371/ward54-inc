import { SectionHeader, FloatingCard, Badge } from '@ward54/ui';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function VolunteersAdminPage() {
  const sb = getSupabase();
  const { data: agents } = await sb
    .from('agents')
    .select('*, parts(part_number), polling_stations(name)')
    .order('role')
    .order('agent_code');

  return (
    <>
      <SectionHeader
        eyebrow="CMS · Page 03"
        title="Volunteers & Agents"
        subtitle="Manage Effective Leaders, PIC, Polling Agents, and field volunteers. Assign per part."
      />
      <FloatingCard interactive={false} className="mt-8 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="border-b border-glass-border/60 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Part</th>
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {(agents ?? []).map((a) => (
              <tr key={a.id} className="hover:bg-glass-soft">
                <td className="px-4 py-3 font-mono text-cream-100">{a.agent_code}</td>
                <td className="px-4 py-3 text-cream-100">{a.name}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      a.role === 'Effective Leader'
                        ? 'amber'
                        : a.role === 'PIC'
                          ? 'blue'
                          : a.role === 'Polling Agent'
                            ? 'green'
                            : 'neutral'
                    }
                  >
                    {a.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-cream-200">
                  {/* @ts-expect-error nested */}
                  {a.parts?.part_number ?? '—'}
                </td>
                <td className="px-4 py-3 text-cream-200">
                  {/* @ts-expect-error nested */}
                  {a.polling_stations?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={a.status === 'active' ? 'green' : 'neutral'} dot>
                    {a.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FloatingCard>
    </>
  );
}
