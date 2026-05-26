'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAdmin, getSupabase } from '../supabase';
import { logActivity } from '../activity';

type Result = { ok: true } | { ok: false; error: string };

async function requireEditor() {
  const session = await getCurrentAdmin();
  if (!session?.admin) throw new Error('Unauthorised');
  if (!['super_admin', 'editor'].includes(session.admin.role)) {
    throw new Error('You need editor permissions.');
  }
  return session;
}

export async function saveDraft(key: string, value: unknown): Promise<Result> {
  try {
    const session = await requireEditor();
    const sb = getSupabase();
    const { error } = await sb
      .from('site_config')
      .upsert(
        { key, draft_value: value as object, value: {} as object },
        { onConflict: 'key', ignoreDuplicates: false },
      );
    if (error) return { ok: false, error: error.message };
    await logActivity({
      action: 'save_draft',
      entity_type: 'site_config',
      actor_email: session.user.email!,
      diff: { key },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function publishKey(key: string): Promise<Result> {
  try {
    const session = await requireEditor();
    const sb = getSupabase();
    const { data, error: readErr } = await sb
      .from('site_config')
      .select('draft_value')
      .eq('key', key)
      .single();
    if (readErr) return { ok: false, error: readErr.message };
    if (!data?.draft_value) return { ok: false, error: 'No draft to publish.' };

    const { error } = await sb
      .from('site_config')
      .update({
        value: data.draft_value,
        draft_value: null,
        published_at: new Date().toISOString(),
      })
      .eq('key', key);
    if (error) return { ok: false, error: error.message };

    await logActivity({
      action: 'publish',
      entity_type: 'site_config',
      actor_email: session.user.email!,
      diff: { key },
    });
    revalidatePath('/');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
