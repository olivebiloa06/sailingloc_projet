const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Le rate limit global de server.js (100 req/15min sur toute l'API) ne suffit
// pas à freiner le brute-force sur /login. Le cahier des charges (page 92)
// prévoit explicitement une limite de 5 tentatives de connexion / 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite un peu plus large sur l'inscription (anti-spam de comptes), sans
// pénaliser un utilisateur qui corrige une faute de frappe dans son formulaire.
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Trop de tentatives d'inscription. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite anti-spam sur le reset password : un attaquant ne doit pas pouvoir
// déclencher des milliers d'emails depuis la même IP.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Trop de demandes de réinitialisation. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth publique
router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);

// Réinitialisation de mot de passe
router.post("/forgot-password", resetLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Renouvellement de l'access token à partir du refresh token (cookie HttpOnly)
router.post("/refresh", authController.refresh);

// Déconnexion : révoque le refresh token courant
router.post("/logout", authController.logout);

// Route protégée : utilisateur connecté (renvoie le profil à jour depuis la
// base de données, pas seulement le contenu — potentiellement obsolète — du
// token)
router.get("/profile", verifyToken, authController.getProfile);

// Route protégée : propriétaire seulement
router.get(
  "/owner-only",
  verifyToken,
  authorizeRoles("proprietaire"),
  (req, res) => {
    res.status(200).json({
      message: "Accès propriétaire autorisé",
      user: req.user,
    });
  }
);

// Route protégée : admin seulement
router.get(
  "/admin-only",
  verifyToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Accès administrateur autorisé",
      user: req.user,
    });
  }
);

module.exports = router;