/**
 * Tests unitaires — Validation des données métier
 * Email, prix, champs bateau, plage de dates
 */

// ============================================================
// Fonctions de validation (extraites des validators du projet)
// ============================================================

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPrix(prix) {
  const n = Number(prix);
  return !isNaN(n) && n > 0 && n <= 100000;
}

function isValidCapacite(capacite) {
  const n = Number(capacite);
  return Number.isInteger(n) && n >= 1 && n <= 50;
}

function isValidLongueur(longueur) {
  const n = Number(longueur);
  return !isNaN(n) && n > 0 && n <= 200;
}

function isValidBoatType(type) {
  const types = ["voilier", "catamaran", "bateau_moteur", "yacht", "semi_rigide", "autre"];
  return types.includes(type);
}

function chevauchementDates(debut1, fin1, debut2, fin2) {
  const s1 = new Date(debut1);
  const e1 = new Date(fin1);
  const s2 = new Date(debut2);
  const e2 = new Date(fin2);
  return s1 < e2 && s2 < e1;
}

function datesDansPlage(dateDebut, dateFin, plageDebut, plageFin) {
  return new Date(dateDebut) >= new Date(plageDebut) &&
         new Date(dateFin) <= new Date(plageFin);
}

// ============================================================
// TESTS EMAIL
// ============================================================

describe("Validation email", () => {
  test("Email valide classique", () => {
    expect(isValidEmail("olive@gmail.com")).toBe(true);
  });

  test("Email avec sous-domaine", () => {
    expect(isValidEmail("user@mail.domain.fr")).toBe(true);
  });

  test("Email sans @", () => {
    expect(isValidEmail("pasdearobase.com")).toBe(false);
  });

  test("Email sans domaine", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  test("Email sans nom", () => {
    expect(isValidEmail("@domain.com")).toBe(false);
  });

  test("Email vide", () => {
    expect(isValidEmail("")).toBe(false);
  });

  test("Email null", () => {
    expect(isValidEmail(null)).toBe(false);
  });

  test("Email avec espaces", () => {
    expect(isValidEmail("user @domain.com")).toBe(false);
  });

  test("Email demo SailingLoc valide", () => {
    expect(isValidEmail("sophie.martin@demo.sailingloc.com")).toBe(true);
  });
});

// ============================================================
// TESTS PRIX
// ============================================================

describe("Validation du prix par jour", () => {
  test("Prix valide : 100€", () => {
    expect(isValidPrix(100)).toBe(true);
  });

  test("Prix valide : 0.5€ (location très courte)", () => {
    expect(isValidPrix(0.5)).toBe(true);
  });

  test("Prix zéro → invalide", () => {
    expect(isValidPrix(0)).toBe(false);
  });

  test("Prix négatif → invalide", () => {
    expect(isValidPrix(-50)).toBe(false);
  });

  test("Prix trop élevé (> 100000€) → invalide", () => {
    expect(isValidPrix(100001)).toBe(false);
  });

  test("Prix en string convertible → valide", () => {
    expect(isValidPrix("200")).toBe(true);
  });

  test("Prix non numérique → invalide", () => {
    expect(isValidPrix("abc")).toBe(false);
  });

  test("Prix null → invalide", () => {
    expect(isValidPrix(null)).toBe(false);
  });
});

// ============================================================
// TESTS CAPACITÉ BATEAU
// ============================================================

describe("Validation de la capacité du bateau", () => {
  test("Capacité valide : 5 personnes", () => {
    expect(isValidCapacite(5)).toBe(true);
  });

  test("Capacité minimale : 1 personne", () => {
    expect(isValidCapacite(1)).toBe(true);
  });

  test("Capacité maximale : 50 personnes", () => {
    expect(isValidCapacite(50)).toBe(true);
  });

  test("Capacité zéro → invalide", () => {
    expect(isValidCapacite(0)).toBe(false);
  });

  test("Capacité > 50 → invalide", () => {
    expect(isValidCapacite(51)).toBe(false);
  });

  test("Capacité décimale → invalide", () => {
    expect(isValidCapacite(3.5)).toBe(false);
  });
});

// ============================================================
// TESTS TYPE DE BATEAU
// ============================================================

describe("Validation du type de bateau", () => {
  test("voilier → valide", () => expect(isValidBoatType("voilier")).toBe(true));
  test("catamaran → valide", () => expect(isValidBoatType("catamaran")).toBe(true));
  test("bateau_moteur → valide", () => expect(isValidBoatType("bateau_moteur")).toBe(true));
  test("yacht → valide", () => expect(isValidBoatType("yacht")).toBe(true));
  test("semi_rigide → valide", () => expect(isValidBoatType("semi_rigide")).toBe(true));
  test("autre → valide", () => expect(isValidBoatType("autre")).toBe(true));
  test("sous-marin → invalide", () => expect(isValidBoatType("sous-marin")).toBe(false));
  test("chaîne vide → invalide", () => expect(isValidBoatType("")).toBe(false));
  test("null → invalide", () => expect(isValidBoatType(null)).toBe(false));
});

// ============================================================
// TESTS CHEVAUCHEMENT DE DATES
// ============================================================

describe("Détection de chevauchement de réservations", () => {
  test("Réservations sans chevauchement (avant)", () => {
    expect(chevauchementDates(
      "2026-07-01", "2026-07-05",
      "2026-07-06", "2026-07-10"
    )).toBe(false);
  });

  test("Réservations sans chevauchement (après)", () => {
    expect(chevauchementDates(
      "2026-07-10", "2026-07-15",
      "2026-07-01", "2026-07-09"
    )).toBe(false);
  });

  test("Chevauchement partiel au début", () => {
    expect(chevauchementDates(
      "2026-07-01", "2026-07-08",
      "2026-07-05", "2026-07-12"
    )).toBe(true);
  });

  test("Chevauchement partiel à la fin", () => {
    expect(chevauchementDates(
      "2026-07-05", "2026-07-12",
      "2026-07-01", "2026-07-08"
    )).toBe(true);
  });

  test("Chevauchement total (réservation 2 dans réservation 1)", () => {
    expect(chevauchementDates(
      "2026-07-01", "2026-07-15",
      "2026-07-05", "2026-07-10"
    )).toBe(true);
  });

  test("Dates identiques → chevauchement", () => {
    expect(chevauchementDates(
      "2026-07-01", "2026-07-05",
      "2026-07-01", "2026-07-05"
    )).toBe(true);
  });
});

describe("Validation dates dans la plage de disponibilité", () => {
  test("Réservation dans la plage → valide", () => {
    expect(datesDansPlage(
      "2026-07-20", "2026-07-25",
      "2026-07-16", "2026-07-31"
    )).toBe(true);
  });

  test("Réservation commence avant la plage → invalide", () => {
    expect(datesDansPlage(
      "2026-07-10", "2026-07-20",
      "2026-07-16", "2026-07-31"
    )).toBe(false);
  });

  test("Réservation finit après la plage → invalide", () => {
    expect(datesDansPlage(
      "2026-07-20", "2026-08-05",
      "2026-07-16", "2026-07-31"
    )).toBe(false);
  });

  test("Réservation = plage exacte → valide", () => {
    expect(datesDansPlage(
      "2026-07-16", "2026-07-31",
      "2026-07-16", "2026-07-31"
    )).toBe(true);
  });
});