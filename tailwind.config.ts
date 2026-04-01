import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        waffle: {
          orange:   "#FF9800",
          golden:   "#FBC02D",
          pale:     "#FFF9C4",
          cream:    "#FFFDE7",
          brown:    "#5C2C02",
          espresso: "#2D0D00",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
