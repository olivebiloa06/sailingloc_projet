const { defineConfig } = require("cypress");

// Tests fonctionnels bout-en-bout (Cypress, requis par le cahier des
// charges). Mêmes scénarios que la suite Playwright (frontend/e2e/) — les
// deux outils couvrent le même besoin "teste fonctionnel", Cypress est celui
// nommément attendu.
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: false,
    video: false,
    defaultCommandTimeout: 8000,
  },
});
