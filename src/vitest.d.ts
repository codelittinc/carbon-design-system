/// <reference types="vite/client" />
// Types `import.meta.glob` (used by theme-tokens.test.tsx to scan component
// source as raw text) and the rest of Vite's client env for `tsc`.

// Make the jest-dom matcher augmentation (toBeInTheDocument, toHaveValue, …)
// visible to `tsc` as well as to Vitest at runtime. `vitest.setup.ts` performs
// the same side-effect import for the test run, but it lives outside the `src`
// include, so this declaration file surfaces the types to the typecheck.
import "@testing-library/jest-dom/vitest";
