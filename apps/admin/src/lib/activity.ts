'use server';

import { getSupabase } from './supabase';

interface LogInput {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  actor_email?: string | null;
  diff?: unknown;
}

/** Write to public.activity_logs. Best-effort — never throws to the caller. */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('activity_logs').insert({
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      actor_id: user?.id ?? null,
      actor_email: input.actor_email ?? user?.email ?? null,
      diff: (input.diff ?? {}) as object,
    });
  } catch (err) {
    console.error('logActivity:', (err as Error).message);
  }
}
