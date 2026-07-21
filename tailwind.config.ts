import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rc: {
          navy: "#2B4B8C",
          "navy-dark": "#1E3566",
          cyan: "#4DB8E8",
          orange: "#F5A020",
          teal: "#008B8B",
          cream: "#FBF8F4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
