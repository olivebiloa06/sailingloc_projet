const fs = require("fs");
const path = require("path");
const { Document, Boat, User } = require("../models");
const { isFileSignatureValid } = require("../utils/fileSignature");
const { DOCUMENTS_DIR, cloudinary } = require("../middlewares/uploadMiddleware");

const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

const canAccessDocument = (document, user) => {
  if (user.role === "admin") return true;
  if (document.userId === user.id) return true;
  return false;
};

const canAccessBoatDocuments = (boat, user) => {
  if (user.role === "admin") return true;
  return boat.userId === user.id;
};

exports.createDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });

    if (!isProduction && !isFileSignatureValid(req.file.path, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Le contenu du fichier ne correspond pas au type déclaré." });
    }

    const { nom, type, boatId } = req.body;
    if (!nom || !type) {
      if (!isProduction && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "nom et type sont obligatoires." });
    }

    if (boatId) {
      const boat = await Boat.findByPk(boatId);
      if (!boat) {
        if (!isProduction && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Bateau introuvable" });
      }
      if (boat.userId !== req.user.id && req.user.role !== "admin") {
        if (!isProduction && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: "Accès interdit" });
      }
    }

    let fileUrl;
    if (isProduction) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "sailingloc/documents", resource_type: "raw", public_id: `doc-${req.user.id}-${Date.now()}` },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        uploadStream.end(req.file.buffer);
      });
      fileUrl = result.secure_url;
    } else {
      fileUrl = req.file.filename;
    }

    const document = await Document.create({
      nom, type, url: fileUrl,
      boatId: boatId || null,
      userId: req.user.id,
      statutValidation: "en_attente",
    });

    return res.status(201).json({ message: "Document ajouté avec succès", document });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ message: "Mes documents récupérés avec succès", documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDocumentsByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;
    const boat = await Boat.findByPk(boatId);
    if (!boat) return res.status(404).json({ message: "Bateau introuvable" });
    if (!canAccessBoatDocuments(boat, req.user)) return res.status(403).json({ message: "Accès interdit" });
    const documents = await Document.findAll({ where: { boatId }, order: [["createdAt", "DESC"]] });
    return res.status(200).json({ message: "Documents récupérés avec succès", documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) return res.status(404).json({ message: "Document introuvable" });
    if (!canAccessDocument(document, req.user)) {
      return res.status(403).json({ message: "Accès interdit" });
    }
    if (!document.url) return res.status(404).json({ message: "Fichier introuvable" });

    // En production → retourne l'URL JSON (pas de redirect → évite CORS avec credentials)
    if (isProduction && document.url.startsWith("http")) {
      return res.status(200).json({ url: document.url });
    }

    // En local → sert le fichier
    const filePath = path.join(DOCUMENTS_DIR, document.url);
    if (!filePath.startsWith(DOCUMENTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    const ext = path.extname(document.url).toLowerCase();
    const mimeTypes = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.nom)}${ext}"`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.validateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { statutValidation, commentaireAdmin } = req.body;
    if (req.user.role !== "admin") return res.status(403).json({ message: "Accès interdit" });
    const document = await Document.findByPk(id);
    if (!document) return res.status(404).json({ message: "Document introuvable" });
    if (!["valide", "refuse"].includes(statutValidation)) {
      return res.status(400).json({ message: "Statut invalide." });
    }
    await document.update({ statutValidation, commentaireAdmin });
    return res.status(200).json({ message: "Statut du document mis à jour", document });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPendingDocuments = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Accès réservé à l'admin" });
    const documents = await Document.findAll({
      where: { statutValidation: "en_attente" },
      include: [{ model: User, attributes: ["id", "nom", "prenom", "email", "role"] }],
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({ documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) return res.status(404).json({ message: "Document introuvable" });
    if (document.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    if (isProduction && document.url?.startsWith("http")) {
      try {
        const publicId = document.url.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`sailingloc/documents/${publicId}`, { resource_type: "raw" });
      } catch {}
    } else if (!isProduction) {
      const filePath = path.join(DOCUMENTS_DIR, document.url);
      if (filePath.startsWith(DOCUMENTS_DIR) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await document.destroy();
    return res.status(200).json({ message: "Document supprimé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};