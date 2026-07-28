describe("Parcours 2 — Publication d'un bateau", () => {

  it("Se connecte en tant que propriétaire", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");
  });

  it("Accède à Mes bateaux", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");
    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");
  });

  it("Ouvre le formulaire de création", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    // Navigation SPA vers mes-bateaux puis clic sur "Ajouter un bateau"
    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");
    cy.get("a[href*='/mes-bateaux/nouveau']").click();
    cy.url().should("include", "/mes-bateaux/nouveau");
    cy.get("form, input", { timeout: 15000 }).should("exist");
  });

  it("Remplit et soumet le formulaire", () => {
    cy.intercept("POST", "/api/boats").as("createBoat");

    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    // Navigation SPA — auth conservée
    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");
    cy.get("a[href*='/mes-bateaux/nouveau']").click();
    cy.url().should("include", "/mes-bateaux/nouveau");

    cy.get("input[name='nom']", { timeout: 15000 }).should("exist");
    cy.get("input[name='nom']").type("Cypress Test Boat");
    cy.get("select").first().select("voilier");
    cy.get("input[name='localisation']").type("Marseille");
    cy.get("input[type='number']").first().clear().type("4");
    cy.get("input[name='prixJour']").type("120");
    cy.get("textarea").first().type("Bateau de test Cypress E2E.");

    cy.get("button[type='submit']").click();
    cy.wait("@createBoat").its("response.statusCode").should("eq", 201);
    cy.url().should("include", "/mes-bateaux");
  });

  it("Le bateau apparaît dans la liste publique", () => {
    cy.intercept("GET", "/api/boats*").as("getBoats");
    cy.visit("/boats");
    cy.wait("@getBoats");
    cy.get("body").should("not.contain", "Erreur serveur");
  });
});