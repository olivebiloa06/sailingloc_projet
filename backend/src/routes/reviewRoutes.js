const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public — utilisé sur la fiche bateau et pour la note sur les cartes
router.get("/boat/:boatId", reviewController.getReviewsByBoat);

// Authentifié — laisser un avis après une réservation confirmée
router.post("/", verifyToken, reviewController.createReview);

module.exports = router;