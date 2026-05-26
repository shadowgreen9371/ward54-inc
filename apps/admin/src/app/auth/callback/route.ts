import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabase } from '@ward54/db/server';
import { isAllowedAdminEmail } from '@/lib/admin-allowlist';

/**
 * Handles the magic-link callback. Exchanges the code, verifies allowlist,
 * then redirects to ?next= (default /).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const supabase = createServerSupabase(cookies());
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', req.url));
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=not_allowed', req.url));
  }

  // Upsert into admin_users (default role = viewer). Super admins must be
  // promoted manually in the DB.
  await supabase.from('admin_users').upsert(
    {
      id: data.user.id,
      email: data.user.email!,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );

  return NextResponse.redirect(new URL(next, req.url));
}
