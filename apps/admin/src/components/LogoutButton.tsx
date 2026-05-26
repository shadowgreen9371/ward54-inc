'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button, cn } from '@ward54/ui';
import { createBrowserSupabase } from '@ward54/db/client';

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  async function logout() {
    const sb = createBrowserSupabase();
    await sb.auth.signOut();
    router.replace('/login');
    router.refresh();
  }
  if (compact) {
    return (
      <button
        onClick={logout}
        className="grid h-9 w-9 place-items-center rounded-pill border border-glass-border bg-glass-soft text-cream-200 hover:bg-glass-base hover:text-cream-100"
        aria-label="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    );
  }
  return (
    <Button
      variant="secondary"
      size="sm"
      full
      onClick={logout}
      iconLeft={<LogOut className="h-3.5 w-3.5" />}
    >
      Sign out
    </Button>
  );
}
