const { Favorite, Boat, User } = require("../models");

// Lister les favoris de l'utilisateur connecté
exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Boat, include: [{ model: User, attributes: ["prenom", "nom"] }] }],
    });
    return res.status(200).json({ favorites });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Ajouter ou retirer un favori (toggle)
exports.toggleFavorite = async (req, res) => {
  try {
    const { boatId } = req.body;
    if (!boatId) return res.status(400).json({ message: "boatId requis." });

    const existing = await Favorite.findOne({ where: { userId: req.user.id, boatId } });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({ liked: false });
    }

    await Favorite.create({ userId: req.user.id, boatId });
    return res.status(201).json({ liked: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Vérifier si un bateau est en favori
exports.checkFavorite = async (req, res) => {
  try {
    const { boatId } = req.params;
    const exists = await Favorite.findOne({ where: { userId: req.user.id, boatId } });
    return res.status(200).json({ liked: !!exists });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};