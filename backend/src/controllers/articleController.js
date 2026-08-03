const { Article } = require("../models");

// =========================
// LISTE PUBLIQUE DES ARTICLES PUBLIÉS
// =========================
exports.getPublishedArticles = async (req, res) => {
  try {
    const { categorie } = req.query;

    const where = { publie: true };
    if (categorie) where.categorie = categorie;

    const articles = await Article.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ articles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// DÉTAIL D'UN ARTICLE (public)
// =========================
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article || !article.publie) {
      return res.status(404).json({ message: "Article introuvable" });
    }

    return res.status(200).json({ article });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ADMIN — TOUS LES ARTICLES (publiés + brouillons)
// =========================
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ articles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ADMIN — CRÉER UN ARTICLE
// =========================
exports.createArticle = async (req, res) => {
  try {
    const { titre, categorie, extrait, contenu, lienBoats, tempsLecture, publie } = req.body;

    if (!titre || !categorie || !extrait || !contenu) {
      return res.status(400).json({
        message: "titre, categorie, extrait et contenu sont obligatoires.",
      });
    }

    const article = await Article.create({
      titre,
      categorie,
      extrait,
      contenu,
      lienBoats: lienBoats || "/boats",
      tempsLecture: tempsLecture || "5 min",
      publie: Boolean(publie),
    });

    return res.status(201).json({
      message: "Article créé avec succès",
      article,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ADMIN — MODIFIER UN ARTICLE
// =========================
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }

    const { titre, categorie, extrait, contenu, lienBoats, tempsLecture, publie } = req.body;

    await article.update({
      titre: titre ?? article.titre,
      categorie: categorie ?? article.categorie,
      extrait: extrait ?? article.extrait,
      contenu: contenu ?? article.contenu,
      lienBoats: lienBoats ?? article.lienBoats,
      tempsLecture: tempsLecture ?? article.tempsLecture,
      publie: publie !== undefined ? Boolean(publie) : article.publie,
    });

    return res.status(200).json({
      message: "Article mis à jour",
      article,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================
// ADMIN — SUPPRIMER UN ARTICLE
// =========================
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }

    await article.destroy();

    return res.status(200).json({ message: "Article supprimé" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};