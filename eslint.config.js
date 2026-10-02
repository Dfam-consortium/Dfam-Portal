// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "dfam", style: "kebab-case" },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "dfam", style: "kebab-case" },
      ],
      // The app uses NgModules and constructor injection, so prefer-standalone
      // and prefer-inject are off.
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-inject": "off",
      // Older code has many of these. Warn instead of failing lint until we
      // clean them up.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      // Prefix a parameter with an underscore when an interface requires it
      // but the method doesn't use it.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/prefer-for-of": "off",
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "quote-props": ["error", "consistent"],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
