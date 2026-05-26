import { cookies } from 'next/headers';
import { createServerSupabase } from '@ward54/db/server';

/**
 * Returns an SSR Supabase client bound to the request's cookies.
 * Used in Server Components and Route Handlers.
 */
export function getSupabase() {
  return createServerSupabase(cookies());
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
