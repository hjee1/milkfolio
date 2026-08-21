import { FlatCompat } from "@eslint/eslintrc";

// Next.js 16 removed `next lint` — this flat config + the `eslint .` script
// replace it (same next/core-web-vitals + next/typescript rule set).
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
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
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
