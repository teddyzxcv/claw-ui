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
        shell: "#07111f",
        mist: "#dceaf8",
        panel: "#0d1c31",
        panelAlt: "#122847",
        accent: "#6ae3ff",
        ember: "#ff8a5b",
        moss: "#76caa8",
      },
      boxShadow: {
        glow: "0 24px 64px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
