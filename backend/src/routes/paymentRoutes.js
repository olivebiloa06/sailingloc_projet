const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post(
  "/pay/:bookingId",
  verifyToken,
  paymentController.payBooking
);

router.post(
  "/stripe/create-session/:bookingId",
  verifyToken,
  paymentController.createStripeSession
);

router.get(
  "/my-payments",
  verifyToken,
  paymentController.getMyPayments
);

router.post(
  "/stripe/webhook",
  paymentController.stripeWebhook
);

module.exports = router;