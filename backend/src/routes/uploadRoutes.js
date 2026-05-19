const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");
const upload = require("../middlewares/uploadMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post(
  "/boat/:boatId",
  verifyToken,
  upload.single("image"),
  uploadController.uploadBoatImage
);

router.delete(
  "/boat/:boatId",
  verifyToken,
  uploadController.deleteBoatImage
);

module.exports = router;