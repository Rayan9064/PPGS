/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm, inviting primary colors for health app
        'primary': {
          50: '#FFFDF6',   // Warm white background
          100: '#FAF6E9',  // Cream cards
          200: '#F5F0E1',  // Light cream borders
          500: '#E74C3C',  // Coral for CTAs
          600: '#C0392B',  // Darker coral
        },
        'secondary': {
          50: '#F8F9FA',   // Light gray
          100: '#E9ECEF',  // Border gray
          200: '#DEE2E6',  // Input borders
          500: '#6C757D',  // Secondary text
          600: '#495057',  // Primary text
          900: '#212529',  // Dark text
        },
        // Nutrition grade colors
        'grade-a': '#1fa363',
        'grade-b': '#8bc34a',
        'grade-c': '#ffeb3b',
        'grade-d': '#ff9800',
        'grade-e': '#f44336',
        'grade-u': '#9e9e9e',
        // Telegram theme colors
        'tg-bg': 'var(--tg-color-bg)',
        'tg-text': 'var(--tg-color-text)',
        'tg-hint': 'var(--tg-color-hint)',
        'tg-link': 'var(--tg-color-link)',
        'tg-button': 'var(--tg-color-button)',
        'tg-button-text': 'var(--tg-color-button-text)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
};
