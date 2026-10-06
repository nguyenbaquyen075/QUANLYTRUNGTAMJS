import colors from "tailwindcss/colors";

// Xanh edu: dải sky sáng, dùng thay cho blue/emerald/green/teal.
const eduBlue = colors.sky;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Xanh edu: mọi class emerald/green/teal/lime/cyan đều trỏ về dải xanh dương.
        blue: eduBlue,
        indigo: eduBlue,
        emerald: eduBlue,
        green: eduBlue,
        teal: eduBlue,
        "primary": "#0ea5e9", // Edu Blue
        "on-primary": "#ffffff",
        "primary-container": "#e0f2fe",
        "on-primary-container": "#075985",
        "secondary": "#38bdf8",
        "accent": "#7dd3fc",
        "gold": "#d97706", // Gold Accent
        "surface": "#ffffff",
        "on-surface": "#161d1f",
        "surface-variant": "#e6edf8",
        "on-surface-variant": "#3f4a5e",
        "outline": "#6b7690",
        "background": "#ffffff",
        "on-background": "#161d1f",
        "surface-container-low": "#f3f7fd",
        "surface-container": "#e6edf8",
        "surface-container-high": "#dde6f4",
        "surface-container-highest": "#cbd7ea",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#bccbe3",
        "vibrant-blue": "#0ea5e9",
        "vibrant-sky": "#38bdf8"
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "max-width": "1280px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        "base": "8px"
      },
      fontFamily: {
        "sans": ["Hanken Grotesk", "Inter", "Manrope", "sans-serif"],
        "serif": ["Playfair Display", "Source Serif 4", "serif"]
      }
    }
  },
  plugins: [],
};
