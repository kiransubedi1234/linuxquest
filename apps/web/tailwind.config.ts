import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Terminal green
        terminal: {
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          text: "#e6edf3",
          green: "#3fb950",
          yellow: "#d29922",
          red: "#f85149",
          blue: "#58a6ff",
          cyan: "#39d353",
          muted: "#8b949e",
          prompt: "#58a6ff",
        },
        // XP / Gamification
        xp: {
          gold: "#ffd700",
          silver: "#c0c0c0",
          bronze: "#cd7f32",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shake": "shake 0.5s ease-in-out",
        "xp-float": "xpFloat 1s ease-out forwards",
        "heart-beat": "heartBeat 0.6s ease-in-out",
        "confetti-fall": "confettiFall linear forwards",
        "progress-fill": "progressFill 0.8s ease-out",
        "streak-fire": "streakFire 0.8s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        xpFloat: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-60px)", opacity: "0" },
        },
        heartBeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
        confettiFall: {
          from: { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          to: { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        progressFill: {
          from: { width: "0%" },
          to: { width: "var(--progress-width)" },
        },
        streakFire: {
          from: { textShadow: "0 0 8px #ff6b35, 0 0 16px #ff6b35" },
          to: { textShadow: "0 0 16px #ffd700, 0 0 32px #ff6b35" },
        },
      },
      boxShadow: {
        "terminal": "0 0 0 1px rgba(48, 54, 61, 1), 0 8px 32px rgba(0,0,0,0.5)",
        "card": "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.4)",
        "glow-gold": "0 0 20px rgba(255, 215, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
