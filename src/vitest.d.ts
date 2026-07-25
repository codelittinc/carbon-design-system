// Make the jest-dom matcher augmentation (toBeInTheDocument, toHaveValue, …)
// visible to `tsc` as well as to Vitest at runtime. `vitest.setup.ts` performs
// the same side-effect import for the test run, but it lives outside the `src`
// include, so this declaration file surfaces the types to the typecheck.
import "@testing-library/jest-dom/vitest";
