/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Playday zelena (boja fudbalskog terena)
        secondary: '#1f2937', // Tamno siva za tekst
      }
    },
  },
  plugins: [],
}

