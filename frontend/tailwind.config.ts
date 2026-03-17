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
        shell: "#140606",
        mist: "#fff6f2",
        panel: "#180808",
        panelAlt: "#2b0b0b",
        accent: "#ff6a3d",
        ember: "#ff3d30",
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
