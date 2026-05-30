import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1628",
          900: "#0A1628",
          800: "#0F1E36",
          700: "#162A4A",
          600: "#1E3A5F",
        },
        patriot: {
          red: "#B22234",
          white: "#FFFFFF",
          gold: "#FFD700",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255, 215, 0, 0.25)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ring-pop": {
          "0%": { transform: "scale(0.96)" },
          "60%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.25s ease-out",
        "ring-pop": "ring-pop 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
