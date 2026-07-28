describe("Parcours 3 — Gestion des disponibilités", () => {

  it("Accède à la gestion des disponibilités", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");

    cy.get("a[href*='disponibilites'], button").contains(/disponibilit/i).first().click();
    cy.url().should("match", /disponibilit/i);
  });

  it("Ajoute une période de disponibilité", () => {
    cy.intercept("POST", "/api/availability*").as("createAvailability");

    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");
    cy.get("a[href*='disponibilites'], button").contains(/disponibilit/i).first().click();
    cy.url().should("match", /disponibilit/i);

    const today = new Date();
    const d1 = new Date(today.getTime() + 30 * 86400000);
    const d2 = new Date(today.getTime() + 60 * 86400000);
    const fmt = (d) => d.toISOString().split("T")[0];

    cy.get("input[type='date']", { timeout: 10000 }).first().type(fmt(d1), { force: true });
    cy.get("input[type='date']").last().type(fmt(d2), { force: true });
    cy.get("button[type='submit']").click();
    cy.wait("@createAvailability").its("response.statusCode").should("be.oneOf", [200, 201]);
  });

  it("La disponibilité est visible sur la fiche bateau", () => {
    cy.intercept("GET", "/api/boats*").as("getBoats");
    cy.intercept("GET", "/api/boats/*").as("getBoat");
    cy.visit("/boats");
    cy.wait("@getBoats");
    cy.get("a[href*='/boats/']").first().click();
    cy.wait("@getBoat");
    // Vérifie qu'il y a une section disponibilités (texte ou dates)
    cy.get("body").should("not.contain", "Erreur serveur");
    cy.get(".bg-green-50, [class*='green'], [class*='disponib']", { timeout: 10000 })
      .should("exist");
  });

  it("Les disponibilités s'affichent sans erreur", () => {
    cy.visit("/login");
    cy.get("input[type='email']").type(Cypress.env("PROPRIETAIRE_EMAIL"));
    cy.get("input[type='password']").type(Cypress.env("PROPRIETAIRE_PASSWORD"));
    cy.get("button[type='submit']").click();
    cy.url().should("not.include", "/login");

    cy.visit("/mes-bateaux");
    cy.contains("Mes bateaux", { timeout: 15000 }).should("be.visible");
    cy.get("body").should("not.contain", "Erreur serveur");
    cy.get("body").should("not.contain", "500");
  });
});