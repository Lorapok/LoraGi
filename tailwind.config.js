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
        bio: {
          void: '#05070c',
          card: '#0b0f19',
          surface: '#111827',
          hover: '#192236',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-bright': 'rgba(255, 255, 255, 0.18)',
          emerald: '#00f5a0',
          cyan: '#00d2ff',
          amber: '#ffb800',
          violet: '#a855f7',
          rose: '#ff3366',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bio-emerald': '0 0 25px -5px rgba(0, 245, 160, 0.35)',
        'bio-cyan': '0 0 25px -5px rgba(0, 210, 255, 0.35)',
        'bio-violet': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'bio-amber': '0 0 25px -5px rgba(255, 184, 0, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0, 245, 160, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(0, 245, 160, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
