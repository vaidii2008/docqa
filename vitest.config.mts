import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Component tests opt into a DOM with a "@vitest-environment jsdom"
    // docblock at the top of the file. Everything else stays in Node.
    environment: "node",
    // Vitest owns unit tests; Playwright owns e2e/. Keep them separate so the
    // two runners never try to execute each other's files.
    exclude: ["**/node_modules/**", "e2e/**"],
    // Adds the jest-dom matchers and unmounts rendered components after each
    // test.
    setupFiles: ["./vitest.setup.ts"],
  },
});
