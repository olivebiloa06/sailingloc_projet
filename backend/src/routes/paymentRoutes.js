const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Encaissement manuel — réservé admin (ex. règlement par virement/espèces
// hors plateforme). Ne JAMAIS exposer ça à un locataire : voir
// paymentController.markBookingAsPaidManually pour le détail du correctif.
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

// NOTE IMPORTANTE : la route POST /stripe/webhook n'est plus définie ici.
// Elle est montée une seule fois dans server.js, avant express.json(), avec
// express.raw() — condition indispensable pour que la vérification de
// signature Stripe fonctionne. La redéfinir ici recréerait le bug de double
// montage corrigé (voir le commentaire dans server.js).

module.exports = router;


// Confirmation de secours depuis la page de succès (si webhook lent)
router.get(
  "/stripe/confirm/:sessionId",
  verifyToken,
  paymentController.confirmStripeSession
);