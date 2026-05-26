'use client';

import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Make the bar sticky to the top of its scroll container. */
  sticky?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

/**
 * Sticky-capable search input with leading icon and clear affordance.
 * Glass surface, large hit area, mobile-first.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { sticky = false, onClear, className, containerClassName, value, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        'z-30 w-full',
        sticky && 'sticky top-3 sm:top-4',
        containerClassName,
      )}
    >
      <div
        className={cn(
          'group relative flex h-12 items-center rounded-md border border-glass-border bg-glass-base/90 backdrop-blur-glass transition-colors',
          'focus-within:border-glass-border-strong focus-within:shadow-card',
        )}
      >
        <Search
          className="ml-4 h-4 w-4 shrink-0 text-cream-400 group-focus-within:text-cream-200"
          aria-hidden
        />
        <input
          ref={ref}
          value={value}
          className={cn(
            'h-full flex-1 bg-transparent px-3 text-[15px] text-cream-100 placeholder:text-cream-400 focus:outline-none',
            className,
          )}
          {...rest}
        />
        {typeof value === 'string' && value.length > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="mr-2 grid h-8 w-8 place-items-center rounded-sm text-cream-300 hover:bg-glass-soft hover:text-cream-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
});
