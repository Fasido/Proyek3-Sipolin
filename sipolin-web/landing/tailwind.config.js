/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,js}"],
  theme: {
    extend: {
      fontFamily: {
  sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
      colors: {
        emerald: {
          primary: "#10B981",
          dark: "#059669",
          light: "#D1FAE5",
          50: "#ECFDF5",
        },
        slate: {
          dark: "#1E293B",
          mid: "#475569",
          light: "#94A3B8",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
