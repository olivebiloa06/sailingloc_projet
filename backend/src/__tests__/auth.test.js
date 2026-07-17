/**
 * Tests unitaires — Authentification JWT
 * Génération, vérification, expiration, token invalide
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ============================================================
// Fonctions extraites de authController.js
// ============================================================

const JWT_SECRET = "test_secret_sailingloc_jest";
const JWT_REFRESH_SECRET = "test_refresh_secret_jest";

function genererAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

function genererRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

function verifierAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifierPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

// ============================================================
// TESTS JWT
// ============================================================

describe("Génération de tokens JWT", () => {
  test("genererAccessToken retourne un string non vide", () => {
    const token = genererAccessToken({ id: 1, role: "locataire" });
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  test("Le token a 3 parties séparées par des points", () => {
    const token = genererAccessToken({ id: 1, role: "locataire" });
    expect(token.split(".").length).toBe(3);
  });

  test("genererRefreshToken retourne un token différent", () => {
    const payload = { id: 1 };
    const access = genererAccessToken(payload);
    const refresh = genererRefreshToken(payload);
    expect(access).not.toBe(refresh);
  });
});

describe("Vérification de tokens JWT", () => {
  test("Token valide : payload extrait correctement", () => {
    const payload = { id: 42, role: "proprietaire", email: "test@test.fr" };
    const token = genererAccessToken(payload);
    const decoded = verifierAccessToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe("proprietaire");
  });

  test("Token invalide (falsifié) → lève une erreur", () => {
    expect(() => verifierAccessToken("token.faux.invalide")).toThrow();
  });

  test("Token avec mauvaise signature → lève JsonWebTokenError", () => {
    const token = jwt.sign({ id: 1 }, "mauvaise_cle");
    expect(() => verifierAccessToken(token)).toThrow(jwt.JsonWebTokenError);
  });

  test("Token expiré → lève TokenExpiredError", () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: "-1s" });
    expect(() => verifierAccessToken(token)).toThrow(jwt.TokenExpiredError);
  });

  test("Token vide → lève une erreur", () => {
    expect(() => verifierAccessToken("")).toThrow();
  });

  test("Token null → lève une erreur", () => {
    expect(() => verifierAccessToken(null)).toThrow();
  });
});

describe("Rôles dans le token", () => {
  test("Rôle locataire encodé correctement", () => {
    const token = genererAccessToken({ id: 1, role: "locataire" });
    const decoded = verifierAccessToken(token);
    expect(decoded.role).toBe("locataire");
  });

  test("Rôle proprietaire encodé correctement", () => {
    const token = genererAccessToken({ id: 2, role: "proprietaire" });
    const decoded = verifierAccessToken(token);
    expect(decoded.role).toBe("proprietaire");
  });

  test("Rôle admin encodé correctement", () => {
    const token = genererAccessToken({ id: 3, role: "admin" });
    const decoded = verifierAccessToken(token);
    expect(decoded.role).toBe("admin");
  });

  test("Rôle inconnu conservé tel quel", () => {
    const token = genererAccessToken({ id: 4, role: "superadmin" });
    const decoded = verifierAccessToken(token);
    expect(decoded.role).toBe("superadmin");
  });
});

// ============================================================
// TESTS BCRYPT
// ============================================================

describe("Hash et vérification de mot de passe (bcrypt)", () => {
  test("Le hash est différent du mot de passe en clair", () => {
    const hash = hashPassword("MonMotDePasse123!");
    expect(hash).not.toBe("MonMotDePasse123!");
  });

  test("Le hash fait plus de 50 caractères", () => {
    const hash = hashPassword("test");
    expect(hash.length).toBeGreaterThan(50);
  });

  test("Mot de passe correct → verifierPassword retourne true", () => {
    const hash = hashPassword("Sailingloc2026!");
    expect(verifierPassword("Sailingloc2026!", hash)).toBe(true);
  });

  test("Mauvais mot de passe → verifierPassword retourne false", () => {
    const hash = hashPassword("Sailingloc2026!");
    expect(verifierPassword("MauvaisMotDePasse", hash)).toBe(false);
  });

  test("Mot de passe vide → false contre un hash valide", () => {
    const hash = hashPassword("Sailingloc2026!");
    expect(verifierPassword("", hash)).toBe(false);
  });

  test("Deux hashes du même mot de passe sont différents (salt aléatoire)", () => {
    const hash1 = hashPassword("memeMotDePasse");
    const hash2 = hashPassword("memeMotDePasse");
    expect(hash1).not.toBe(hash2);
  });

  test("Les deux hashes sont quand même valides", () => {
    const hash1 = hashPassword("memeMotDePasse");
    const hash2 = hashPassword("memeMotDePasse");
    expect(verifierPassword("memeMotDePasse", hash1)).toBe(true);
    expect(verifierPassword("memeMotDePasse", hash2)).toBe(true);
  });
});

describe("Sécurité — validation format mot de passe", () => {
  function validerFormatMotDePasse(mdp) {
    if (!mdp || mdp.length < 8) return false;
    if (!/[A-Z]/.test(mdp)) return false;
    if (!/[0-9]/.test(mdp)) return false;
    return true;
  }

  test("Mot de passe valide : 8+ car, majuscule, chiffre", () => {
    expect(validerFormatMotDePasse("Sailing2026")).toBe(true);
  });

  test("Trop court (< 8 caractères) → invalide", () => {
    expect(validerFormatMotDePasse("Ab1")).toBe(false);
  });

  test("Pas de majuscule → invalide", () => {
    expect(validerFormatMotDePasse("sailing2026")).toBe(false);
  });

  test("Pas de chiffre → invalide", () => {
    expect(validerFormatMotDePasse("SailingLoc!")).toBe(false);
  });

  test("Mot de passe vide → invalide", () => {
    expect(validerFormatMotDePasse("")).toBe(false);
  });

  test("null → invalide", () => {
    expect(validerFormatMotDePasse(null)).toBe(false);
  });
});