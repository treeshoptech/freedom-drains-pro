import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import neutral from "@park-ui/panda-preset/colors/neutral";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({
      accentColor: neutral,
      grayColor: neutral,
      radius: "md",
    }),
  ],
  include: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          // TreeShop Brand Colors
          primary: {
            50: { value: "#e6f3ff" },
            100: { value: "#b3dbff" },
            200: { value: "#80c3ff" },
            300: { value: "#4dabff" },
            400: { value: "#1a93ff" },
            500: { value: "#0087FF" }, // Main brand blue
            600: { value: "#006ecc" },
            700: { value: "#005299" },
            800: { value: "#003766" },
            900: { value: "#001b33" },
          },
          accent: {
            50: { value: "#ecfdf5" },
            100: { value: "#d1fae5" },
            200: { value: "#a7f3d0" },
            300: { value: "#6ee7b7" },
            400: { value: "#34d399" },
            500: { value: "#10b981" },
            600: { value: "#16a34a" }, // TreeShop green accent
            700: { value: "#15803d" },
            800: { value: "#166534" },
            900: { value: "#14532d" },
          },
          dark: {
            50: { value: "#f9fafb" },
            100: { value: "#f3f4f6" },
            200: { value: "#e5e7eb" },
            300: { value: "#d1d5db" },
            400: { value: "#9ca3af" },
            500: { value: "#6b7280" },
            600: { value: "#4b5563" },
            700: { value: "#374151" },
            800: { value: "#1f2937" },
            900: { value: "#111827" }, // Secondary dark
            950: { value: "#030712" },
          },
        },
      },
      semanticTokens: {
        colors: {
          // Override semantic tokens for dark theme
          bg: {
            canvas: { value: { base: "{colors.dark.50}", _dark: "#000000" } },
            default: { value: { base: "white", _dark: "{colors.dark.900}" } },
            subtle: { value: { base: "{colors.dark.100}", _dark: "{colors.dark.800}" } },
            muted: { value: { base: "{colors.dark.200}", _dark: "{colors.dark.700}" } },
          },
          fg: {
            default: { value: { base: "{colors.dark.900}", _dark: "white" } },
            muted: { value: { base: "{colors.dark.600}", _dark: "{colors.dark.400}" } },
            subtle: { value: { base: "{colors.dark.400}", _dark: "{colors.dark.500}" } },
          },
          border: {
            default: { value: { base: "{colors.dark.200}", _dark: "{colors.dark.700}" } },
            muted: { value: { base: "{colors.dark.100}", _dark: "{colors.dark.800}" } },
          },
          // Primary color for buttons, links, accents
          colorPalette: {
            default: { value: "{colors.primary.500}" },
            emphasized: { value: "{colors.primary.600}" },
            fg: { value: "white" },
            text: { value: "{colors.primary.500}" },
          },
        },
      },
    },
  },
  jsxFramework: "react",
  outdir: "styled-system",
});
