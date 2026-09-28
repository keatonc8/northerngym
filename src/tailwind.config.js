/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layout/**/*.liquid",
    "./templates/**/*.liquid",
    "./sections/**/*.liquid",
    "./snippets/**/*.liquid",
    "./blocks/**/*.liquid",
    "./config/**/*.json",
    "./assets/**/*.{js,ts}"
  ],

  theme: {
    extend: {},
  },
};