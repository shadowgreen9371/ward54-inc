/**
 * Design tokens — single source of truth for the Ward 54 platform.
 *
 * Inspired by Claude.ai's warm dark palette: deep ink backgrounds, cream/amber
 * accents, restrained use of color. Glass surfaces stack at three depths.
 *
 * Tailwind picks these up via tailwind-preset.js.
 */

export const colors = {
  // Backgrounds — graded ink, from page floor to elevated surface
  ink: {
    base: '#0A0B0F',
    900: '#0F1117',
    800: '#141823',
    700: '#1B2030',
    600: '#252B3D',
    500: '#323A52',
  },
  // Glass overlays — translucent, blurred over ink
  glass: {
    soft: 'rgba(255, 255, 255, 0.04)',
    base: 'rgba(255, 255, 255, 0.06)',
    raised: 'rgba(255, 255, 255, 0.09)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.14)',
  },
  // Text — warm cream descending into muted greys
  text: {
    primary: '#F5EFE6',
    secondary: '#C4BCB0',
    tertiary: '#8A8377',
    muted: '#5C5852',
  },
  // Brand accents — INC tricolour, restrained
  brand: {
    saffron: '#E8945A', // warmer than the literal flag — Claude-ish amber
    saffronGlow: 'rgba(232, 148, 90, 0.35)',
    cream: '#F5EFE6',
    green: '#7DA87A',
    greenGlow: 'rgba(125, 168, 122, 0.30)',
    inc: '#1B5FB5', // congress blue, used sparingly
  },
  // Semantic
  semantic: {
    success: '#7DA87A',
    warning: '#E8B85A',
    danger: '#D26B6B',
    info: '#7AA8D8',
  },
} as const;

export const radii = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  pill: '999px',
} as const;

export const shadows = {
  // Soft layered shadows — Apple-style
  card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)',
  cardHover: '0 1px 2px rgba(0,0,0,0.4), 0 18px 48px rgba(0,0,0,0.45)',
  float: '0 24px 80px rgba(0,0,0,0.55)',
  // Neon glow borders — soft, never harsh
  neonAmber: '0 0 0 1px rgba(232,148,90,0.25), 0 0 40px rgba(232,148,90,0.18)',
  neonGreen: '0 0 0 1px rgba(125,168,122,0.25), 0 0 40px rgba(125,168,122,0.16)',
  neonBlue: '0 0 0 1px rgba(122,168,216,0.25), 0 0 40px rgba(122,168,216,0.16)',
} as const;

// Apple-style spacing scale (4px grid)
export const space = {
  '0': '0',
  '0.5': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '32': '128px',
} as const;

export const typography = {
  display: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  sans: '"Inter", system-ui, -apple-system, "SF Pro Text", "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
} as const;

// Framer Motion timing primitives — cinematic, never bouncy
export const motion = {
  ease: {
    out: [0.16, 1, 0.3, 1] as const, // Apple's smooth-out
    inOut: [0.65, 0, 0.35, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
  duration: {
    fast: 0.18,
    base: 0.32,
    slow: 0.55,
    cinematic: 0.85,
  },
} as const;
