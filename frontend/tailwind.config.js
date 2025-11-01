/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@massalabs/react-ui-kit/src/**/*.{js,ts,jsx,tsx}",

  ],
  presets: [require("./src/themes/preset.js")],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0e0e10",
        },
        accent: {
          primary: "#FD5A46",
          blue: "#2563EB",
          lime: "#84CC16",
          yellow: "#F59E0B",
        },
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        "3xl": "2rem",
      },
      boxShadow: {
        brut: "8px 8px 0 0 rgba(0,0,0,0.25)",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

