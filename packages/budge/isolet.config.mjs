import { defineConfig } from "isolet-js";

export default defineConfig({
  name: "budge",
  entry: "./src/budge.tsx",
  format: ["iife", "esm"],
  globalName: "Budge",
  autoMount: false,
  minify: true,
});
