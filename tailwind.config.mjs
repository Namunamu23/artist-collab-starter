/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5B8CFF",
          50: "#F2F6FF",
          100: "#E6EEFF",
          200: "#C1D2FF",
          300: "#9BB7FF",
          400: "#759BFF",
          500: "#5B8CFF",
          600: "#3B6FE6",
          700: "#2854B3",
          800: "#1B3B80",
          900: "#10264D"
        }
      }
    }
  },
  plugins: []
};
