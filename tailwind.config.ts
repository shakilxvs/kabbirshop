import type { Config } from "tailwindcss";

// Brand colors are exposed as CSS variables (see globals.css) so Admin → Settings → Branding
// can repaint the entire site at runtime without a rebuild.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          bg: "rgb(var(--brand-bg) / <alpha-value>)",
          text: "rgb(var(--brand-text) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
