import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/", ".astro/", "node_modules/", "public/", ".husky/", ".vscode/", ".yarn/"],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      // Core rules misparse TS-only syntax (type-only signatures, global
      // ambient namespaces); TypeScript itself already checks these.
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
