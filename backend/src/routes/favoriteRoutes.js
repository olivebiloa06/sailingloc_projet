const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/", favoriteController.getMyFavorites);
router.post("/toggle", favoriteController.toggleFavorite);
router.get("/check/:boatId", favoriteController.checkFavorite);

module.exports = router;