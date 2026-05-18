import { defineConfig, devices } from "@playwright/test";

// Playwright e2e config — Phase 5 of SPEC-MIGRATE-NEXT-001.
//
// We use the system-installed Chrome (`channel: "chrome"`) instead of
// Playwright's bundled chromium binary because the Somansa corporate proxy
// blocks the playwright-chromium download (SELF_SIGNED_CERT_IN_CHAIN on
// storage.googleapis.com). System Chrome was already present at
// /Applications/Google Chrome.app, so this skips the install step entirely.
//
// If you want Firefox/WebKit coverage later, run:
//   pnpm exec playwright install firefox webkit
// from a network that isn't intercepted by Somansa (home wifi).

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],                                     // console-friendly
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
