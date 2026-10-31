import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: "#FF4D00",
        neonHover: "#E64700",
        black: "#111315",
        charcoal: "#202326",
        cream: "#F2EEE7",
        muted: "#99968F",
        edge: "#343434",
      },
      fontFamily: {
        display: ["var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
