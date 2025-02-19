import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dhermica: {
          back: '#c4c8c5',
          primary: '#484450',
          secondary: '#466067',
          success: '#34baab',
          info: '#459a96',
          warning: '#FFD700',
          error: '#FF5733'
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
