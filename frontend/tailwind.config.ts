import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: "#0f0f10",
        panel: "#1a1a1d",
        panelAlt: "#232326",
        line: "#2a2a2e",
        text: "#ffffff",
        muted: "#b0b0b5",
        quiet: "#6b6b70",
        coral: "#ff4d4d",
        coralMid: "#e63946",
        coralDark: "#991b1b",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0, 0, 0, 0.34)",
      },
      fontFamily: {
        sans: ["Inter", "\"SF Pro Display\"", "\"Segoe UI\"", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "\"SFMono-Regular\"", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
