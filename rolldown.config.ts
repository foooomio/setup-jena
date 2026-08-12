import { defineConfig } from "rolldown";

export default defineConfig({
  platform: "node",
  input: "src/setup-jena.ts",
  output: {
    file: "dist/index.js",
  },
});
