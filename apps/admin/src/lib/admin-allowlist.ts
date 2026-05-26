/**
 * Hard allowlist enforced by Next.js middleware on every admin request,
 * on top of Supabase JWT auth + the `admin_users.role` RLS check.
 *
 * Three layers of defence:
 *   1. Supabase auth — user must hold a valid session.
 *   2. This allowlist — middleware rejects anyone outside the list.
 *   3. RLS policies — DB rejects writes unless `admin_users.role` allows it.
 *
 * To add an admin: append their email here AND insert a row in
 * `public.admin_users` with the correct role.
 */
export const ADMIN_EMAIL_ALLOWLIST: readonly string[] = [
  'mdshakil43@gmail.com',
  'nepaligeetbazaar@gmail.com',
] as const;

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase().trim());
}
