import { defineConfig, devices } from "@playwright/test";

// Tests fonctionnels bout-en-bout (parcours utilisateur réels dans un vrai
// navigateur), distincts des tests unitaires/API du backend (Jest+Supertest).
// Démarre automatiquement le backend ET le frontend en mode dev avant de
// lancer les tests, et les arrête à la fin.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      url: "http://localhost:5000/api/boats",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npm run dev",
      cwd: ".",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
