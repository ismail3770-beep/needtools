import { defineConfig } from "vitest/config";

/**
 * Vitest is intentionally NOT listed in package.json by the agent: adding it by
 * hand would desync package-lock.json and break `npm ci` in CI. Install it
 * locally with
 *
 *   npm i -D vitest
 *
 * which updates package.json and the lockfile together. Then add:
 *
 *   "test": "vitest run"
 *
 * to the scripts block. The CI workflow already runs the tests as soon as that
 * script exists.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
