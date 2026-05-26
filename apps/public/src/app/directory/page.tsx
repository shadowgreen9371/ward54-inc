import type { Metadata } from 'next';
import { PageShell, SectionHeader } from '@ward54/ui';
import { listStationsWithCounts } from '@/lib/data';
import { StationGrid } from '@/components/StationGrid';

export const metadata: Metadata = {
  title: 'Voter Directory',
  description:
    'All 12 polling-station buildings in Ward 54. Search by name or address, see voter counts, and jump to part-wise lists.',
};

export default async function DirectoryPage() {
  const stations = await listStationsWithCounts();
  const totals = stations.reduce(
    (a, s) => ({
      male: a.male + s.male_count,
      female: a.female + s.female_count,
      total: a.total + s.total_count,
    }),
    { male: 0, female: 0, total: 0 },
  );

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Page 01 · Voter Directory"
        title={
          <>
            Polling{' '}
            <span className="bg-gradient-to-r from-brand-saffron via-cream-100 to-brand-green bg-clip-text text-transparent">
              stations
            </span>
          </>
        }
        subtitle="Twelve buildings host 38 polling booths across the ward. Search by name or street to find your station, then open the part-wise list."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2.5 text-[12px]">
        <span className="rounded-pill border border-glass-border bg-glass-soft px-2.5 py-1 text-cream-200">
          <span className="font-mono tabular-nums text-cream-100">{stations.length}</span>{' '}
          <span className="text-cream-400">stations</span>
        </span>
        <span className="rounded-pill border border-glass-border bg-glass-soft px-2.5 py-1 text-cream-200">
          <span className="font-mono tabular-nums text-cream-100">{totals.total.toLocaleString()}</span>{' '}
          <span className="text-cream-400">total electors</span>
        </span>
        <span className="rounded-pill border border-[#7AA8D8]/30 bg-[rgba(122,168,216,0.06)] px-2.5 py-1 text-[#7AA8D8]">
          M · <span className="font-mono tabular-nums">{totals.male.toLocaleString()}</span>
        </span>
        <span className="rounded-pill border border-brand-saffron/30 bg-[rgba(232,148,90,0.06)] px-2.5 py-1 text-brand-saffron">
          F · <span className="font-mono tabular-nums">{totals.female.toLocaleString()}</span>
        </span>
      </div>

      <div className="mt-10">
        <StationGrid stations={stations} />
      </div>
    </PageShell>
  );
}
