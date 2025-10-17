import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            foreground: {
              DEFAULT: "#ffffff",
              50: "#ffffff",
              100: "#fdfdfd",
              200: "#fcfcfd",
              300: "#f8fafc",
              400: "#f3f4f6",
              500: "#e5e7eb",
              600: "#d1d5db",
              700: "#9ca3af",
              800: "#6b7280",
              900: "#475569",
            },
            default: {
              DEFAULT: "#ffffff",
              50: "#ffffff",
              100: "#fdfdfd",
              200: "#fcfcfd",
              300: "#f8fafc",
              400: "#f3f4f6",
              500: "#e2e8f0",
              600: "#cbd5f5",
              700: "#94a3b8",
              800: "#64748b",
              900: "#475569",
              foreground: "#0f172a",
            },
          },
        },
      },
    }),
  ],
}
