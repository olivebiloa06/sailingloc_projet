describe("Recherche et fiche bateau", () => {
  it("la liste des bateaux se charge (résultats ou état vide, jamais une erreur)", () => {
    cy.visit("/boats");
    cy.contains("h1", "Nos bateaux disponibles").should("be.visible");
    cy.get(".animate-pulse").should("not.exist");
    cy.contains("Impossible de charger").should("not.exist");
  });

  it("filtrer par destination met à jour l'URL et relance la recherche", () => {
    cy.visit("/boats");
    cy.get('input[placeholder="Ville, région..."]').type("Marseille");
    cy.contains("button", "Filtrer").click();
    cy.url().should("include", "localisation=Marseille");
  });

  it("ouvrir une fiche bateau depuis la liste (si au moins un résultat existe)", () => {
    cy.visit("/boats");
    cy.get(".animate-pulse").should("not.exist");

    cy.get("body").then(($body) => {
      const cards = $body.find('a[href^="/boats/"]');
      if (cards.length === 0) {
        cy.log("Aucun bateau en base pour ce run — rien à ouvrir.");
        return;
      }
      cy.wrap(cards[0]).click();
      cy.url().should("match", /\/boats\/\d+$/);
      // La fiche bateau affiche toujours un prix "X €/jour".
      cy.contains("/jour").should("be.visible");
    });
  });

  it("une fiche bateau inexistante affiche un message clair, pas un écran blanc", () => {
    cy.visit("/boats/999999999");
    cy.contains("Ce bateau n'existe pas ou plus", { timeout: 15000 }).should("be.visible");
  });
});
