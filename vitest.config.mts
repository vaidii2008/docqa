import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Vitest owns unit tests; Playwright owns e2e/. Keep them separate so the
    // two runners never try to execute each other's files.
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
