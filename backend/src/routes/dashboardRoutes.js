const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Toutes les routes dashboard propriétaire
router.use(verifyToken);
router.use(authorizeRoles("proprietaire", "admin"));

router.get("/owner", dashboardController.getOwnerDashboard);
router.get("/owner/stats", dashboardController.getOwnerStats);

module.exports = router;