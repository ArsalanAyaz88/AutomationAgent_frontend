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
        military: {
          dark: '#0f1613',
          darker: '#0b110e',
          green: '#5c9a6f',
          'green-dim': '#3f6f53',
          orange: '#d7a347',
          red: '#c0654d',
          yellow: '#d9c27b',
          gray: '#161f1c',
          'gray-light': '#1f2925',
          border: '#24322d',
          text: '#d6e1dc',
          muted: '#8aa196',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        military: ['"IBM Plex Sans"', 'sans-serif'],
      },
      animation: {
        smoke: 'smoke 32s ease-in-out infinite',
      },
      keyframes: {
        smoke: {
          '0%': { transform: 'translate3d(-12%, -6%, 0) scale(1)', opacity: '0.18' },
          '25%': { transform: 'translate3d(8%, -4%, 0) scale(1.05)', opacity: '0.24' },
          '50%': { transform: 'translate3d(12%, 6%, 0) scale(1.1)', opacity: '0.2' },
          '75%': { transform: 'translate3d(-6%, 4%, 0) scale(1.04)', opacity: '0.26' },
          '100%': { transform: 'translate3d(-12%, -6%, 0) scale(1)', opacity: '0.18' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
