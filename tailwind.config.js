/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F3EFEA',
          300: '#EAE4DC',
          400: '#D5CCC1',
        },
        brand: {
          yellow: '#FED766',
          'yellow-light': '#FEF3C7',
          'yellow-hover': '#FDC830',
          pink: '#F8B4C0',
          'pink-light': '#FDF2F4',
          'pink-hover': '#F59BB0',
          teal: '#14B8A6',
          'teal-light': '#CCFBF1',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'pill': '0 2px 10px 0 rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
