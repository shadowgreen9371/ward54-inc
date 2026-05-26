import { cookies } from 'next/headers';
import { createServerSupabase, createAdminSupabase } from '@ward54/db/server';

export function getSupabase() {
  return createServerSupabase(cookies());
}

/** Use ONLY inside Route Handlers that have already passed middleware auth. */
export function getServiceSupabase() {
  return createAdminSupabase();
}

export async function getCurrentAdmin() {
  const sb = getSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: adminRow } = await sb
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();
  return { user, admin: adminRow };
}
