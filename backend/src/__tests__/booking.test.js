/**
 * Tests unitaires — Calcul des réservations
 * CDC page 92 : couverture ≥ 70%
 *
 * Fonctions testées (importées depuis src/utils/bookingCalculations.js,
 * utilisé par bookingController.js — ces tests vérifient le code réellement
 * exécuté en production, pas une copie) :
 *   - calculerMontant(prixJour, dateDebut, dateFin) → sous-total
 *   - calculerCommission(sousTotal) → commission 10%
 *   - calculerTotal(sousTotal) → total locataire (sousTotal + commission)
 *   - validerDates(dateDebut, dateFin) → true/false
 *   - validerPersonnes(nombre, capaciteMax) → true/false
 */

const {
  calculerMontant,
  calculerCommission,
  calculerTotal,
  validerDates,
  validerPersonnes,
} = require("../utils/bookingCalculations");

// ============================================================
// TESTS
// ============================================================

describe("Calcul du montant de réservation", () => {
  test("100€/jour × 3 jours = 300€ sous-total", () => {
    expect(calculerMontant(100, "2026-07-23", "2026-07-26")).toBe(300);
  });

  test("200€/jour × 1 jour = 200€ sous-total", () => {
    expect(calculerMontant(200, "2026-08-01", "2026-08-02")).toBe(200);
  });

  test("150€/jour × 7 jours = 1050€ sous-total", () => {
    expect(calculerMontant(150, "2026-07-01", "2026-07-08")).toBe(1050);
  });

  test("0€/jour (bateau gratuit) → 0€ sous-total", () => {
    expect(calculerMontant(0, "2026-07-01", "2026-07-03")).toBe(0);
  });

  test("Prix décimal : 99.50€/jour × 2 jours = 199€", () => {
    expect(calculerMontant(99.5, "2026-07-01", "2026-07-03")).toBe(199);
  });
});

describe("Calcul de la commission SailingLoc (10%)", () => {
  test("Commission sur 300€ = 30€", () => {
    expect(calculerCommission(300)).toBe(30);
  });

  test("Commission sur 1050€ = 105€", () => {
    expect(calculerCommission(1050)).toBe(105);
  });

  test("Commission arrondie : 10% de 333€ = 33€", () => {
    expect(calculerCommission(333)).toBe(33);
  });

  test("Commission sur 0€ = 0€", () => {
    expect(calculerCommission(0)).toBe(0);
  });

  test("Commission toujours un entier", () => {
    const commission = calculerCommission(99);
    expect(Number.isInteger(commission)).toBe(true);
  });
});

describe("Calcul du total locataire (sous-total + commission)", () => {
  test("300€ + 30€ commission = 330€ total", () => {
    expect(calculerTotal(300)).toBe(330);
  });

  test("1000€ + 100€ commission = 1100€ total", () => {
    expect(calculerTotal(1000)).toBe(1100);
  });

  test("Total toujours > sous-total", () => {
    expect(calculerTotal(500)).toBeGreaterThan(500);
  });

  test("Total = sous-total × 1.1", () => {
    const sousTotal = 400;
    expect(calculerTotal(sousTotal)).toBe(Math.round(sousTotal * 1.1));
  });
});

describe("Validation des dates", () => {
  test("Dates valides : dateFin > dateDebut", () => {
    expect(validerDates("2026-07-23", "2026-07-26")).toBe(true);
  });

  test("Dates invalides : dateFin = dateDebut (0 jour)", () => {
    expect(validerDates("2026-07-23", "2026-07-23")).toBe(false);
  });

  test("Dates invalides : dateFin < dateDebut", () => {
    expect(validerDates("2026-07-26", "2026-07-23")).toBe(false);
  });

  test("Date manquante (null)", () => {
    expect(validerDates(null, "2026-07-26")).toBe(false);
  });

  test("Date manquante (undefined)", () => {
    expect(validerDates("2026-07-23", undefined)).toBe(false);
  });

  test("Format de date invalide", () => {
    expect(validerDates("pas-une-date", "2026-07-26")).toBe(false);
  });

  test("Date passée valide techniquement (contrôle métier séparé)", () => {
    // La validation de dates passées est gérée côté API, pas ici
    expect(validerDates("2020-01-01", "2020-01-05")).toBe(true);
  });
});

describe("Validation du nombre de voyageurs", () => {
  test("1 voyageur, capacité 5 → valide", () => {
    expect(validerPersonnes(1, 5)).toBe(true);
  });

  test("5 voyageurs, capacité 5 → valide (max)", () => {
    expect(validerPersonnes(5, 5)).toBe(true);
  });

  test("6 voyageurs, capacité 5 → invalide (dépassement)", () => {
    expect(validerPersonnes(6, 5)).toBe(false);
  });

  test("0 voyageur → invalide", () => {
    expect(validerPersonnes(0, 5)).toBe(false);
  });

  test("Nombre négatif → invalide", () => {
    expect(validerPersonnes(-1, 5)).toBe(false);
  });

  test("Nombre décimal → invalide", () => {
    expect(validerPersonnes(2.5, 5)).toBe(false);
  });

  test("Chaîne de caractères convertible → valide", () => {
    expect(validerPersonnes("3", 5)).toBe(true);
  });
});

describe("Calcul bout en bout (scénario complet)", () => {
  test("Scénario Danielle : 100€/j × 2j = 200€, +20€ commission = 220€ total", () => {
    const sousTotal = calculerMontant(100, "2026-07-29", "2026-07-31");
    const total = calculerTotal(sousTotal);
    expect(sousTotal).toBe(200);
    expect(total).toBe(220);
  });

  test("Scénario semaine : 150€/j × 7j = 1050€, +105€ commission = 1155€ total", () => {
    const sousTotal = calculerMontant(150, "2026-08-01", "2026-08-08");
    const total = calculerTotal(sousTotal);
    expect(sousTotal).toBe(1050);
    expect(total).toBe(1155);
  });

  test("Dates invalides → montant 0 ou négatif ne peut pas survenir", () => {
    // Si les dates sont correctement validées, ce cas ne se produit pas
    const estValide = validerDates("2026-08-10", "2026-08-05");
    expect(estValide).toBe(false);
  });
});