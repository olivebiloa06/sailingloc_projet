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

module.exports = router;