const express = require("express");
const router = express.Router();

const boatController = require("../controllers/boatController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Routes publiques
router.get("/", boatController.getAllBoats);
router.get("/:id", boatController.getBoatById);

// Routes protégées propriétaire/admin
router.post(
  "/",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  boatController.createBoat
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  boatController.updateBoat
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("proprietaire", "admin"),
  boatController.deleteBoat
);

module.exports = router;