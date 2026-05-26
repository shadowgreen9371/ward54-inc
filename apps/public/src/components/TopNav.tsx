'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@ward54/ui';

const items = [
  { href: '/', label: 'Home' },
  { href: '/directory', label: 'Voter Directory' },
  { href: '/parts', label: 'Part-wise List' },
  { href: '/volunteers', label: 'Volunteers' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 -z-10 bg-ink-base/70 backdrop-blur-heavy" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px tricolour-rule opacity-40" />
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3 sm:px-8 sm:py-4 lg:px-10">
        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-pill border border-glass-border-strong bg-glass-raised">
            <span className="animate-inc-spin font-display text-[15px] font-medium text-cream-100">
              54
            </span>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-400">
              Ward · 54
            </span>
            <span className="font-display text-[15px] text-cream-100">
              Indian National Congress
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative inline-flex h-9 items-center rounded-pill px-3.5 text-[13px] font-medium tracking-tight transition-colors',
                    active
                      ? 'text-cream-100'
                      : 'text-cream-300 hover:text-cream-100',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 -z-10 rounded-pill bg-glass-raised border border-glass-border"
                      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu trigger — minimal, the nav scrolls horizontally on small */}
        <div className="md:hidden">
          <Link
            href="/directory"
            className="inline-flex h-9 items-center rounded-pill border border-glass-border bg-glass-base px-3.5 text-[12px] font-medium text-cream-100"
          >
            Directory
          </Link>
        </div>
      </nav>

      {/* Mobile secondary scroller */}
      <div className="md:hidden">
        <div className="mx-auto flex max-w-[1180px] gap-1.5 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-pill border px-3 py-1.5 text-[12px] font-medium tracking-tight transition-colors',
                  active
                    ? 'border-glass-border-strong bg-glass-raised text-cream-100'
                    : 'border-glass-border bg-glass-soft text-cream-300',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
