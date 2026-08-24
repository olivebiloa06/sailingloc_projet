// Un email unique par exécution pour ne jamais entrer en conflit avec un
// utilisateur déjà inscrit.
function uniqueEmail() {
  return `cy.${Date.now()}.${Math.floor(Math.random() * 100000)}@sailingloc-test.fr`;
}

const VALID_PASSWORD = "Sailing2026!";

function registerUser(email) {
  cy.visit("/register");
  cy.get("#prenom").type("Test");
  cy.get("#nom").type("E2E");
  cy.get("#email").type(email);
  cy.get("#motDePasse").type(VALID_PASSWORD);
  cy.get("#confirmation").type(VALID_PASSWORD);
  cy.contains("button", "Créer mon compte").click();
}

describe("Inscription, connexion, déconnexion", () => {
  it("parcours complet : inscription → connecté → déconnexion → reconnexion", () => {
    const email = uniqueEmail();

    registerUser(email);

    // Inscription réussie (rôle locataire par défaut) → retour à l'accueil, connecté.
    cy.url().should("eq", "http://localhost:5173/");
    cy.get('button[aria-label^="Menu du compte de"]').should("be.visible");

    // Déconnexion depuis "Mon compte" (tableau de bord locataire).
    cy.get('button[aria-label^="Menu du compte de"]').click();
    cy.contains('[role="menuitem"]', "Mon compte").click();
    cy.url().should("match", /\/mon-compte$/);
    cy.contains("button", "Se déconnecter").click();
    cy.url().should("eq", "http://localhost:5173/");
    cy.contains("a", "Connexion").should("be.visible");

    // Reconnexion avec les identifiants tout juste créés.
    cy.visit("/login");
    cy.get("#email").type(email);
    cy.get("#motDePasse").type(VALID_PASSWORD);
    cy.contains("button", "Se connecter").click();
    cy.url().should("eq", "http://localhost:5173/");
    cy.get('button[aria-label^="Menu du compte de"]').should("be.visible");
  });

  it("connexion refusée avec un mauvais mot de passe", () => {
    const email = uniqueEmail();

    registerUser(email);
    cy.url().should("eq", "http://localhost:5173/");

    cy.get('button[aria-label^="Menu du compte de"]').click();
    cy.contains('[role="menuitem"]', "Mon compte").click();
    cy.contains("button", "Se déconnecter").click();

    cy.visit("/login");
    cy.get("#email").type(email);
    cy.get("#motDePasse").type("MauvaisMotDePasse1!");
    cy.contains("button", "Se connecter").click();

    cy.contains("Email ou mot de passe incorrect").should("be.visible");
    cy.url().should("match", /\/login$/);
  });

  it("inscription refusée si les mots de passe ne correspondent pas", () => {
    cy.visit("/register");
    cy.get("#prenom").type("Test");
    cy.get("#nom").type("E2E");
    cy.get("#email").type(uniqueEmail());
    cy.get("#motDePasse").type(VALID_PASSWORD);
    cy.get("#confirmation").type("AutreChose123!");
    cy.contains("button", "Créer mon compte").click();

    cy.contains("Les mots de passe ne correspondent pas.").should("be.visible");
    cy.url().should("match", /\/register$/);
  });
});
