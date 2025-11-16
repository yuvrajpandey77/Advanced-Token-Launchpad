/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#0f0f0f',
          border: '#1a1a1a',
          text: '#ffffff',
          'text-muted': '#999999',
        },
      },
    },
  },
  plugins: [],
}

