import { test, expect } from "@playwright/test";

test.describe("Recherche et fiche bateau", () => {
  test("la liste des bateaux se charge (résultats ou état vide, jamais une erreur)", async ({ page }) => {
    await page.goto("/boats");
    await expect(page.getByRole("heading", { name: "Nos bateaux disponibles" })).toBeVisible();

    // Le squelette de chargement doit disparaître, sans jamais tomber sur la
    // bannière d'erreur rouge.
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText("Impossible de charger")).toHaveCount(0);
  });

  test("filtrer par destination met à jour l'URL et relance la recherche", async ({ page }) => {
    await page.goto("/boats");
    await page.getByPlaceholder("Ville, région...").fill("Marseille");
    await page.getByRole("button", { name: "Filtrer" }).click();
    await expect(page).toHaveURL(/localisation=Marseille/);
  });

  test("ouvrir une fiche bateau depuis la liste (si au moins un résultat existe)", async ({ page }) => {
    await page.goto("/boats");
    await expect(page.locator(".animate-pulse").first()).toBeHidden({ timeout: 10_000 });

    const firstCard = page.locator('a[href^="/boats/"]').first();
    const hasResults = await firstCard.count();
    test.skip(hasResults === 0, "Aucun bateau en base pour ce run — rien à ouvrir.");

    await firstCard.click();
    await expect(page).toHaveURL(/\/boats\/\d+$/);
    // La fiche bateau affiche toujours un prix "X €/jour" (peut apparaître
    // plusieurs fois si la page liste aussi des bateaux similaires). Timeout
    // généreux : le backend de dev est partagé par tous les workers en //.
    await expect(page.getByText("/jour").first()).toBeVisible({ timeout: 15_000 });
  });

  test("une fiche bateau inexistante affiche un message clair, pas un écran blanc", async ({ page }) => {
    await page.goto("/boats/999999999");
    // Timeout généreux : le backend de dev est partagé par tous les workers
    // Playwright en parallèle, donc une requête peut attendre son tour.
    await expect(page.getByText("Ce bateau n'existe pas ou plus")).toBeVisible({ timeout: 15_000 });
  });
});
