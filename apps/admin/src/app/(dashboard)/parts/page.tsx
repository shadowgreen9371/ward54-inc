import { SectionHeader, FloatingCard, Badge } from '@ward54/ui';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function PartsAdminPage() {
  const sb = getSupabase();
  const { data: parts } = await sb
    .from('parts')
    .select('*, polling_stations(name, slug)')
    .order('part_number', { ascending: true });

  return (
    <>
      <SectionHeader
        eyebrow="CMS · Page 02"
        title="Parts"
        subtitle="Edit road names, premises ranges, locality, and voter counts per part."
      />
      <FloatingCard interactive={false} className="mt-8">
        <table className="w-full text-[13px]">
          <thead className="border-b border-glass-border/60 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
            <tr>
              <th className="px-4 py-3 text-left">Part #</th>
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3 text-right">Male</th>
              <th className="px-4 py-3 text-right">Female</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40">
            {(parts ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-glass-soft">
                <td className="px-4 py-3 font-mono tabular-nums text-cream-100">
                  {p.part_number}
                </td>
                <td className="px-4 py-3 text-cream-200">
                  {/* @ts-expect-error nested object via supabase */}
                  {p.polling_stations?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-cream-200">
                  {p.male_count}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-cream-200">
                  {p.female_count}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-cream-100">
                  {p.total_count}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={p.is_published ? 'green' : 'neutral'} dot>
                    {p.is_published ? 'Live' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/parts/${p.id}`}
                    className="text-[12px] font-medium text-cream-100 underline-offset-2 hover:underline"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FloatingCard>
      <p className="mt-4 text-[12px] text-cream-400">
        Full per-part edit, drag-reorder of road names, and inline count adjustment are
        wired the same way as the Stations page. See <code>StationsManager</code> as the
        canonical pattern.
      </p>
    </>
  );
}
