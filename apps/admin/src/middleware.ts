import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedAdminEmail } from '@/lib/admin-allowlist';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/_next', '/favicon.ico', '/api/health'];

/**
 * Edge middleware — runs on every admin request.
 *
 * - Refreshes the Supabase session cookie.
 * - Rejects unauthenticated users (except on public paths).
 * - Enforces the hard email allowlist before any UI renders.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login + Next internals + auth callback through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options: CookieOptions) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect to /login
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Logged in but not on the allowlist → 403
  if (!isAllowedAdminEmail(user.email)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'not_allowed');
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets:
     *   - /_next/static (build assets)
     *   - /_next/image  (image optimization)
     *   - /favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
};
