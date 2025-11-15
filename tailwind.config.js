/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',      // app router
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',      // in case you use src/
  ],
  theme: {
    extend: {
      // add custom colors, fonts, shadows here if you want
    },
  },
  plugins: [],
};
