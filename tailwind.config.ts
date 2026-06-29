import type { Config } from 'tailwindcss'

/**
 * Theme tuned to the canonical iVisa Portal design system:
 * primary blue (#2563EB), success green, Inter typeface, 12px radius,
 * and soft blue-tinted shadows. China-red is reserved as a small
 * decorative accent only (never as government-style branding).
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          DEFAULT: '#0f1f3d',
          light: '#16294f',
        },
        accent: {
          // China-red — decorative use only (lanterns, tiny marks), never CTAs.
          DEFAULT: '#d8232a',
          dark: '#b51d23',
        },
        gold: {
          DEFAULT: '#e8b53b',
          dark: '#c8951f',
        },
        ink: {
          DEFAULT: '#0f172a',
          soft: '#334155',
          muted: '#64748b',
        },
        line: '#e2e8f0',
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f6f9fc',
          tint: '#eff6ff',
        },
        success: { DEFAULT: '#16a34a', dark: '#15803d', light: '#dcfce7' },
        warn: { DEFAULT: '#b45309', light: '#fef3c7' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '18': '4.5rem',
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.375rem',
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15,23,42,0.08)',
        card: '0 2px 14px -4px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.05)',
        'card-hover': '0 12px 40px -8px rgba(37,99,235,0.20)',
        focus: '0 0 0 4px rgba(37,99,235,0.18)',
        cta: '0 8px 24px -6px rgba(37,99,235,0.35)',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        marquee: 'marquee 32s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
