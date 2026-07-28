const { defineConfig } = require("cypress");
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    video: true,
    supportFile: false,
    failOnStatusCode: false,
  },
  env: {
    LOCATAIRE_EMAIL: "olivebiloa06@gmail.com",
    LOCATAIRE_PASSWORD: "Olive2026@",
    PROPRIETAIRE_EMAIL: "seke06@gmail.com",
    PROPRIETAIRE_PASSWORD: "Seke2026@",
  },
});