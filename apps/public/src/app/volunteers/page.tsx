import type { Metadata } from 'next';
import { PageShell, SectionHeader } from '@ward54/ui';
import { listAgents, listParts, listStationsWithCounts } from '@/lib/data';
import { VolunteerOpsGrid } from '@/components/VolunteerOpsGrid';

export const metadata: Metadata = {
  title: 'Effective Agent & Responsibilities',
  description:
    'Operational rosters per part — Effective Leaders, PIC, and Polling Agents assigned to each polling booth.',
};

export default async function VolunteersPage() {
  const [agents, parts, stations] = await Promise.all([
    listAgents(),
    listParts(),
    listStationsWithCounts(),
  ]);

  // Build a per-part operational view
  const stationById = new Map(stations.map((s) => [s.id, s]));
  const rows = parts.map((p) => {
    const station = stationById.get(p.station_id);
    const partAgents = agents.filter((a) => a.part_id === p.id);
    return {
      part: p,
      station,
      leaders: partAgents.filter((a) => a.role === 'Effective Leader'),
      pic: partAgents.filter((a) => a.role === 'PIC'),
      pollingAgents: partAgents.filter((a) => a.role === 'Polling Agent'),
    };
  });

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Page 03 · Volunteer Information"
        title={
          <>
            Effective Agent &{' '}
            <span className="bg-gradient-to-r from-brand-saffron via-cream-100 to-brand-green bg-clip-text text-transparent">
              Responsibilities
            </span>
          </>
        }
        subtitle="Field operations roster — leaders, PIC, and polling agents assigned to each part. Tactical, minimal, mobile-friendly."
      />

      <VolunteerOpsGrid rows={rows} />
    </PageShell>
  );
}
