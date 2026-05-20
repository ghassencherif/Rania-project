/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#B8213B",
          50: "#fdf2f4",
          100: "#fce7ea",
          700: "#961c33",
          800: "#7a1629",
          900: "#5e1020",
        },
        gold: {
          DEFAULT: "#D4A017",
          light: "#E8B830",
          dark: "#B08010",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          dark: "#EAE3D5",
          darker: "#DDD5C3",
        },
        admin: {
          sidebar: "#0F172A",
          "sidebar-hover": "#1E293B",
          "sidebar-border": "#1E293B",
          accent: "#6366F1",
          "accent-hover": "#4F46E5",
          bg: "#F1F5F9",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
