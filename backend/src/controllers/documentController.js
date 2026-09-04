const fs = require("fs");
const path = require("path");
const { Document, Boat, User } = require("../models");
const { isFileSignatureValid } = require("../utils/fileSignature");
const { DOCUMENTS_DIR, cloudinary } = require("../middlewares/uploadMiddleware");

const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

const MIME_TO_EXT = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Sans extension explicite, Cloudinary stocke un fichier "raw" sans savoir
// le typer : l'URL de livraison ne se termine par aucun .pdf/.jpg, donc le
// navigateur ne sait ni l'afficher ni proposer le bon lecteur au
// téléchargement (le fichier arrive bien, juste sans extension). On déduit
// l'extension du mimetype déclaré, avec l'extension du nom de fichier
// original en secours.
function extensionFromFile(file) {
  return MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).slice(1).toLowerCase() || undefined;
}

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
          {
            folder: "sailingloc/documents",
            resource_type: "raw",
            public_id: `doc-${req.user.id}-${Date.now()}`,
            format: extensionFromFile(req.file),
          },
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

    const download = req.query.download === "1";

    // En production → retourne l'URL JSON (pas de redirect → évite CORS avec credentials).
    // Cloudinary bloque par défaut l'accès direct aux PDF/ZIP livrés en resource_type "raw"
    // (restriction de sécurité activée par défaut sur les comptes récents) : on doit donc
    // signer l'URL pour que Cloudinary l'autorise, sinon le navigateur reçoit un 401.
    if (isProduction && document.url.startsWith("http")) {
      const lastSegment = document.url.split("/").slice(-1)[0];
      const publicId = lastSegment.split(".")[0];
      const ext = path.extname(lastSegment).slice(1);
      const signedUrl = cloudinary.url(`sailingloc/documents/${publicId}`, {
        resource_type: "raw",
        type: "upload",
        format: ext || undefined,
        sign_url: true,
        secure: true,
        flags: download ? "attachment" : undefined,
      });
      // Sans ça, le navigateur peut mettre en cache cette réponse JSON (via
      // l'ETag qu'Express génère par défaut) et renvoyer un 304 sans corps
      // sur un appel suivant identique — le front reçoit alors un JSON vide
      // et n'a jamais l'URL signée à charger (onglet qui reste blanc).
      res.set("Cache-Control", "no-store");
      return res.status(200).json({ url: signedUrl });
    }

    // En local → sert le fichier
    const filePath = path.join(DOCUMENTS_DIR, document.url);
    if (!filePath.startsWith(DOCUMENTS_DIR) || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    const ext = path.extname(document.url).toLowerCase();
    const mimeTypes = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(document.nom)}${ext}"`);
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