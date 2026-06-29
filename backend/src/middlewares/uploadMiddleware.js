const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOADS_ROOT = path.join(__dirname, "../../uploads");
const BOAT_IMAGES_DIR = path.join(UPLOADS_ROOT, "boats");
const DOCUMENTS_DIR = path.join(UPLOADS_ROOT, "documents");

// Les deux dossiers ont des règles d'accès totalement différentes :
// - uploads/boats  -> servi en statique, public (photos de bateaux)
// - uploads/documents -> JAMAIS servi en statique, accessible uniquement via
//   GET /api/documents/:id/file après vérification d'authentification et de
//   propriété (voir documentController). C'est ce deuxième dossier qui était
//   exposé publiquement avant correction (permis bateau, pièce d'identité...).
fs.mkdirSync(BOAT_IMAGES_DIR, { recursive: true });
fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });

const makeStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format de fichier non autorisé (image attendue)"), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  // Sur Windows, les PDF sont parfois envoyés avec mimetype
  // "application/octet-stream" — on accepte ce cas et on laisse
  // isFileSignatureValid (magic bytes) faire la vraie vérification de contenu.
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/octet-stream",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non autorisé. Acceptés : PDF, JPG, PNG."), false);
  }
};

// Upload de photo de bateau (public)
const uploadBoatImage = multer({
  storage: makeStorage(BOAT_IMAGES_DIR),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Upload de document personnel (privé — permis, pièce d'identité, assurance...)
const uploadDocument = multer({
  storage: makeStorage(DOCUMENTS_DIR),
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  uploadBoatImage,
  uploadDocument,
  BOAT_IMAGES_DIR,
  DOCUMENTS_DIR,
};