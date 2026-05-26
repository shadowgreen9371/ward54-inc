'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { PollingStation } from '@ward54/db';
import { getCurrentAdmin, getSupabase } from '../supabase';
import { logActivity } from '../activity';

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const stationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only'),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional().default(''),
  building_photo_url: z.string().url().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  display_order: z.number().int().min(0),
  is_published: z.boolean(),
});

async function requireEditor() {
  const session = await getCurrentAdmin();
  if (!session?.admin) throw new Error('Unauthorised');
  if (!['super_admin', 'editor'].includes(session.admin.role)) {
    throw new Error('You need editor permissions to make changes.');
  }
  return session;
}

export async function upsertStation(input: PollingStation): Promise<Result<PollingStation>> {
  try {
    const session = await requireEditor();
    const parsed = stationSchema.parse(input);
    const sb = getSupabase();
    const { data, error } = await sb
      .from('polling_stations')
      .upsert(parsed, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) return { ok: false, error: error.message };
    await logActivity({
      action: 'upsert',
      entity_type: 'polling_station',
      entity_id: data.id,
      actor_email: session.user.email!,
      diff: { after: data },
    });
    revalidatePath('/stations');
    return { ok: true, data: data as PollingStation };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteStation(id: string): Promise<Result<true>> {
  try {
    const session = await requireEditor();
    const sb = getSupabase();
    const { error } = await sb.from('polling_stations').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logActivity({
      action: 'delete',
      entity_type: 'polling_station',
      entity_id: id,
      actor_email: session.user.email!,
    });
    revalidatePath('/stations');
    return { ok: true, data: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function togglePublished(id: string, value: boolean): Promise<Result<true>> {
  try {
    const session = await requireEditor();
    const sb = getSupabase();
    const { error } = await sb
      .from('polling_stations')
      .update({ is_published: value })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logActivity({
      action: value ? 'publish' : 'unpublish',
      entity_type: 'polling_station',
      entity_id: id,
      actor_email: session.user.email!,
    });
    revalidatePath('/stations');
    return { ok: true, data: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function reorderStations(
  items: { id: string; display_order: number }[],
): Promise<Result<true>> {
  try {
    const session = await requireEditor();
    const sb = getSupabase();
    // Run as individual updates to satisfy RLS — Postgres lacks a clean upsert-of-existing.
    const results = await Promise.all(
      items.map((it) =>
        sb.from('polling_stations').update({ display_order: it.display_order }).eq('id', it.id),
      ),
    );
    const firstError = results.find((r) => r.error);
    if (firstError?.error) return { ok: false, error: firstError.error.message };

    await logActivity({
      action: 'reorder',
      entity_type: 'polling_station',
      actor_email: session.user.email!,
      diff: { order: items },
    });
    revalidatePath('/stations');
    revalidatePath('/');
    return { ok: true, data: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
