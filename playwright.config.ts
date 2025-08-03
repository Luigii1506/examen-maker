// 🎭 PLAYWRIGHT CONFIGURATION
// ===========================
// Configuración para testing End-to-End

import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 📁 Directorio de tests
  testDir: "./e2e",

  // ⏱️ Timeout global para tests
  timeout: 30000,

  // 🔄 Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 0,

  // 🧵 Workers paralelos
  workers: process.env.CI ? 1 : undefined,

  // 📊 Reporter
  reporter: process.env.CI
    ? [
        ["html", { outputFolder: "e2e-results/html" }],
        ["junit", { outputFile: "e2e-results/junit.xml" }],
        ["json", { outputFile: "e2e-results/results.json" }],
      ]
    : [["html", { outputFolder: "e2e-results/html" }], ["list"]],

  // 🗃️ Output directory
  outputDir: "e2e-results/artifacts",

  // ⚙️ Use global setup/teardown
  globalSetup: require.resolve("./e2e/setup/global-setup.ts"),
  globalTeardown: require.resolve("./e2e/setup/global-teardown.ts"),

  // 🎯 Test configuration
  use: {
    // 🌐 Base URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    // 🖱️ Acción antes de cada test
    actionTimeout: 15000,

    // 🔍 Captura de screenshots
    screenshot: "only-on-failure",

    // 📹 Video grabación
    video: "retain-on-failure",

    // 🎯 Tracing
    trace: "retain-on-failure",

    // 🍪 Context options
    locale: "es-ES",
    timezoneId: "America/Mexico_City",

    // 🎭 Ignore HTTPS errors en desarrollo
    ignoreHTTPSErrors: true,
  },

  // 📱 Projects para diferentes browsers y devices
  projects: [
    // 🔧 Setup project
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // 🖥️ Desktop Chrome
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // 🦊 Desktop Firefox
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },

    // 🍎 Desktop Safari
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },

    // 📱 Mobile Chrome
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },

    // 📱 Mobile Safari
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
      dependencies: ["setup"],
    },

    // 💻 Tablet
    {
      name: "Tablet",
      use: { ...devices["iPad Pro"] },
      dependencies: ["setup"],
    },
  ],

  // 🌐 Web Server (Next.js dev server)
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,

    // Variables de entorno para testing
    env: {
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },

  // 🔧 Configuraciones adicionales
  expect: {
    // ⏱️ Timeout para expects
    timeout: 5000,
  },

  // 📁 Configuración de archivos
  testIgnore: ["**/node_modules/**", "**/.next/**", "**/coverage/**"],

  // 🎯 Test patterns
  testMatch: [
    "**/*.e2e.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "**/e2e/**/*.{ts,tsx}",
  ],
});
