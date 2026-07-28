const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Toutes les routes admin sont protégées
router.use(verifyToken);
router.use(authorizeRoles("admin"));

// Utilisateurs
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

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
// Route publique — renvoie l'ID de l'admin pour la messagerie de contact
// Pas d'authentification requise (le formulaire de contact est public).
router.get("/info", async (req, res) => {
  const { User } = require("../models");
  try {
    const admin = await User.findOne({ where: { role: "admin" }, attributes: ["id"] });
    return res.status(200).json({ adminId: admin?.id || 1 });
  } catch {
    return res.status(200).json({ adminId: 1 });
  }
});