// @ts-check
const { defineConfig, devices } = require("@playwright/test");

const PORT = 8080;
const baseURL = `http://localhost:${PORT}`;

/**
 * Playwright config for the ToolsTrek regression smoke suite.
 * Boots the Next.js dev server automatically and runs a single Chromium project.
 */
module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Serve a production build: precompiled routes avoid the dev server's
  // on-demand compile delays that make first-visit page loads flaky.
  webServer: {
    command: "npm run build && npm run start -- -p 8080",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
