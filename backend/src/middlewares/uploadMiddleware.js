const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const UPLOADS_ROOT = path.join(__dirname, "../../uploads");
const BOAT_IMAGES_DIR = path.join(UPLOADS_ROOT, "boats");
const DOCUMENTS_DIR = path.join(UPLOADS_ROOT, "documents");

// En production, on utilise Cloudinary
// En développement local, on garde le disque local
const isProduction = process.env.NODE_ENV === "production" && process.env.CLOUDINARY_CLOUD_NAME;

if (isProduction) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Crée les dossiers locaux si nécessaire
  fs.mkdirSync(BOAT_IMAGES_DIR, { recursive: true });
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

const makeStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

const cloudinaryBoatStorage = isProduction
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "sailingloc/boats",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
      },
    })
  : makeStorage(BOAT_IMAGES_DIR);

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format de fichier non autorisé (image attendue)"), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp",
    "application/pdf", "application/octet-stream",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non autorisé. Acceptés : PDF, JPG, PNG."), false);
  }
};

// Upload de photo de bateau
const uploadBoatImage = multer({
  storage: cloudinaryBoatStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload de document personnel (toujours en local — documents sensibles)
const uploadDocument = multer({
  storage: makeStorage(DOCUMENTS_DIR),
  fileFilter: documentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadBoatImage,
  uploadDocument,
  BOAT_IMAGES_DIR,
  DOCUMENTS_DIR,
  cloudinary,
};