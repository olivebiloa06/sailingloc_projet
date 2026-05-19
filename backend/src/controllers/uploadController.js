const fs = require("fs");
const { Boat } = require("../models");

// Upload image bateau
exports.uploadBoatImage = async (req, res) => {
  try {
    const { boatId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier envoyé",
      });
    }

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

    const fileUrl = `/uploads/${req.file.filename}`;

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
      const filePath = "." + boat.imageUrl;

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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