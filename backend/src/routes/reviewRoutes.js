const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Créer un avis
router.post(
  "/",
  verifyToken,
  reviewController.createReview
);

// Voir les avis d’un bateau
router.get(
  "/boat/:boatId",
  reviewController.getReviewsByBoat
);

// Voir mes avis
router.get(
  "/my-reviews",
  verifyToken,
  reviewController.getMyReviews
);

// Supprimer un avis
router.delete(
  "/:id",
  verifyToken,
  reviewController.deleteReview
);

module.exports = router;