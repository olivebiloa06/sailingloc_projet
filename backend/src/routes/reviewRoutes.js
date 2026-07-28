const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public — tous les avis (homepage + page Avis)
router.get("/", reviewController.getAllReviews);

// Public — avis d'un bateau spécifique (fiche bateau + notes sur les cartes)
router.get("/boat/:boatId", reviewController.getReviewsByBoat);

// Authentifié — laisser un avis après une réservation confirmée
router.post("/", verifyToken, reviewController.createReview);

module.exports = router;