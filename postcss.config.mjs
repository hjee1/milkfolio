// Tailwind v4 uses a single PostCSS plugin — no tailwind.config.js needed.
// Theme/tokens are declared in app/globals.css via @theme blocks.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
