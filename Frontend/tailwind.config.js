/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CE7A',
          dark: '#9C7B22',
        },
        ink: '#0A0A0A',
        ivory: '#FBF7EE',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif Devanagari"', 'serif'],
        body: ['"Jost"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8CE7A 0%, #D4AF37 45%, #9C7B22 100%)',
      },
      boxShadow: {
        gold: '0 8px 30px -8px rgba(212,175,55,0.45)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
