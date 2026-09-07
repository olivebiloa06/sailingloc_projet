const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");
const { uploadBoatImage, uploadBoatGallery } = require("../middlewares/uploadMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post(
  "/boat/:boatId",
  verifyToken,
  uploadBoatImage.single("image"),
  uploadController.uploadBoatImage
);

router.delete(
  "/boat/:boatId",
  verifyToken,
  uploadController.deleteBoatImage
);

router.post(
  "/boat/:boatId/gallery",
  verifyToken,
  uploadBoatGallery.array("images", 8),
  uploadController.uploadBoatGalleryImages
);

router.delete(
  "/boat/:boatId/gallery/:imageId",
  verifyToken,
  uploadController.deleteBoatGalleryImage
);

module.exports = router;