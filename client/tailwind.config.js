/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5fe',
          300: '#a5b8fc',
          400: '#8192f9',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#1e3a8a',
          800: '#1e3799',
          900: '#0f172a',
          950: '#060b1a',
        },
        electric: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        glow: { from: { boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }, to: { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.4)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.4)',
      },
    },
  },
  plugins: [],
}
