import type { Config } from "tailwindcss";

/**
 * Design system SOS Nounous & Services.
 * Charte graphique officielle (Logo & UX/UI) :
 *  - Bleu profond  #15324B  -> `brand` (confiance, base sombre, texte)
 *  - Corail chaud  #DE7F5C  -> `accent` (appels à l'action, chaleur)
 *  - Or discret    #C29A5A  -> `gold` (touche premium)
 *  - Ivoire        #FAF7F1  -> `cream` (fond chaleureux)
 * Typographie : Jost (geometric sans).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bleu profond — confiance, sérieux
        brand: {
          50: "#eef2f6",
          100: "#dbe3ea",
          200: "#bccbd8",
          300: "#94aabe",
          400: "#65839f",
          500: "#436483",
          600: "#314e6a",
          700: "#243f57",
          800: "#1b3650",
          900: "#15324b", // bleu profond officiel
          950: "#0b1d2e",
        },
        // Corail chaud — chaleur humaine, CTA
        accent: {
          50: "#fdf4ef",
          100: "#fae5da",
          200: "#f4cab5",
          300: "#ecab8c",
          400: "#e59470",
          500: "#de7f5c", // corail officiel
          600: "#cf6a44",
          700: "#b1542f",
          800: "#8f4528",
          900: "#743a25",
        },
        // Or discret — premium
        gold: {
          300: "#dcc193",
          400: "#cdaa6e",
          500: "#c29a5a", // or officiel
          600: "#a07f45",
          700: "#7f6537",
        },
        // Ivoire — fond chaleureux
        cream: {
          DEFAULT: "#faf7f1",
          100: "#faf7f1",
          200: "#f2ece1",
          300: "#e8dfce",
        },
        // Neutre encre pour le texte courant
        ink: {
          DEFAULT: "#22303a",
          soft: "#4c5b66",
          muted: "#7c8a94",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,50,75,0.06), 0 10px 30px rgba(21,50,75,0.08)",
        soft: "0 1px 3px rgba(21,50,75,0.07)",
      },
      maxWidth: {
        container: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
