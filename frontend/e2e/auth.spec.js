import { test, expect } from "@playwright/test";

// Un email unique par exécution pour ne jamais entrer en conflit avec un
// utilisateur déjà inscrit (Date.now() suffit, les tests d'un même run ne se
// chevauchent pas dans le temps).
function uniqueEmail() {
  return `e2e.${Date.now()}.${Math.floor(Math.random() * 100000)}@sailingloc-test.fr`;
}

const VALID_PASSWORD = "Sailing2026!";

test.describe("Inscription, connexion, déconnexion", () => {
  test("parcours complet : inscription → connecté → déconnexion → reconnexion", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Test");
    await page.getByLabel("Nom", { exact: true }).fill("E2E");
    await page.getByLabel("Adresse email").fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(VALID_PASSWORD);
    await page.getByLabel("Confirmer le mot de passe").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    // Inscription réussie (rôle locataire par défaut) → retour à l'accueil, connecté.
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByLabel(/Menu du compte de/)).toBeVisible();

    // Déconnexion depuis "Mon compte" (tableau de bord locataire).
    await page.getByLabel(/Menu du compte de/).click();
    await page.getByRole("menuitem", { name: "Mon compte" }).click();
    await expect(page).toHaveURL(/\/mon-compte$/);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible();

    // Reconnexion avec les identifiants tout juste créés.
    await page.goto("/login");
    await page.getByLabel("Adresse email").fill(email);
    await page.getByLabel("Mot de passe").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByLabel(/Menu du compte de/)).toBeVisible();
  });

  test("connexion refusée avec un mauvais mot de passe", async ({ page }) => {
    const email = uniqueEmail();

    // Crée un compte dédié à ce test pour ne pas dépendre de données seedées.
    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Test");
    await page.getByLabel("Nom", { exact: true }).fill("E2E");
    await page.getByLabel("Adresse email").fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(VALID_PASSWORD);
    await page.getByLabel("Confirmer le mot de passe").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL("http://localhost:5173/");

    await page.getByLabel(/Menu du compte de/).click();
    await page.getByRole("menuitem", { name: "Mon compte" }).click();
    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await page.goto("/login");
    await page.getByLabel("Adresse email").fill(email);
    await page.getByLabel("Mot de passe").fill("MauvaisMotDePasse1!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText("Email ou mot de passe incorrect")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("inscription refusée si les mots de passe ne correspondent pas", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Test");
    await page.getByLabel("Nom", { exact: true }).fill("E2E");
    await page.getByLabel("Adresse email").fill(uniqueEmail());
    await page.getByLabel("Mot de passe", { exact: true }).fill(VALID_PASSWORD);
    await page.getByLabel("Confirmer le mot de passe").fill("AutreChose123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });
});
