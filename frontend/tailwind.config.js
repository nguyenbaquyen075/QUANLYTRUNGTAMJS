import colors from "tailwindcss/colors";

// Dải xanh dương nhạt: mỗi bậc đậm của blue lùi xuống một bậc.
const lightBlue = {
  50: colors.blue[50], 100: colors.blue[100], 200: colors.blue[200], 300: colors.blue[200],
  400: colors.blue[300], 500: colors.blue[400], 600: colors.blue[500], 700: colors.blue[600],
  800: colors.blue[700], 900: colors.blue[800], 950: colors.blue[900],
};

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
        emerald: lightBlue,
        green: lightBlue,
        teal: lightBlue,
        "primary": "#3b82f6", // Edu Blue
        "on-primary": "#ffffff",
        "primary-container": "#dbeafe",
        "on-primary-container": "#1e3a8a",
        "secondary": "#60a5fa",
        "accent": "#93c5fd",
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
        "vibrant-blue": "#3b82f6",
        "vibrant-sky": "#60a5fa"
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
