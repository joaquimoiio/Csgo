/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          orange: '#FF6600',
          blue: '#006AA3',
          dark: '#1a1a1a',
          gray: '#2a2a2a'
        }
      }
    },
  },
  plugins: [],
}