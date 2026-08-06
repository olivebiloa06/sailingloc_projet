const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Encaissement manuel — admin uniquement
router.post(
  "/pay/:bookingId",
  verifyToken,
  authorizeRoles("admin"),
  paymentController.markBookingAsPaidManually
);

router.post(
  "/stripe/create-session/:bookingId",
  verifyToken,
  paymentController.createStripeSession
);

router.post(
  "/paypal/create-order/:bookingId",
  verifyToken,
  paymentController.createPaypalOrder
);

router.post(
  "/paypal/capture/:orderId",
  verifyToken,
  paymentController.capturePaypalOrder
);

router.get(
  "/my-payments",
  verifyToken,
  paymentController.getMyPayments
);

// Confirmation Stripe — SANS verifyToken
// Après redirect depuis checkout.stripe.com, le cookie n'est pas encore
// restauré. La session Stripe est la preuve suffisante du paiement.
router.get(
  "/stripe/confirm/:sessionId",
  paymentController.confirmStripeSession
);

module.exports = router;