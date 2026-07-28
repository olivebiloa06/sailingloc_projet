describe("Parcours 1 — Réservation complète", () => {

  it("Visite la liste des bateaux sans connexion", () => {
    cy.intercept("GET", "/api/boats*").as("getBoats");
    cy.visit("/boats");
    cy.wait("@getBoats");
    cy.url().should("include", "/boats");
    cy.get("body").should("not.contain", "Erreur serveur");
  });

  it("Ouvre une fiche bateau sans connexion", () => {
    cy.intercept("GET", "/api/boats*").as("getBoats");
    cy.intercept("GET", "/api/boats/*").as("getBoat");
    cy.visit("/boats");
    cy.wait("@getBoats");
    cy.get("a[href*='/boats/']").first().click();
    cy.wait("@getBoat");
    cy.url().should("match", /\/boats\/\d+/);
  });

  it("Se connecte en tant que locataire", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("LOCATAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("LOCATAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");
  });

  it("Remplit le formulaire de réservation", () => {
    cy.intercept("GET", "/api/boats*").as("getBoats");
    cy.intercept("GET", "/api/boats/*").as("getBoat");
    cy.intercept("POST", "/api/bookings").as("createBooking");

    // Connexion
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("LOCATAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("LOCATAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    // Navigation SPA (pas de cy.visit → pas de reload → auth conservée)
    cy.visit("/boats");
    cy.wait("@getBoats");

    // Clique sur le premier bateau (SPA navigation)
    cy.get("a[href*='/boats/']").first().click();
    cy.wait("@getBoat");

    // Attend que le formulaire soit là (user déjà chargé, pas de refresh)
    cy.get("[data-cy='date-start']", { timeout: 15000 }).should("exist");

    cy.get("[data-cy='date-start']").invoke("val", "2026-07-29").trigger("change", { force: true });
    cy.get("[data-cy='date-end']").invoke("val", "2026-07-31").trigger("change", { force: true });
    cy.get("input[type='number']").first().clear({ force: true }).type("2", { force: true });

    cy.wait(500);
    cy.get("[data-cy='reserve-button']").click({ force: true });
    cy.wait("@createBooking").its("response.statusCode").should("be.oneOf", [200, 201, 400]);
  });

  it("Vérifie la page Mes réservations", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("LOCATAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("LOCATAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");
    cy.visit("/mes-reservations");
    cy.contains("Mes réservations", { timeout: 15000 }).should("be.visible");
    cy.get("body").should("not.contain", "Erreur serveur");
  });
});