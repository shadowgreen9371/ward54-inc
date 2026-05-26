/**
 * Lightweight classname concatenator. Filters falsey values.
 * Equivalent to clsx for the small surface we use.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
