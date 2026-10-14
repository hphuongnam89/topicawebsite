import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.TOPICA_QA_PORT || 3107);
const runId = process.env.TOPICA_QA_RUN_ID || `${Date.now()}-${process.pid}`;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "node --conditions=react-server --import tsx scripts/qa-server.ts",
    url: baseURL,
    timeout: 300_000,
    reuseExistingServer: false,
    env: { TOPICA_QA_RUN_ID: runId, TOPICA_QA_PORT: String(port) },
  },
});
