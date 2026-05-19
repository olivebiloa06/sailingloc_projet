const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/bookingController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Créer réservation
router.post(
  "/",
  verifyToken,
  authorizeRoles("locataire", "admin"),
  bookingController.createBooking
);

// Mes réservations
router.get(
  "/mes-reservations",
  verifyToken,
  bookingController.getMyBookings
);

// Annuler réservation
router.put(
  "/cancel/:id",
  verifyToken,
  bookingController.cancelBooking
);

module.exports = router;