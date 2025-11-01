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
          dark: '#0a0e0f',
          darker: '#050707',
          green: '#00ff41',
          'green-dim': '#00cc33',
          orange: '#ff8c00',
          red: '#ff0000',
          yellow: '#ffff00',
          gray: '#1a1f1f',
          'gray-light': '#2a3333',
          border: '#00ff4120',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        military: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 30px rgba(0, 255, 65, 0.8)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
