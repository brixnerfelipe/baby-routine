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
        // Paleta monocromática elegante (Azul suave)
        baby: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36aef7',
          500: '#0c95eb',
          600: '#0077c9',
          700: '#025fa3',
          800: '#065186',
          900: '#0c436e',
          950: '#082b49',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'sans-serif'],
        heading: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
