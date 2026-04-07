/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-green': '#25D366',
        'chat-dark': '#0A0E27',
        'chat-light': '#F5F5F5',
        'chat-blue': '#2563EB',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
