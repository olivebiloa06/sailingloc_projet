const express = require("express");
const router = express.Router();

const contractController = require("../controllers/contractController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Générer un contrat pour une réservation confirmée
router.post(
  "/generate/:bookingId",
  verifyToken,
  contractController.generateContract
);

// Voir mes contrats
router.get(
  "/my-contracts",
  verifyToken,
  contractController.getMyContracts
);

// Voir un contrat précis
router.get(
  "/:id",
  verifyToken,
  contractController.getContractById
);

// Télécharger le fichier PDF réel du contrat (vérification de propriété
// dans le contrôleur, jamais de service statique)
router.get(
  "/:id/file",
  verifyToken,
  contractController.getContractFile
);

module.exports = router;