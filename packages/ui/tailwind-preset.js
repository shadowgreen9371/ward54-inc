/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#0A0B0F',
          900: '#0F1117',
          800: '#141823',
          700: '#1B2030',
          600: '#252B3D',
          500: '#323A52',
        },
        cream: {
          50: '#FAF6EF',
          100: '#F5EFE6',
          200: '#E8DECC',
          300: '#C4BCB0',
          400: '#8A8377',
          500: '#5C5852',
        },
        brand: {
          saffron: '#E8945A',
          'saffron-glow': 'rgba(232, 148, 90, 0.35)',
          cream: '#F5EFE6',
          green: '#7DA87A',
          'green-glow': 'rgba(125, 168, 122, 0.30)',
          inc: '#1B5FB5',
        },
        glass: {
          soft: 'rgba(255, 255, 255, 0.04)',
          base: 'rgba(255, 255, 255, 0.06)',
          raised: 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.14)',
        },
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 1px 2px rgba(0,0,0,0.4), 0 18px 48px rgba(0,0,0,0.45)',
        float: '0 24px 80px rgba(0,0,0,0.55)',
        'neon-amber': '0 0 0 1px rgba(232,148,90,0.25), 0 0 40px rgba(232,148,90,0.18)',
        'neon-green': '0 0 0 1px rgba(125,168,122,0.25), 0 0 40px rgba(125,168,122,0.16)',
        'neon-blue': '0 0 0 1px rgba(122,168,216,0.25), 0 0 40px rgba(122,168,216,0.16)',
      },
      fontFamily: {
        display: ['Instrument Serif', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'SF Pro Text', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '4px',
        glass: '20px',
        heavy: '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'rise-in': 'riseIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.6s linear infinite',
        'pulse-soft': 'pulseSoft 3.2s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
        'glow-pulse': 'glowPulse 3.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        riseIn: {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.85 },
          '50%': { opacity: 1 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(232,148,90,0.25), 0 0 30px rgba(232,148,90,0.14)' },
          '50%': { boxShadow: '0 0 0 1px rgba(232,148,90,0.35), 0 0 60px rgba(232,148,90,0.28)' },
        },
      },
    },
  },
  plugins: [],
};
