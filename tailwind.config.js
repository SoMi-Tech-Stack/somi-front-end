/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        somi: {
          purple: {
            50: '#F6F4F7',
            100: '#EDE9EF',
            200: '#DCD4E0',
            300: '#C5B7CC',
            400: '#A68FB2',
            500: '#8B6D99',
            600: '#6B4E71',
            700: '#563E5A',
            800: '#402E43',
            900: '#2B1F2C'
          },
          blue: '#5B7F95',
          cream: '#F5F3F0',
          sand: '#E5E0D8',
          gray: {
            50: '#F9F8F7',
            100: '#F0EEEC',
            200: '#E5E0D8',
            300: '#D5CEC4',
            400: '#B3A99A',
            500: '#8C8275',
            600: '#665E54',
            700: '#4D463F',
            800: '#332E29',
            900: '#1A1714'
          }
        }
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
