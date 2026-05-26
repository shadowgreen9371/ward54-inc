import type { Metadata } from 'next';
import { PageShell, SectionHeader } from '@ward54/ui';
import { listParts, listStationsWithCounts } from '@/lib/data';
import { PartsList } from '@/components/PartsList';

export const metadata: Metadata = {
  title: 'Part-wise List',
  description:
    'All 38 parts of Ward 54 with road names, premises ranges, and per-booth totals.',
};

interface PageProps {
  searchParams: { station?: string };
}

export default async function PartsPage({ searchParams }: PageProps) {
  const [parts, stations] = await Promise.all([listParts(), listStationsWithCounts()]);
  const stationMap = new Map(stations.map((s) => [s.id, s]));

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Page 02 · Parts Database"
        title={
          <>
            All{' '}
            <span className="bg-gradient-to-r from-brand-saffron via-cream-100 to-brand-green bg-clip-text text-transparent">
              38 parts
            </span>
          </>
        }
        subtitle="Premium digital voter list — road names, premises ranges, locality and M/F/Total counts per part. Tap any card to expand."
      />

      <PartsList
        parts={parts}
        stationMap={Object.fromEntries(stationMap.entries())}
        initialStation={searchParams.station ?? null}
      />
    </PageShell>
  );
}
