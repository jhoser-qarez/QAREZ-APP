// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esto le dice a Tailwind que escanee todos los archivos JS, TS, JSX, TSX en la carpeta src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
