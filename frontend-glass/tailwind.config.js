/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080b11",
          card: "#111726",
          border: "#1f293d",
          accent: "#00d4aa",
          accentGlow: "rgba(0, 212, 170, 0.15)",
        },
        decision: {
          approve: "#00ffcc",
          abstain: "#bd00ff",
          stepup: "#ffaa00",
          escalate: "#ff3366",
          decline: "#ff0033",
          pend: "#38bdf8"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
}
