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
        "primary": "#005537", // Anh Tê Dark Green
        "on-primary": "#ffffff",
        "primary-container": "#96f0c0",
        "on-primary-container": "#002113",
        "secondary": "#00704a",
        "accent": "#4edea3", // Mint Glow
        "gold": "#d97706", // Gold Accent
        "surface": "#ffffff",
        "on-surface": "#161d1f",
        "surface-variant": "#e8eff1",
        "on-surface-variant": "#3f4942",
        "outline": "#6f7a72",
        "background": "#ffffff",
        "on-background": "#161d1f",
        "surface-container-low": "#f4fafd",
        "surface-container": "#e8eff1",
        "surface-container-high": "#e2e9ec",
        "surface-container-highest": "#d3dbd6",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#bec9c0",
        "vibrant-blue": "#00895c",
        "vibrant-sky": "#0f9d68"
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
