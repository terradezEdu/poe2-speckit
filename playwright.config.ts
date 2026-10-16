import { defineConfig, devices } from '@playwright/test';

const productionServer = 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      testMatch: ['**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'chromium-narrow',
      testMatch: ['**/*.spec.ts'],
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'firefox-smoke',
      testMatch: ['**/map-keyboard.spec.ts'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-smoke',
      testMatch: ['**/map-keyboard.spec.ts'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: productionServer,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
