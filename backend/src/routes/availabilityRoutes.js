const express = require("express");
const router = express.Router();

const availabilityController = require("../controllers/availabilityController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Public
router.get("/boat/:boatId", availabilityController.getAvailabilitiesByBoat);

// Propriétaire / admin
router.post(
  "/",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  availabilityController.createAvailability
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  availabilityController.updateAvailability
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  availabilityController.deleteAvailability
);

module.exports = router;