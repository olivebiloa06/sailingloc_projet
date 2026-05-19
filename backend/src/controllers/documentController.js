const { Document, Boat } = require("../models");

// Ajouter un document
exports.createDocument = async (req, res) => {
  try {
    const { nom, type, url, boatId } = req.body;

    if (boatId) {
      const boat = await Boat.findByPk(boatId);

      if (!boat) {
        return res.status(404).json({
          message: "Bateau introuvable",
        });
      }

      if (boat.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
        });
      }
    }

    const document = await Document.create({
      nom,
      type,
      url,
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

// Voir mes documents
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

// Voir les documents d’un bateau
exports.getDocumentsByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;

    const documents = await Document.findAll({
      where: {
        boatId,
      },
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

// Valider / refuser un document
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

// Supprimer un document
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