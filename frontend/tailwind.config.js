// Bảng màu edu: 500 = --primary (#1467E8), 600 = --primary-hover, 50 = --primary-light.
const eduBlue = {
  50: '#EAF3FF', 100: '#D6E7FF', 200: '#B0D0FB', 300: '#7FB0F5', 400: '#4A8DEE',
  500: '#1467E8', 600: '#0B57D0', 700: '#0A47A8', 800: '#0C3A85', 900: '#112F66', 950: '#0B1F45',
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
        sky: eduBlue,
        cyan: eduBlue,
        blue: eduBlue,
        indigo: eduBlue,
        emerald: eduBlue,
        green: eduBlue,
        teal: eduBlue,
        "primary": "#1467E8", // Edu Blue
        "on-primary": "#ffffff",
        "primary-container": "#EAF3FF",
        "on-primary-container": "#0B57D0",
        "secondary": "#0B57D0",
        "accent": "#4A8DEE",
        "gold": "#d97706", // Gold Accent
        "surface": "#ffffff",
        "on-surface": "#172B4D",
        "surface-variant": "#E4EAF2",
        "on-surface-variant": "#60708A",
        "outline": "#60708A",
        "background": "#F6F9FD",
        "on-background": "#172B4D",
        "surface-container-low": "#F6F9FD",
        "surface-container": "#EDF2F9",
        "surface-container-high": "#E4EAF2",
        "surface-container-highest": "#D8E1EE",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#E4EAF2",
        "vibrant-blue": "#1467E8",
        "vibrant-sky": "#4A8DEE"
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
        // Một họ chữ duy nhất, thiết kế riêng cho tiếng Việt (dấu không bị chen chúc). `font-serif` trỏ cùng họ này
        // để tiêu đề không còn lẫn serif + sans.
        "sans": ['"Be Vietnam Pro"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        "serif": ['"Be Vietnam Pro"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"]
      },
      // Hạ độ đậm: trước đây font-black/extrabold (900/800) ở khắp nơi nên chữ nặng và "hét". Giờ tối đa 700.
      fontWeight: {
        bold: "600",
        extrabold: "700",
        black: "700"
      },
      // Bớt giãn chữ ở nhãn IN HOA.
      letterSpacing: {
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.04em"
      }
    }
  },
  plugins: [],
};
