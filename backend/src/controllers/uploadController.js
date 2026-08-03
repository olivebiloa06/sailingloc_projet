const fs = require("fs");
const path = require("path");
const { Boat } = require("../models");
const { isFileSignatureValid } = require("../utils/fileSignature");

// Upload image bateau
exports.uploadBoatImage = async (req, res) => {
  try {
    const { boatId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier envoyé",
      });
    }

    // Vérification du contenu réel du fichier (magic bytes), en plus du
    // mimetype déclaré déjà filtré par multer : le mimetype client est
    // falsifiable, pas les premiers octets du fichier lui-même.
    if (!isFileSignatureValid(req.file.path, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Le contenu du fichier ne correspond pas au type déclaré.",
      });
    }

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

    const fileUrl = `/uploads/boats/${req.file.filename}`;

    await boat.update({
      imageUrl: fileUrl,
    });

    return res.status(200).json({
      message: "Image du bateau uploadée avec succès",
      imageUrl: fileUrl,
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer image bateau
exports.deleteBoatImage = async (req, res) => {
  try {
    const { boatId } = req.params;

    const boat = await Boat.findByPk(boatId);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit",
      });
    }

    if (boat.imageUrl) {
      // boat.imageUrl est généré par le serveur lors de l'upload
      // (uploadBoatImage), jamais accepté tel quel depuis le body d'une
      // requête PUT (voir le correctif mass-assignment dans boatController),
      // donc pas de risque de traversée de chemin ici. On vérifie quand même
      // que le chemin résolu reste bien à l'intérieur du dossier attendu.
      const resolvedPath = path.join(
        __dirname,
        "../../",
        boat.imageUrl
      );
      const boatsDir = path.join(__dirname, "../../uploads/boats");

      if (resolvedPath.startsWith(boatsDir) && fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
      }
    }

    await boat.update({
      imageUrl: null,
    });

    return res.status(200).json({
      message: "Image supprimée avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};