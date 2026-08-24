/**
 * Tests unitaires — Authentification JWT
 * Génération, vérification, expiration, token invalide
 *
 * genererAccessToken/verifierAccessToken utilisent le vrai
 * generateAccessToken exporté par authController.js (et jwt.verify avec
 * process.env.JWT_SECRET, exactement comme authMiddleware.js) : ces tests
 * vérifient le code réellement exécuté en production, pas une copie.
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateAccessToken: genererAccessToken, sanitizeUser } = require("../controllers/authController");
const { validatePasswordFormat } = require("../utils/validators");

function verifierAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
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

});

// Les refresh tokens ne sont PAS des JWT : ce sont des tokens opaques
// aléatoires (voir utils/tokens.js), stockés hachés en base — un JWT signé
// pourrait être décodé et inspecté par le client, un token opaque non.
describe("Génération du refresh token opaque (createRefreshToken)", () => {
  const { createRefreshToken } = require("../utils/tokens");

  test("Le token brut et son hash sont différents", () => {
    const { raw, hash } = createRefreshToken();
    expect(raw).not.toBe(hash);
  });

  test("Deux appels génèrent des tokens différents (aléatoire)", () => {
    const a = createRefreshToken();
    const b = createRefreshToken();
    expect(a.raw).not.toBe(b.raw);
  });

  test("La date d'expiration est dans le futur (~7 jours)", () => {
    const { expiresAt } = createRefreshToken();
    const joursRestants = (expiresAt - new Date()) / (1000 * 60 * 60 * 24);
    expect(joursRestants).toBeGreaterThan(6.9);
    expect(joursRestants).toBeLessThan(7.1);
  });

  test("Le hash est stable pour un même token brut (sha256)", () => {
    const { hashToken } = require("../utils/tokens");
    const { raw, hash } = createRefreshToken();
    expect(hashToken(raw)).toBe(hash);
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
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "-1s" });
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

// Utilise le vrai validatePasswordFormat de src/utils/validators.js, branché
// sur authController.register ET resetPassword — y compris l'exigence de
// caractère spécial, absente de l'ancienne copie de ce test.
describe("Sécurité — validation format mot de passe (validatePasswordFormat)", () => {
  test("Mot de passe valide : 8+ car, majuscule, chiffre, caractère spécial", () => {
    expect(validatePasswordFormat("Sailing2026!").valid).toBe(true);
  });

  test("Trop court (< 8 caractères) → invalide", () => {
    expect(validatePasswordFormat("Ab1!").valid).toBe(false);
  });

  test("Pas de majuscule → invalide", () => {
    expect(validatePasswordFormat("sailing2026!").valid).toBe(false);
  });

  test("Pas de chiffre → invalide", () => {
    expect(validatePasswordFormat("SailingLoc!").valid).toBe(false);
  });

  test("Pas de caractère spécial → invalide", () => {
    expect(validatePasswordFormat("Sailing2026").valid).toBe(false);
  });

  test("Mot de passe vide → invalide", () => {
    expect(validatePasswordFormat("").valid).toBe(false);
  });

  test("null → invalide", () => {
    expect(validatePasswordFormat(null).valid).toBe(false);
  });
});

// sanitizeUser est la seule barrière entre la base (motDePasse haché) et la
// réponse JSON envoyée au client — un oubli ici ferait fuiter le hash.
describe("sanitizeUser — le hash du mot de passe ne sort jamais", () => {
  const fakeUser = {
    toJSON: () => ({
      id: 7,
      nom: "Martin",
      prenom: "Sophie",
      email: "sophie@test.fr",
      motDePasse: "$2a$10$hashedvaluehere",
      role: "locataire",
    }),
  };

  test("motDePasse est absent du résultat", () => {
    const safe = sanitizeUser(fakeUser);
    expect(safe.motDePasse).toBeUndefined();
  });

  test("Les autres champs sont conservés", () => {
    const safe = sanitizeUser(fakeUser);
    expect(safe.email).toBe("sophie@test.fr");
    expect(safe.role).toBe("locataire");
  });
});