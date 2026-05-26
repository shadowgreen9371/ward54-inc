import { SectionHeader } from '@ward54/ui';
import { getSupabase } from '@/lib/supabase';
import { StationsManager } from '@/components/StationsManager';

export const dynamic = 'force-dynamic';

export default async function StationsAdminPage() {
  const sb = getSupabase();
  const { data: stations, error } = await sb
    .from('polling_stations')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;

  return (
    <>
      <SectionHeader
        eyebrow="CMS · Page 01"
        title="Polling Stations"
        subtitle="Add, edit, reorder, and publish polling stations. Drag the handle to reorder."
      />
      <div className="mt-8">
        <StationsManager initial={stations ?? []} />
      </div>
    </>
  );
}
