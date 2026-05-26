import { cn } from '../lib/cn';

export interface LeaderBadgeProps {
  name: string;
  role?: string;
  photoUrl?: string | null;
  phone?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { ring: 'h-9 w-9 text-[11px]', stack: 'gap-2', name: 'text-[13px]', role: 'text-[10px]' },
  md: { ring: 'h-12 w-12 text-sm', stack: 'gap-3', name: 'text-sm', role: 'text-[11px]' },
  lg: { ring: 'h-16 w-16 text-base', stack: 'gap-4', name: 'text-[15px]', role: 'text-xs' },
} as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Round leader avatar + role label. Used on the Volunteer Information page
 * for Effective Leaders, PIC, and Polling Agents.
 */
export function LeaderBadge({
  name,
  role,
  photoUrl,
  phone,
  size = 'md',
  className,
}: LeaderBadgeProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center', s.stack, className)}>
      <div
        className={cn(
          'relative grid shrink-0 place-items-center rounded-pill border border-glass-border-strong bg-gradient-to-br from-brand-saffron/20 to-brand-green/10 font-medium text-cream-100',
          s.ring,
        )}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full rounded-pill object-cover"
          />
        ) : (
          <span>{initials(name)}</span>
        )}
        {/* soft ring */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-pill ring-1 ring-inset ring-white/10"
        />
      </div>
      <div className="min-w-0 leading-tight">
        <div className={cn('truncate font-medium text-cream-100', s.name)}>{name}</div>
        {role && (
          <div
            className={cn(
              'uppercase tracking-[0.14em] text-cream-400',
              s.role,
            )}
          >
            {role}
          </div>
        )}
        {phone && (
          <div className={cn('font-mono text-cream-300', s.role)}>{phone}</div>
        )}
      </div>
    </div>
  );
}
