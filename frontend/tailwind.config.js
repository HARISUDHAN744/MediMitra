/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0284C7',
          primaryDark: '#0369A1',
          primaryLight: '#E0F2FE',
          secondary: '#38BDF8',
          secondaryDark: '#0284C7',
          secondaryLight: '#F0F9FF',
          coral: '#EF4444',
          coralHover: '#DC2626',
          coralLight: '#FEF2F2',
          accent: '#0EA5E9',
        },
        medical: {
          bg: '#FFFFFF',
          surface: '#F0F9FF',
          card: '#FFFFFF',
          border: '#BAE6FD',
          borderHover: '#7DD3FC',
          textMain: '#0F172A',
          textMuted: '#64748B',
          textSub: '#0284C7',
        },
        cyber: {
          950: '#F0F9FF',
          900: '#E0F2FE',
          850: '#BAE6FD',
          800: '#7DD3FC',
          750: '#38BDF8',
          700: '#0EA5E9',
          600: '#0284C7',
          500: '#0369A1',
          light: '#F0F9FF',
          dark: '#0284C7',
          border: 'rgba(14, 165, 233, 0.25)',
        },
        text: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
        },
        neon: {
          cyan: '#0284C7',
          cyanGlow: '#0284C733',
          emerald: '#10B981',
          emeraldGlow: '#10B98133',
          purple: '#0284C7',
          purpleGlow: '#0284C733',
          pink: '#EF4444',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'equalizer': {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
