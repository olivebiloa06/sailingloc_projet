const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

const { verifyToken } = require("../middlewares/authMiddleware");

// Payer réservation
router.post(
  "/pay/:bookingId",
  verifyToken,
  paymentController.payBooking
);

// Voir mes paiements
router.get(
  "/my-payments",
  verifyToken,
  paymentController.getMyPayments
);

module.exports = router;