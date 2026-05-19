const express = require("express");
const router = express.Router();

const documentController = require("../controllers/documentController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Ajouter un document
router.post(
  "/",
  verifyToken,
  documentController.createDocument
);

// Voir mes documents
router.get(
  "/my-documents",
  verifyToken,
  documentController.getMyDocuments
);

// Voir les documents d’un bateau
router.get(
  "/boat/:boatId",
  verifyToken,
  documentController.getDocumentsByBoat
);

// Valider / refuser un document — admin
router.patch(
  "/:id/validate",
  verifyToken,
  documentController.validateDocument
);

// Supprimer un document
router.delete(
  "/:id",
  verifyToken,
  documentController.deleteDocument
);

module.exports = router;