/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C9A84C',
        'primary-dark': '#A8873A',
        surface: '#1A1A1A',
        card: '#242424',
        elevated: '#2E2E2E',
        border: '#383838',
        text: '#F0EDE8',
        muted: '#9A9A9A',
        ghost: '#4A4A4A',
        urban: '#4A90D9',
        formal: '#C9A84C',
        drinkware: '#5CAE8A',
      },
      fontFamily: {
        italiana: ['Italiana', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      transitionDuration: {
        250: '250ms',
        600: '600ms',
      },
    },
  },
  plugins: [],
};
