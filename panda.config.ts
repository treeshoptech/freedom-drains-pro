import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import blue from "@park-ui/panda-preset/colors/blue";
import slate from "@park-ui/panda-preset/colors/slate";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({
      accentColor: blue,
      grayColor: slate,
      radius: "md",
    }),
  ],
  include: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  exclude: [],
  theme: {
    extend: {},
  },
  jsxFramework: "react",
  outdir: "styled-system",
});
