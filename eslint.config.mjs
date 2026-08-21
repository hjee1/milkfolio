import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// Next.js 16 removed `next lint` — eslint-config-next 16 ships native flat
// configs; this file + the `eslint .` script replace the old command.
export default defineConfig([
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "graphify-out/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // react-hooks v6 compiler-grade rules — flag valid patterns this
      // codebase relies on (hydration-safe matchMedia setState in effects,
      // ref-based timers). Kept visible as warnings; revisit in the design
      // overhaul phase rather than refactoring architecture for the linter.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      // The editorial copy deliberately renders "//"-prefixed labels
      // (e.g. "// transcript") — not stray JSX comments.
      "react/jsx-no-comment-textnodes": "off",
    },
  },
]);
