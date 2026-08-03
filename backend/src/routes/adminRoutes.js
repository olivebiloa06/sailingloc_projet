const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Route publique — renvoie l'ID de l'admin pour la messagerie de contact.
// Pas d'authentification requise (le formulaire de contact est public).
// DOIT être déclarée AVANT les router.use(verifyToken)/authorizeRoles
// ci-dessous : ces derniers s'appliquent à toute route déclarée après eux sur
// ce router, donc les déclarer avant "/info" la rendrait admin-only malgré ce
// commentaire (un visiteur non connecté recevrait un 401, ce qui déclenche en
// plus une redirection forcée vers /login côté frontend — voir l'intercepteur
// axios dans services/api.js).
router.get("/info", async (req, res) => {
  const { User } = require("../models");
  try {
    const admin = await User.findOne({ where: { role: "admin" }, attributes: ["id"] });
    return res.status(200).json({ adminId: admin?.id || 1 });
  } catch {
    return res.status(200).json({ adminId: 1 });
  }
});

// Toutes les routes ci-dessous sont protégées (admin uniquement)
router.use(verifyToken);
router.use(authorizeRoles("admin"));

// Utilisateurs
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

// Bateaux
router.get("/boats", adminController.getAllBoats);

// Réservations
router.get("/bookings", adminController.getAllBookings);

// Paiements
router.get("/payments", adminController.getAllPayments);

// Documents
router.get("/documents", adminController.getAllDocuments);

// Avis
router.get("/reviews", adminController.getAllReviews);
router.delete("/reviews/:id", adminController.deleteReview);

module.exports = router;