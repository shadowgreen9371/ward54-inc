import { cn } from '../lib/cn';

export interface StatPillProps {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'male' | 'female' | 'total';
  className?: string;
}

const toneMap = {
  neutral: 'text-cream-100',
  male: 'text-[#7AA8D8]',
  female: 'text-[#E8945A]',
  total: 'text-brand-green',
} as const;

/**
 * Compact stat — used inside cards for M / F / Total voter counts.
 * Bloomberg-style: tiny label, large tabular number.
 */
export function StatPill({ label, value, tone = 'neutral', className }: StatPillProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-sm bg-glass-soft px-3 py-2 backdrop-blur-glass',
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-400">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-lg font-medium tabular-nums leading-none',
          toneMap[tone],
        )}
      >
        {value}
      </span>
    </div>
  );
}
