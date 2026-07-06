/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index-vite.html",
    "./main.jsx",
    "./wedding-app.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
