const express = require("express");
const router = express.Router();

const documentController = require("../controllers/documentController");
const { uploadDocument } = require("../middlewares/uploadMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

// Ajouter un document — upload réel (multipart/form-data, champ "document"),
// plus de champ "url" arbitraire envoyé par le client.
router.post(
  "/",
  verifyToken,
  uploadDocument.single("document"),
  documentController.createDocument
);

// Voir mes documents
router.get(
  "/my-documents",
  verifyToken,
  documentController.getMyDocuments
);

// Voir les documents d'un bateau — vérifie maintenant la propriété du bateau
// (voir documentController.getDocumentsByBoat, faille IDOR corrigée)
router.get(
  "/boat/:boatId",
  verifyToken,
  documentController.getDocumentsByBoat
);

// Télécharger le fichier réel d'un document — seul point d'accès au contenu,
// remplace l'ancien accès statique public (voir documentController.getDocumentFile)
router.get(
  "/:id/file",
  verifyToken,
  documentController.getDocumentFile
);

// Admin — tous les documents en attente de validation
router.get(
  "/admin/pending",
  verifyToken,
  documentController.getAllPendingDocuments
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