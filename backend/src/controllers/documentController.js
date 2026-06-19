const fs = require("fs");
const path = require("path");
const { Document, Boat } = require("../models");
const { isFileSignatureValid } = require("../utils/fileSignature");
const { DOCUMENTS_DIR } = require("../middlewares/uploadMiddleware");

// Un document appartient à son uploader (userId). S'il est aussi lié à un
// bateau (boatId), seul le propriétaire de CE bateau ou un admin peut le
// consulter — jamais un simple locataire connecté.
const canAccessDocument = (document, user) => {
  if (user.role === "admin") return true;
  if (document.userId === user.id) return true;
  return false;
};

const canAccessBoatDocuments = (boat, user) => {
  if (user.role === "admin") return true;
  return boat.userId === user.id;
};

// =========================
// AJOUTER UN DOCUMENT (upload réel, plus de "url" arbitraire envoyée par le client)
// =========================
// Avant correction, cette route acceptait { nom, type, url, boatId } en JSON :
// le champ "url" était une simple chaîne fournie par le client, sans aucun
// fichier réellement uploadé ni vérifié. Elle accepte maintenant un vrai
// fichier (multipart/form-data, voir documentRoutes.js + uploadMiddleware),
// vérifié par signature de fichier (magic bytes), stocké dans un dossier
// jamais exposé publiquement.
exports.createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier envoyé",
      });
    }

    if (!isFileSignatureValid(req.file.path, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Le contenu du fichier ne correspond pas au type déclaré.",
      });
    }

    const { nom, type, boatId } = req.body;

    if (!nom || !type) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "nom et type sont obligatoires.",
      });
    }

    if (boatId) {
      const boat = await Boat.findByPk(boatId);

      if (!boat) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          message: "Bateau introuvable",
        });
      }

      if (boat.userId !== req.user.id && req.user.role !== "admin") {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
        });
      }
    }

    // On ne stocke qu'un chemin relatif interne, jamais une URL publique :
    // le fichier n'est récupérable que via GET /api/documents/:id/file,
    // après vérification d'authentification + de propriété.
    const document = await Document.create({
      nom,
      type,
      url: req.file.filename,
      boatId: boatId || null,
      userId: req.user.id,
      statutValidation: "en_attente",
    });

    return res.status(201).json({
      message: "Document ajouté avec succès",
      document,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// VOIR MES DOCUMENTS
// =========================

exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Mes documents récupérés avec succès",
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// VOIR LES DOCUMENTS D'UN BATEAU
// =========================
// FAILLE CRITIQUE CORRIGÉE : cette route ne vérifiait ni que l'appelant était
// propriétaire du bateau, ni qu'il était admin — n'importe quel locataire
// connecté pouvait lister les documents d'identité de n'importe quel
// propriétaire (permis bateau, pièce d'identité, assurance...).
exports.getDocumentsByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;

    const boat = await Boat.findByPk(boatId);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (!canAccessBoatDocuments(boat, req.user)) {
      return res.status(403).json({
        message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
      });
    }

    const documents = await Document.findAll({
      where: { boatId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Documents du bateau récupérés avec succès",
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// TÉLÉCHARGER LE FICHIER D'UN DOCUMENT
// =========================
// Seul point d'accès au contenu réel du fichier. Remplace l'ancien
// app.use("/uploads", express.static(...)) qui servait TOUS les fichiers
// (y compris les documents personnels) sans la moindre authentification :
// n'importe qui connaissant ou devinant une URL pouvait télécharger un
// permis bateau ou une pièce d'identité sans même être connecté.
exports.getDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable",
      });
    }

    if (!canAccessDocument(document, req.user)) {
      return res.status(403).json({
        message: "Accès interdit : ce document ne vous appartient pas",
      });
    }

    const filePath = path.join(DOCUMENTS_DIR, document.url);

    // Garde-fou anti-traversée de chemin : le fichier résolu doit rester
    // strictement à l'intérieur du dossier des documents.
    if (!filePath.startsWith(DOCUMENTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Fichier introuvable",
      });
    }

    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// VALIDER / REFUSER UN DOCUMENT — admin
// =========================

exports.validateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { statutValidation, commentaireAdmin } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : réservé à l’administrateur",
      });
    }

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable",
      });
    }

    if (!["valide", "refuse"].includes(statutValidation)) {
      return res.status(400).json({
        message: "Statut invalide. Valeurs acceptées : valide, refuse",
      });
    }

    await document.update({
      statutValidation,
      commentaireAdmin,
    });

    return res.status(200).json({
      message: "Statut du document mis à jour",
      document,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// SUPPRIMER UN DOCUMENT
// =========================

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        message: "Document introuvable",
      });
    }

    if (document.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous ne pouvez pas supprimer ce document",
      });
    }

    const filePath = path.join(DOCUMENTS_DIR, document.url);
    if (filePath.startsWith(DOCUMENTS_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();

    return res.status(200).json({
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};