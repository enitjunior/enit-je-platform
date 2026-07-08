/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ENIT JE brand palette
        navy: {
          50:  '#eef1f7',
          100: '#d5dcea',
          200: '#aab9d5',
          300: '#7e95bf',
          400: '#5372aa',
          500: '#1f3a6e',
          600: '#1a305c',
          700: '#15264a',
          800: '#0f1c38',
          900: '#1d2d4e', // primary dark navy from logo
          DEFAULT: '#1d2d4e',
        },
        teal: {
          je: '#3cbfbf', // accent teal from logo
          light: '#5dd5d5',
          dark: '#2a9090',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(29,45,78,0.08)',
        'card-hover': '0 8px 32px 0 rgba(29,45,78,0.16)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};