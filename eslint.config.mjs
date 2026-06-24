import next from "eslint-config-next";

/**
 * Configuration ESLint (flat config — ESLint 9 / Next 16).
 * `eslint-config-next` v16 exporte directement une config plate incluant
 * les règles core-web-vitals et TypeScript.
 */
const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
