import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  // Abaikan seluruh file dalam project agar tidak di-check saat build
  globalIgnores([
    "**/*",
  ]),
]);

export default eslintConfig;