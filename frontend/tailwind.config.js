/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#38bdf8",
        danger: "#dc2626",
        security: {
          dark: "#070b13",
          panel: "#0c1322",
          blue: "#2563eb"
        }
      }
    }
  },
  plugins: []
};
