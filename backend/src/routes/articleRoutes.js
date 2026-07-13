const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Routes publiques (page Inspiration visible par tous)
router.get("/", articleController.getPublishedArticles);
router.get("/:id", articleController.getArticleById);

// Routes admin uniquement
router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("admin"),
  articleController.getAllArticles
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  articleController.createArticle
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  articleController.updateArticle
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  articleController.deleteArticle
);

module.exports = router;