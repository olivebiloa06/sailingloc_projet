import { test, expect } from "@playwright/test";

// Régression : la homepage appelait une route admin protégée pour les avis,
// et un 401 sur cet appel secondaire déclenchait un window.location.href
// forcé vers /login — un visiteur non connecté était éjecté de l'accueil.
test.describe("Page d'accueil", () => {
  test("reste sur / pour un visiteur non connecté (pas de redirection vers /login)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("link", { name: "SailingLoc — Retour à l'accueil" })).toBeVisible();
  });

  test("affiche la navigation principale et le lien de connexion", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible();
  });

  test("le lien Connexion mène bien à /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Connexion" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  });
});
