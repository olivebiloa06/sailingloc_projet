const { Op } = require("sequelize");
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
      latitude,
      longitude,
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
      latitude,
      longitude,
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

/// Voir tous les bateaux + recherche avancée
exports.getAllBoats = async (req, res) => {
  try {
    const {
      localisation,
      type,
      minPrice,
      maxPrice,
      capacite,
      avecSkipper,
      search,
    } = req.query;

    const filters = {};

    if (localisation) {
      filters.localisation = {
        [Op.iLike]: `%${localisation}%`,
      };
    }

    if (type) {
      filters.type = type;
    }

    if (capacite) {
      filters.capacite = {
        [Op.gte]: Number(capacite),
      };
    }

    if (avecSkipper !== undefined) {
      filters.avecSkipper = avecSkipper === "true";
    }

    if (minPrice || maxPrice) {
      filters.prixJour = {};

      if (minPrice) {
        filters.prixJour[Op.gte] = Number(minPrice);
      }

      if (maxPrice) {
        filters.prixJour[Op.lte] = Number(maxPrice);
      }
    }

    if (search) {
      filters[Op.or] = [
        {
          nom: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          localisation: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const boats = await Boat.findAll({
      where: filters,
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
      total: boats.length,
      filters: req.query,
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