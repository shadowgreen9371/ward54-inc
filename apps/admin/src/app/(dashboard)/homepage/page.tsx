import { SectionHeader, FloatingCard } from '@ward54/ui';
import { getSupabase } from '@/lib/supabase';
import { HomepageCMS } from '@/components/HomepageCMS';

export const dynamic = 'force-dynamic';

export default async function HomepageCMSPage() {
  const sb = getSupabase();
  const { data: config } = await sb
    .from('site_config')
    .select('*')
    .in('key', ['homepage.hero', 'homepage.cards', 'ward.meta']);

  const byKey = Object.fromEntries((config ?? []).map((c) => [c.key, c]));

  return (
    <>
      <SectionHeader
        eyebrow="CMS · Homepage"
        title="Homepage editor"
        subtitle="Edit titles, subtitles, ward stats, and home cards. Draft → Publish workflow."
      />
      <div className="mt-8">
        <HomepageCMS
          hero={byKey['homepage.hero'] ?? null}
          cards={byKey['homepage.cards'] ?? null}
          meta={byKey['ward.meta'] ?? null}
        />
      </div>
    </>
  );
}
