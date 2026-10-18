import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // Next.js + Core Web Vitals rules (native flat config)
  ...nextVitals,

  // Files that should not be linted
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "public/**", // static assets + vendored workers (pdf.worker.js, gif.js, ...)
    ],
  },
];

export default eslintConfig;
