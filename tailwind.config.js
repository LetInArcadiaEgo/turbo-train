/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'calus-gold': '#dcc48d',
        'calus-purple': {
          200: '#e9d5ff',
          400: '#c084fc',
          600: '#9333ea',
          900: '#581c87'
        }
      }
    },
  },
  plugins: [],
  darkMode: 'media',
} 