import Link from 'next/link';
import { ArrowRight, MapPin, ListOrdered, Users } from 'lucide-react';
import {
  FloatingCard,
  PageShell,
  Badge,
  cn,
} from '@ward54/ui';
import { Hero } from '@/components/Hero';
import { HomeStats } from '@/components/HomeStats';

interface HomeCard {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  glow: 'amber' | 'green' | 'blue';
  accent: string;
}

const cards: HomeCard[] = [
  {
    href: '/directory',
    eyebrow: 'PAGE 01',
    title: 'Enter Voter Directory',
    description:
      '12 polling station buildings · 38 booths · live search by location or part.',
    icon: MapPin,
    glow: 'amber',
    accent: 'from-brand-saffron/30 to-transparent',
  },
  {
    href: '/parts',
    eyebrow: 'PAGE 02',
    title: 'All Parts Database',
    description:
      'Part-wise list with road names, premises ranges, and per-booth totals — premium digital roll.',
    icon: ListOrdered,
    glow: 'green',
    accent: 'from-brand-green/25 to-transparent',
  },
  {
    href: '/volunteers',
    eyebrow: 'PAGE 03',
    title: 'Effective Agent & Responsibilities',
    description:
      'Operational rosters: Effective Leaders, PIC, Polling Agents — assigned per part.',
    icon: Users,
    glow: 'blue',
    accent: 'from-brand-inc/30 to-transparent',
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <HomeStats />

      <section className="mt-14 grid gap-5 sm:gap-6 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group focus-visible:outline-none"
              aria-label={card.title}
            >
              <FloatingCard
                glow={card.glow}
                reveal
                className="flex h-full flex-col gap-7 p-6 sm:p-7"
              >
                {/* Accent corner wash */}
                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-pill bg-gradient-to-br blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100',
                    card.accent,
                  )}
                />

                <div className="relative flex items-start justify-between">
                  <Badge tone={card.glow === 'amber' ? 'amber' : card.glow === 'green' ? 'green' : 'blue'} dot>
                    {card.eyebrow}
                  </Badge>
                  <span className="grid h-11 w-11 place-items-center rounded-md border border-glass-border bg-glass-soft text-cream-200 transition-colors group-hover:border-glass-border-strong group-hover:text-cream-100">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col gap-3">
                  <h3 className="font-display text-[26px] leading-[1.1] text-cream-100 sm:text-[28px]">
                    {card.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-cream-300">
                    {card.description}
                  </p>
                </div>

                <div className="relative flex items-center justify-between border-t border-glass-border/60 pt-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream-400">
                    Open page
                  </span>
                  <span className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-glass-border bg-glass-base px-3.5 text-[12px] font-medium text-cream-100 transition-all group-hover:border-glass-border-strong group-hover:bg-glass-raised group-hover:gap-2.5">
                    Enter
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </FloatingCard>
            </Link>
          );
        })}
      </section>

      <div className="mt-16 h-px tricolour-rule" />

      <p className="mt-6 text-center text-[12px] text-cream-400">
        Official Electoral Roll 2026 · Special Intensive Revision · Draft Roll Revision 1
      </p>
    </PageShell>
  );
}
