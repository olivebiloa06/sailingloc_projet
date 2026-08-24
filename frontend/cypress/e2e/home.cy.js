// Régression : la homepage appelait une route admin protégée pour les avis,
// et un 401 sur cet appel secondaire déclenchait un window.location.href
// forcé vers /login — un visiteur non connecté était éjecté de l'accueil.
describe("Page d'accueil", () => {
  it("reste sur / pour un visiteur non connecté (pas de redirection vers /login)", () => {
    cy.visit("/");
    cy.url().should("eq", "http://localhost:5173/");
    cy.get("header").contains("a", "SailingLoc").should("be.visible");
  });

  it("affiche la navigation principale et le lien de connexion", () => {
    cy.visit("/");
    cy.get('nav[aria-label="Navigation principale"]').should("be.visible");
    cy.contains("a", "Connexion").should("be.visible");
  });

  it("le lien Connexion mène bien à /login", () => {
    cy.visit("/");
    cy.contains("a", "Connexion").click();
    cy.url().should("match", /\/login$/);
    cy.contains("h2", "Connexion").should("be.visible");
  });
});
