import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  MapPinned,
  ListOrdered,
  Users,
  Sliders,
  ScrollText,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { getCurrentAdmin } from '@/lib/supabase';
import { LogoutButton } from '@/components/LogoutButton';

const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/stations', label: 'Polling Stations', icon: MapPinned },
  { href: '/parts', label: 'Parts', icon: ListOrdered },
  { href: '/volunteers', label: 'Volunteers', icon: Users },
  { href: '/homepage', label: 'Homepage CMS', icon: Sliders },
  { href: '/activity', label: 'Activity Log', icon: ScrollText },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentAdmin();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-ink-base text-cream-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-glass-border bg-ink-900/60 backdrop-blur-glass lg:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <span className="grid h-9 w-9 place-items-center rounded-pill border border-glass-border-strong bg-glass-raised text-brand-saffron">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-saffron">
                Admin · Ward 54
              </div>
              <div className="font-display text-[15px] text-cream-100">Operations Console</div>
            </div>
          </div>

          <nav className="mt-3 flex-1 space-y-0.5 px-3">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-cream-300 transition-colors hover:bg-glass-soft hover:text-cream-100"
              >
                <Icon className="h-4 w-4 text-cream-400 group-hover:text-cream-100" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-glass-border/60 p-4">
            <div className="mb-3 rounded-sm border border-glass-border bg-glass-soft px-3 py-2.5 text-[11px]">
              <div className="text-cream-400">Signed in as</div>
              <div className="mt-0.5 truncate font-mono text-cream-100">
                {session.user.email}
              </div>
              {session.admin && (
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-saffron">
                  {session.admin.role}
                </div>
              )}
            </div>
            <LogoutButton />
          </div>
        </aside>

        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-glass-border bg-ink-900/80 px-4 py-3 backdrop-blur-heavy lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-pill border border-glass-border-strong bg-glass-raised text-brand-saffron">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-[14px] text-cream-100">Admin Console</span>
          </Link>
          <LogoutButton compact />
        </header>

        {/* Main */}
        <main className="relative min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
