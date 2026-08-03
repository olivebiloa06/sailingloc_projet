const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/bookingController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Créer réservation — ouvert à tous les rôles connectés : un propriétaire
// peut aussi louer le bateau d'un autre propriétaire. La règle "ne pas
// réserver son propre bateau" est gérée dans createBooking (isOwnBoat check).
router.post(
  "/",
  verifyToken,
  bookingController.createBooking
);

// Mes réservations
router.get(
  "/mes-reservations",
  verifyToken,
  bookingController.getMyBookings
);

// Demandes de réservation reçues sur mes bateaux (propriétaire)
// IMPORTANT : doit être déclarée AVANT "/:id" plus bas, sinon Express
// matcherait "/owner/demandes" sur "/:id" en traitant "owner" comme un
// identifiant de réservation.
router.get(
  "/owner/demandes",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  bookingController.getOwnerBookingRequests
);

// Détail d'une réservation (vérification de propriété dans le contrôleur)
router.get(
  "/:id",
  verifyToken,
  bookingController.getBookingById
);

// Accepter / refuser une demande (propriétaire du bateau concerné)
router.put(
  "/:id/repondre",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  bookingController.respondToBookingRequest
);

// Annuler réservation
router.put(
  "/cancel/:id",
  verifyToken,
  bookingController.cancelBooking
);

module.exports = router;