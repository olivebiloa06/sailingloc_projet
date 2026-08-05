const fs = require("fs");
const path = require("path");
const { Boat } = require("../models");
const { isFileSignatureValid } = require("../utils/fileSignature");
const { cloudinary } = require("../middlewares/uploadMiddleware");

const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

// Upload image bateau
exports.uploadBoatImage = async (req, res) => {
  try {
    const { boatId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const boat = await Boat.findByPk(boatId);
    if (!boat) {
      // Supprime le fichier uploadé si le bateau n'existe pas
      if (!isProduction && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Bateau introuvable" });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      if (!isProduction && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Accès interdit : vous n'êtes pas propriétaire de ce bateau" });
    }

    let fileUrl;

    if (isProduction) {
      // Cloudinary — l'URL est directement dans req.file.path (URL Cloudinary)
      fileUrl = req.file.path;
    } else {
      // Local — vérification magic bytes + URL relative
      if (!isFileSignatureValid(req.file.path, req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Le contenu du fichier ne correspond pas au type déclaré." });
      }
      fileUrl = `/uploads/boats/${req.file.filename}`;
    }

    // Supprime l'ancienne image Cloudinary si elle existe
    if (isProduction && boat.imageUrl && boat.imageUrl.includes("cloudinary")) {
      try {
        const publicId = boat.imageUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`sailingloc/boats/${publicId}`);
      } catch {
        // Pas bloquant si la suppression échoue
      }
    }

    await boat.update({ imageUrl: fileUrl });

    return res.status(200).json({
      message: "Image du bateau uploadée avec succès",
      imageUrl: fileUrl,
      boat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Supprimer image bateau
exports.deleteBoatImage = async (req, res) => {
  try {
    const { boatId } = req.params;

    const boat = await Boat.findByPk(boatId);
    if (!boat) return res.status(404).json({ message: "Bateau introuvable" });

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }

    if (boat.imageUrl) {
      if (isProduction && boat.imageUrl.includes("cloudinary")) {
        // Supprime sur Cloudinary
        try {
          const publicId = boat.imageUrl.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(`sailingloc/boats/${publicId}`);
        } catch {
          // Pas bloquant
        }
      } else {
        // Supprime en local
        const resolvedPath = path.join(__dirname, "../../", boat.imageUrl);
        const boatsDir = path.join(__dirname, "../../uploads/boats");
        if (resolvedPath.startsWith(boatsDir) && fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
      }
    }

    await boat.update({ imageUrl: null });

    return res.status(200).json({ message: "Image supprimée avec succès", boat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};