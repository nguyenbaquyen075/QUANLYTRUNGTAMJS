/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00704a", // Anh Tê Green
        "on-primary": "#ffffff",
        "primary-container": "#96f0c0",
        "on-primary-container": "#002113",
        "secondary": "#56615e",
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
      }
    },
  },
  plugins: [],
}
