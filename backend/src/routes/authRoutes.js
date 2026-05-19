const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Auth publique
router.post("/register", authController.register);
router.post("/login", authController.login);

// Route protégée : utilisateur connecté
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Profil utilisateur connecté",
    user: req.user,
  });
});

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