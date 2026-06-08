/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#14532d',
          800: '#052e16',
          900: '#022c22',
        },
        amber: {
          warm: '#D4A373',
          light: '#E9C89B',
          dark: '#B8860B',
        },
        ivory: {
          50: '#FEFDF8',
          100: '#FAF3E0',
          200: '#F5ECD7',
          300: '#EDE0C8',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
