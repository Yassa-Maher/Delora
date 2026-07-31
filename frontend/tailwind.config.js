/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00a650',
          'green-hover': '#008f45',
          hero: '#3BB77E',
          navy: '#1e3a5f',
          navy2: '#253D4E',
        },
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#00a650',
          600: '#008f45',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#0d3b0f',
        },
        accent: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px -4px rgba(0,0,0,0.03)',
        'card-hover': '0 20px 40px -12px rgba(0,166,80,0.18)',
        'nav': '0 1px 3px rgba(0,0,0,0.04)',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'modal-pop': 'modal-pop 0.2s ease-out forwards',
        'shake': 'shake 0.3s ease-in-out',
        'fade-up': 'fadeUp 0.15s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'modal-pop': {
          'from': { opacity: 0, transform: 'scale(0.95)' },
          'to': { opacity: 1, transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        'fadeUp': {
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
