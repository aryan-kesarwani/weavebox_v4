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
        dark: {
          bg: {
            primary: 'rgb(0, 0, 0)',
            secondary: 'rgb(61, 61, 61)',
            hover: 'rgb(41, 41, 41)',
          },
          text: {
            primary: 'rgb(255, 255, 255)',
            secondary: 'rgb(200, 200, 200)',
          }
        }
      }
    },
  },
  plugins: [],
}

