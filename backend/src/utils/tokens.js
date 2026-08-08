const crypto = require("crypto");

// Durée de vie des tokens — alignée sur le cahier des charges (page 92) :
// access token court (15 min), refresh token plus long (7 jours).
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const REFRESH_COOKIE_NAME = "refreshToken";

// Génère un refresh token opaque (aléatoire, non signé) et son hash SHA-256.
// On ne stocke jamais le token en clair en base : seul le hash est conservé,
// ce qui évite qu'une fuite de la base de données permette de réutiliser les
// refresh tokens existants (même logique qu'un mot de passe haché).
function createRefreshToken() {
  const raw = crypto.randomBytes(64).toString("hex");
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  return { raw, hash, expiresAt };
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Options du cookie HttpOnly contenant le refresh token.
// - httpOnly : inaccessible en JavaScript côté client (protection XSS)
// - sameSite "strict" : le cookie n'est envoyé que sur des requêtes
//   same-site, ce qui mitige les attaques CSRF sur /refresh et /logout
// - secure : uniquement sur HTTPS en production (en dev, http://localhost
//   reste autorisé par les navigateurs modernes même avec un cookie "Secure"
//   tant qu'on est sur localhost, mais on désactive explicitement pour éviter
//   toute surprise sur un environnement de dev non-localhost)
function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_MS,
  };
}

module.exports = {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS,
  REFRESH_COOKIE_NAME,
  createRefreshToken,
  hashToken,
  refreshCookieOptions,
};