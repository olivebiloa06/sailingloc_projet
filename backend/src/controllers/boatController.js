const { Boat, User } = require("../models");

// Ajouter un bateau
exports.createBoat = async (req, res) => {
  try {
    const {
      nom,
      type,
      description,
      localisation,
      prixJour,
      capacite,
      longueur,
      avecSkipper,
      imageUrl,
    } = req.body;

    const boat = await Boat.create({
      nom,
      type,
      description,
      localisation,
      prixJour,
      capacite,
      longueur,
      avecSkipper,
      imageUrl,
      statut: "publie",
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Bateau créé avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir tous les bateaux
exports.getAllBoats = async (req, res) => {
  try {
    const boats = await Boat.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nom", "prenom", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Liste des bateaux récupérée avec succès",
      boats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Voir détail bateau
exports.getBoatById = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "nom", "prenom", "email", "role"],
        },
      ],
    });

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    return res.status(200).json({
      message: "Détail du bateau récupéré avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Modifier un bateau
exports.updateBoat = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
      });
    }

    await boat.update(req.body);

    return res.status(200).json({
      message: "Bateau modifié avec succès",
      boat,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Supprimer un bateau
exports.deleteBoat = async (req, res) => {
  try {
    const { id } = req.params;

    const boat = await Boat.findByPk(id);

    if (!boat) {
      return res.status(404).json({
        message: "Bateau introuvable",
      });
    }

    if (boat.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Accès interdit : vous n’êtes pas propriétaire de ce bateau",
      });
    }

    await boat.destroy();

    return res.status(200).json({
      message: "Bateau supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};