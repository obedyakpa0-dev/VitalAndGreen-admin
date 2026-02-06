/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F7A3F",
        primaryLight: "#4CAF75",
        dark: "#0F0F0F",
        gold: "#D4AF37",
        light: "#FFFFFF",
        muted: "#F5F5F5",
      },
    },
  },
  plugins: [],
}
